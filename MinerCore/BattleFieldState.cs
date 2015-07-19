using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class BattleFieldState
    {
        private int _sizeX, _sizeY;
         private FieldTile[,] _field;

         public BattleFieldState(int sizeX, int sizeY)
        {
             _sizeX = sizeX + 2;
             _sizeY = sizeY + 2;

            _field = new FieldTile[_sizeY, _sizeX];
            for (int y = 0; y < _sizeY; y++)
                for (int x = 0; x < _sizeX; x++)
                {
                    _field[y, x] = new FieldTile();

                    if (x == 0 || y == 0 || x == _sizeX - 1 || y == _sizeY - 1)
                    {
                        _field[y, x].ViewState = TileViewState.Unused;
                    }
                    else
                    {
                        _field[y, x].ViewState = TileViewState.Closed;
                    }

                    _field[y, x].DemoState = TileDemoState.Clear;
                }
            
        }

        public FieldTile this[int y, int x]
        {
            get 
            {
                var realX = x + 1;
                var realY = y + 1;
                return _field[realY, realX];
            }
            set
            {
                var realX = x + 1;
                var realY = y + 1;

                _field[realY, realX] = value;
            }

        }

        public int SizeX { get { return _sizeX - 2; } }

        public int SizeY { get { return _sizeY - 2; } }
    }
}
