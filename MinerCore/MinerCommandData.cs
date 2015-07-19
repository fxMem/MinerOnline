using PlainValley.Games;
using PlainValley.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public enum MinerCommand
	{
        GetConfig = 0
	}

    public class MinerCommandData : ActionData
    {
        public MinerCommand Command { get; set; }
    }
}
