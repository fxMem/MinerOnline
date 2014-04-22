using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public enum PlayerResult
    {
        Complete,
        Fail
    }

    public class PlayerFinishedEventArgs : EventArgs
    {
        public Player Player { get; set; }

        public PlayerResult Result { get; set; }

        public TimeSpan ElapsedTime { get; set; }

        public IEnumerable<TileCoordinates> Bombs { get; set; }

    }
}
