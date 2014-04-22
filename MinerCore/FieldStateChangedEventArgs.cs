using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class FieldStateChangedEventArgs : EventArgs
    {
        public BattleFieldSnapshot Snapshot { get; set; }

        public int FlagsRemain { get; set; }

    }
}
