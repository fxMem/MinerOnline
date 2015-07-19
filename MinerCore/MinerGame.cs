using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PlainValley.Games;
using PlainValley.Messaging;
using System.Diagnostics;
using PlainValley.Messaging.Chat;

namespace MinerCore
{
    public struct GameResult
    {
        public MinerPlayer Player { get; set; }

        public PlayerResult Result { get; set; }

        public TimeSpan ElapsedTime { get; set; }

        public int LifesLost { get; set; }
    }

    public class MinerGame : Session
    {

        private ConcurrentDictionary<MinerPlayer, BattleField> _fields;

        private ConcurrentCollection<GameResult> _results;

        private BattleFieldParams _params;
		private BattleFieldParams Params
		{
			get
			{
				if (_params == null)
				{
					var genericConfig = GameConfiguration as MinerGameConfiguration;
					_params = new BattleFieldParams(genericConfig.PlayerLifeCount, genericConfig.BombsCount, genericConfig.SizeX, genericConfig.SizeY);
				}

				return _params;
			}
		}

		
        public MinerGame()
        {
            _fields = new ConcurrentDictionary<MinerPlayer, BattleField>();
            _results = new ConcurrentCollection<GameResult>();
        }

		protected override Player onPlayerEnter(IUserInfo info, PlayerConfiguration playerConfiguration)
		{
			var player = addNewPlayer(info);
			return player;
		}

        async protected override void onPlayerLeave(Player player)
        {
			var genericPlayer = (MinerPlayer)player;
			var result = new GameResult { Player = genericPlayer, Result = PlayerResult.Fail };

            disablePlayerWithResult(result);
            await checkGameFinished();
        }

        protected override void onGameStarted()
        {
            foreach (var item in _fields)
            {
                var field = item.Value;
                field.StartGame();
            }
        }

        protected override void onGameStopped()
        {
			onSessionCanBeDispoosed();
        }

       
        private MinerPlayer addNewPlayer(IUserInfo info)
        {
            var battleField = new BattleField(Params);
            var player = new MinerPlayer(info, battleField);

            battleField.PlayerFinished += playerFinished;
            battleField.FieldStateChanged += (s, args) => { updateGameState(player, args.Snapshot, args.FlagsRemain); };

            _fields.TryAdd(player, battleField);

            return player;
        }

        async private void updateGameState(MinerPlayer player, BattleFieldSnapshot snapshot, int flagsRemain)
        {
            //printSnapshot(snapshot);
            var updateInfo = new MinerPlayerUpdateInfo{Snapshot = snapshot, FlagsRemain = flagsRemain, Nickname = player.Info.Nickname};
            var gameInfo = new MinerUpdateData() { Info = new List<MinerPlayerUpdateInfo>() { updateInfo } };

            var info = GlobalUpdateInfo.Create(gameInfo);
            await UpdateGameState(info);
            //gameStateChanged(gameInfo);
        }

        private void printSnapshot(BattleFieldSnapshot snapshot)
        {
            for (int y = 0; y < snapshot.SizeY; y++)
            {
                for (int x = 0; x < snapshot.SizeX; x++)
                {
                    Debug.Write(snapshot.States[y, x] + " ");
                }

                Debug.Write(Environment.NewLine);
            }
        }

        async private void playerFinished(object sender, PlayerFinishedEventArgs args)
        {
            var result = new GameResult 
            { 
                ElapsedTime = args.ElapsedTime, 
                Player = args.Player, 
                LifesLost = args.LifesLost, 
                Result = args.Result 
            };

            var finalData = new PlayerFinishedData() { Bombs = args.Bombs, ElapsedTime = args.ElapsedTime, LifesLost = args.LifesLost, Result = args.Result, PlayerNickname = args.Player.Info.Nickname };

			await playerFinished(finalData, result);
        }

		async private Task playerFinished(PlayerFinishedData data, GameResult result)
		{
			var finalDataContainer = new EndGameUpdateData(data);

			var info = GlobalUpdateInfo.Create(finalDataContainer);
			await UpdateGameState(info);

			//args.Bombs
			disablePlayerWithResult(result);
			await checkGameFinished();
		}

        private void disablePlayerWithResult(GameResult result)
        {
            _results.Add(result);
        }
        
        async private Task checkGameFinished()
        {
            var winners = _results.Where(r => r.Result == PlayerResult.Complete).ToList();
            if (winners.Count == 1)
            {
                // У нас есть победитель
                await declareWinner(winners.First());
            }
            else
            {
                if (_results.Count == _fields.Count)
                {
                    // Все проиграли - ничья
                    await declareDraw();
                }

                // Не все закончили, ждем
            }

        }

        async private Task declareWinner(GameResult winner)
        {
            var score = new MinerScore { IsDraw = false, WinnerNickName = winner.Player.Info.Nickname, GameTime = winner.ElapsedTime };

            await UpdateGameState(GlobalUpdateInfo.Create(score));
            await Stop();
        }

        async private Task declareDraw()
        {
            var score = new MinerScore { IsDraw = true, GameTime = _results.First().ElapsedTime };

            await UpdateGameState(GlobalUpdateInfo.Create(score));
            await Stop();
        }

        
    }
}
