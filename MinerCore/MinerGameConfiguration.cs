using PlainValley.Games;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class MinerGameConfiguration : GameConfiguration
    {
        public int BombsCount { get; set; }

        public int SizeX { get; set; }

        public int SizeY { get; set; }

        public int PlayerLifeCount { get; set; }

        public MinerGameConfiguration()
        {

        }
    }
}
