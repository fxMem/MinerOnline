using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public struct MinerPlayerUpdateInfo
    {
        public BattleFieldSnapshot Snapshot { get; set; }

        public string Nickname { get; set; }

        public int FlagsRemain { get; set; }
    }
}
