using PlainValley.Games;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public enum PlayerResult
    {
        Complete = 0,
        Fail
    }

    public class PlayerFinishedEventArgs : EventArgs
    {
        public MinerPlayer Player { get; set; }

        public PlayerResult Result { get; set; }

        public TimeSpan ElapsedTime { get; set; }

        public int LifesLost { get; set; }

        public IEnumerable<TileCoordinates> Bombs { get; set; }

    }
}
