using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PlainValley.Games;

namespace MinerCore
{
    public class MinerGameConfigurationLoader : IGameConfigurationLoader
    {
        private MinerGameConfiguration _config;

        public MinerGameConfigurationLoader()
        {
            _config = new MinerGameConfiguration() 
            { 
                BombsCount = 10, 
                PlayerLifeCount = 1, 
                SizeX = 10, 
                SizeY = 10, 
                MaxPlayersNumberPerGame = 2
            };
        }

		public GameConfiguration GetConfig(SessionCreationOptions options)
        {
            return _config;
        }
    }
}
