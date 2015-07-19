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
        //public TileSnapshot[,] Tiles;

        public int[,] BombCounts { get; set; }

        public int[,] States { get; set; }

        private int _xN;

        private int _yN;

        public BattleFieldSnapshot(BattleFieldState tiles, NearBombsCounter bombCounter)
        {
            _xN = tiles.SizeX;
            _yN = tiles.SizeY;

            var ySize = tiles.SizeY;
            var xSize = tiles.SizeX;
            //Tiles = new TileSnapshot[ySize, xSize];
            BombCounts = new int[ySize, xSize];
            States = new int[ySize, xSize];

            for (int y = 0; y < ySize; y++)
                for (int x = 0; x < xSize; x++)
                {
                    var currentTile = tiles[y, x];
                    //Tiles[y, x] = new TileSnapshot 
                    //{ 
                    //    State = currentTile.ViewState, 
                    //    NearestBombCount = bombCounter[y, x]
                    //};

                    BombCounts[y, x] = bombCounter[y, x];
                    States[y, x] = (int)currentTile.ViewState;
                }
        }
 
        //public TileSnapshot this[int y, int x]
        //{
        //    get { return Tiles[y, x]; }
        //}

        public int SizeX { get { return _xN; } }

        public int SizeY { get { return _yN; } }

    }
}
