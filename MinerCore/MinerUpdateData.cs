using PlainValley.Games;
using PlainValley.Messaging;
using PlainValley.Messaging.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MinerCore
{
    public class MinerUpdateData : UpdateData
    {
        public List<MinerPlayerUpdateInfo> Info { get; set; }
    }
}
