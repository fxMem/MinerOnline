using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{

    public struct TileSnapshot
    {
        public TileViewState State { get; set; }

        public int? NearestBombCount { get; set; }
    }

    public class BattleFieldSnapshot
    {
        private TileSnapshot[,] _tiles;

        private int _xN;

        private int _yN;

        public BattleFieldSnapshot(BattleFieldState tiles, NearBombsCounter bombCounter)
        {
            _xN = tiles.SizeX;
            _yN = tiles.SizeY;

            var ySize = tiles.SizeY;
            var xSize = tiles.SizeX;
            _tiles = new TileSnapshot[ySize, xSize];

            for (int y = 0; y < ySize; y++)
                for (int x = 0; x < xSize; x++)
                {
                    var currentTile = tiles[y, x];
                    _tiles[y, x] = new TileSnapshot 
                    { 
                        State = currentTile.ViewState, 
                        NearestBombCount = bombCounter[y, x]
                    };
                }
        }
 
        public TileSnapshot this[int y, int x]
        {
            get { return _tiles[y, x]; }
        }

        public int SizeX { get { return _xN; } }

        public int SizeY { get { return _yN; } }

    }
}
