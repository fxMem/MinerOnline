using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public enum TileViewState : int
    {
        Opened = 0,
        Closed = 1,
        Flagged = 2,
        Explosed = 3,
        Unused
    }

    public enum TileDemoState
    {
        HasBomb,
        Clear
    }


    public class FieldTile
    {
        public TileViewState ViewState { get; set; }

        public TileDemoState DemoState { get; set; }
    }

    public struct TileCoordinates
    {
        public int X { get; set; }

        public int Y { get; set; }

        public TileCoordinates(int x, int y)
            :this()
        {
            X = x;
            Y = y;
        }
    }
}
