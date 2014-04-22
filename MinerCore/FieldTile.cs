using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public enum TileViewState
    {
        Opened,
        Closed,
        Flagged,
        Unused
    }

    public enum TileDemoState
    {
        HasBomb,
        CLear
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
