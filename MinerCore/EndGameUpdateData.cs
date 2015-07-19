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
    public class PlayerFinishedData
    {
        public string PlayerNickname { get; set; }

        public TimeSpan ElapsedTime { get; set; }

        public int LifesLost { get; set; }

        public IEnumerable<TileCoordinates> Bombs { get; set; }
		
        public PlayerResult Result { get; set; }
    }

    public class EndGameUpdateData : UpdateData
    {
        public EndGameUpdateData(PlayerFinishedData data = null) 
        {
            Info = new List<PlayerFinishedData>();
            Info.Add(data);
        }

        public List<PlayerFinishedData> Info { get; set; }
    }
}
