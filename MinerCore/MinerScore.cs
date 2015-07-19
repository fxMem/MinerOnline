using PlainValley.Games;
using PlainValley.Messaging;
using PlainValley.Messaging.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class MinerScore : UpdateData
    {
        public bool IsDraw { get; set; }

        public string WinnerNickName { get; set; }

        public TimeSpan GameTime { get; set; }
    }
}
