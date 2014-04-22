using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace MinerCore
{
    enum ProbeResult
    {
        // Игрок выбрал поле с бомбой, и жизней больше нет. Проигрыш
        Fail,

        // Игрок выбрал поле с бомбой, но еще остались жизни
        Explosed,

        // Игрок не взорвался
        Good
    }

    public class BattleField
    {
        private NearBombsCounter _bombCounter;

        private BattleFieldState _field;

        private BattleFieldParams _fieldParams;

        private int _remainsBombCount;

        private int _remainsFlagCount;

        private int _remainsLifesCount;

        private DateTime _startGameTime;

        private bool _gameInProcess;

        public BattleField(Player player, BattleFieldParams fieldParams)
        {
            Owner = player;
            _fieldParams = fieldParams;
        }

        public void StartGame()
        {
            _startGameTime = DateTime.Now;
            _gameInProcess = true;

            _remainsBombCount = _fieldParams.BombsCount;
            _remainsFlagCount = _fieldParams.BombsCount;
            _remainsLifesCount = _fieldParams.PlayerLifeCount;

            generateField();
        }

        public Player Owner { get; private set; }

        public int RemainsBombsCount { get { return _remainsBombCount; } }

        public int RemainsFlagsCount { get { return _remainsFlagCount; } }

        public int SizeX { get { return _fieldParams.SizeX; } }

        public int SizeY { get { return _fieldParams.SizeY; } }

        //public EventHandler<FieldStateChangedEventArgs> FieldStateChanged;

        public event EventHandler<FieldStateChangedEventArgs> FieldStateChanged;

        public event EventHandler<PlayerFinishedEventArgs> PlayerFinished;

        public void Probe(int x, int y)
        {
            isInGameCheck();
            checkRange(x, y);

            var selectedTile = _field[y, x];
            if (!selectedTile.HasViewState(TileViewState.Closed))
            {
                throw new ArgumentOutOfRangeException("You can probe only Closed tiles");
            }

            if (probeTile(x, y) == ProbeResult.Fail)
            {
                // Игра закончена. Игрок попал на бомбу
                return;
            }

            // Мы не попали на бомбу. Открываем доступные ячейки
            openZoneWithCenter(x, y);

            // Поле обновилось. Оповещаем клиент
            OnFieldStateChanged();
        }

        public void SetOrUnsetFlag(int x, int y)
        {
            if (!_field[y, x].HasViewState(TileViewState.Flagged))
            {
                SetFlag(x, y);
            }
            else
            {
                UnSetFlag(x, y);
            }
        }

        public void SetFlag(int x, int y)
        {
            isInGameCheck();
            checkRange(x, y);

            if (_remainsFlagCount < 1)
            {
                throw new InvalidOperationException("Don't have enough flags to set!");
            }

            var selectedTile = _field[y, x];
            selectedTile.SetFlag();

            _remainsFlagCount--;
            if (selectedTile.HasBomb())
            {
                _remainsBombCount--;
            }

            // Поле обновилось. Оповещаем клиент
            OnFieldStateChanged();

            checkGameFinished();
        }

        public void UnSetFlag(int x, int y)
        {
            isInGameCheck();
            checkRange(x, y);

            var selectedTile = _field[y, x];
            selectedTile.UnSetFlag();

            _remainsFlagCount++;
            if (selectedTile.HasBomb())
            {
                _remainsBombCount++;
            }

            // Поле обновилось. Оповещаем клиент
            OnFieldStateChanged();
        }

        public void Detect(int x, int y)
        {
            isInGameCheck();
            checkRange(x, y);

            var selectedTile = _field[y, x];

            if (!selectedTile.HasViewState(TileViewState.Opened))
            {
                throw new ArgumentOutOfRangeException("Can't detect mine on non-opened tile.");
            }

            var nearestTiles = getNearestTilesWithState(x, y, TileViewState.Closed);
            foreach (var tileCoords in nearestTiles)
            {
                if (probeTile(tileCoords.X, tileCoords.Y) == ProbeResult.Fail)
                {
                    // Проигрыш. Дальше перебирать бессмысленно.
                    return;
                }
                else
                {
                    openZoneWithCenter(tileCoords.X, tileCoords.Y);
                }
            }
            // Поле обновилось. Оповещаем клиент
            OnFieldStateChanged();

        }
        
        /// <summary>
        /// Операция проверки единственной(!) клетки
        /// </summary>
        /// <param name="tile"></param>
        /// <returns></returns>
        private ProbeResult probeTile(int x, int y)
        {
            var tile = _field[y, x];

            // Игрок выбрал поле с бомбой
            if (tile.HasBomb())
            {
                return GotExplosed(tile);
            }

            tile.ViewState = TileViewState.Opened;

            return ProbeResult.Good;
        }


        private void openZoneWithCenter(int x, int y)
        {
            var sourceTile = _field[y, x];

            if (_bombCounter[y, x] == 0)
            {
                foreach (var tile in FieldHelper.EnumerateNearestTilesCoordinates(x, y))
                {
                    var currentTile = _field[tile.Y, tile.X];

                    if (currentTile.HasViewState(TileViewState.Closed))
                    {
                        currentTile.OpenTile();
                        if (_bombCounter[tile.Y, tile.X] == 0)
                        {
                            openZoneWithCenter(tile.X, tile.Y);
                        }
                    }
                }

            }
            
        }

        private void generateField()
        {
            var maxNumberX = _fieldParams.SizeX - 1;
            var maxNumberY = _fieldParams.SizeY - 1;

            var randGenerator = new Random();
            _field = new BattleFieldState(_fieldParams.SizeY, _fieldParams.SizeX);
            _bombCounter = new NearBombsCounter(_fieldParams.SizeY, _fieldParams.SizeX);
            
            _remainsBombCount = _fieldParams.BombsCount;
            
            for (int bombNumber = 0; bombNumber < _fieldParams.BombsCount; bombNumber++)
            {
                while (true)
                {
                    var xBombCoord = randGenerator.Next(maxNumberX);
                    var yBombCoord = randGenerator.Next(maxNumberY);
                    var selectedTile = _field[yBombCoord, xBombCoord];

                    if (!selectedTile.HasBomb())
                    {
                        // Отмечается постановка бомбы в списке ячеек
                        selectedTile.SetBomb();

                        // Счетчик бомб в соседних клетках
                        _bombCounter.SetBomb(xBombCoord, yBombCoord);
                        break;
                    }
                }
            }

        }

        private ProbeResult GotExplosed(FieldTile tile)
        {
            if (_remainsLifesCount == 0)
            {
                // Жизни закончились, проигрыш
                FinishGame(PlayerResult.Fail);
                return ProbeResult.Fail;
            }
            else
            {
                tile.ViewState = TileViewState.Explosed;

                _remainsBombCount--;
                _remainsLifesCount--;

                checkGameFinished();
                return ProbeResult.Good;
            }
        }

        private void FinishGame(PlayerResult result)
        {
            _gameInProcess = false;
            OnPlayerFinished(result);
        }

        /// <summary>
        /// Возвращает ближайшие клетки, состояние которых совпадает с указанным
        /// </summary>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="state">Эти клетки будут учитываться</param>
        /// <returns></returns>
        private List<TileCoordinates> getNearestTilesWithState(int x, int y, params TileViewState[] states)
        {
            var temp = new List<TileCoordinates>();
            Action<TileCoordinates> addTileIfSuitable = (tileCoords) =>
            {
                var tile = _field[tileCoords.Y, tileCoords.X];
                if (states.Contains(tile.ViewState))
                {
                    temp.Add(tileCoords);
                }
            };

            foreach (var tileCoords in FieldHelper.EnumerateNearestTilesCoordinates(x, y))
            {
                addTileIfSuitable(tileCoords);
            }
            //for (int x_i = -1; x_i <= 1 ; x_i++)
            //    for (int y_i = -1; y_i <= 1; y_i++)
            //    {
            //        if (!(x_i == 0 && y_i == 0))
            //        addTileIfSuitable(y + y_i, x + x_i);
            //    }

            return temp;
        }

        private BattleFieldSnapshot getSnapshot()
        {
            return new BattleFieldSnapshot(_field, _bombCounter);
        }

        private void isInGameCheck()
        {
            if (!_gameInProcess)
            {
                throw new InvalidOperationException("Game already finished.");
            }
        }


        private void checkGameFinished()
        {
            if (_remainsBombCount == 0)
            {
                // Все бомбы найдены

                // Игрок завершил игру
                FinishGame(PlayerResult.Complete);
            }
        }

        private void checkRange(int x, int y)
        {
            if (x < 0 || x >= SizeX)
            {
                throw new ArgumentOutOfRangeException(string.Format("Your x value must be in range [0 , {0}) (Given {1})", SizeX, x));
            }

            if (y < 0 || y >= SizeY)
            {
                throw new ArgumentOutOfRangeException(string.Format("Your y value must be in range [0 , {0}) (Given {1})", SizeY, y));
            }
        }

        protected void OnFieldStateChanged()
        {
            var snapshot = getSnapshot();
            var temp = FieldStateChanged;

            if (temp != null)
            {
                temp(this, new FieldStateChangedEventArgs { Snapshot = snapshot, FlagsRemain = _remainsFlagCount });
            }
        }

        protected void OnPlayerFinished(PlayerResult result)
        {
            var temp = PlayerFinished;
            var playerTime = DateTime.Now - _startGameTime;
            var bombs = new List<TileCoordinates>();

            for (int y = 0; y < SizeY; y++)
                for (int x = 0; x < SizeX; x++)
                {
                    if (_field[y, x].HasBomb())
                    {
                        bombs.Add(new TileCoordinates(x, y));
                    }
                }

            if (temp != null)
            {
                temp(this, new PlayerFinishedEventArgs 
                { 
                    ElapsedTime = playerTime, 
                    Result = result, 
                    Player = Owner,
                    Bombs = bombs
                });
            }
        }

    }

    static class FieldHelper
    {
        public static void SetBomb(this FieldTile tile)
        {

            if (!tile.HasViewState(TileViewState.Closed))
            {
                throw new ArgumentOutOfRangeException("Can set bomb only on closed tile!");
            }

            if (tile.HasBomb())
            {
                throw new ArgumentOutOfRangeException("Tile already has bomb on it!");
            }

            tile.DemoState = TileDemoState.HasBomb;
        }

        public static void SetFlag(this FieldTile tile)
        {
            if (!tile.HasViewState(TileViewState.Closed))
            {
                throw new ArgumentOutOfRangeException("Can set flag only on closed tile!");
            }

            tile.ViewState = TileViewState.Flagged;
        }

        public static void OpenTile(this FieldTile tile)
        {
            // Нужно ли?
            //if (!tile.HasViewState(TileViewState.Closed))
            //{
            //    throw new ArgumentOutOfRangeException("Can't open non-closed tile!");
            //}

            tile.ViewState = TileViewState.Opened;
        }

        public static void UnSetFlag(this FieldTile tile)
        {
            if (!tile.HasViewState(TileViewState.Flagged))
            {
                throw new ArgumentOutOfRangeException("Can't unset flag: selected tile doesn't flagged");
            }

            tile.ViewState = TileViewState.Closed;
        }

        public static bool HasViewState(this FieldTile tile, TileViewState state)
        {
            if (tile.ViewState == state)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public static bool HasBomb(this FieldTile tile)
        {
            if (tile.DemoState == TileDemoState.HasBomb)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public static IEnumerable<TileCoordinates> EnumerateNearestTilesCoordinates(int x, int y)
        {
            for (int y_i = -1; y_i <= 1; y_i++)
                for (int x_i = -1; x_i <= 1; x_i++)
                {
                    if (!(y_i == 0 && x_i == 0))
                        yield return new TileCoordinates(x + x_i, y + y_i);
                }
        }

    }
}
