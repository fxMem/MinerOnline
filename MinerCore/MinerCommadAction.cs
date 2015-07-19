using PlainValley.Games.Actions;
using PlainValley.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class MinerCommadAction : CustomAction<MinerPlayer, MinerCommandData>
    {
        public MinerCommadAction()
        {
            _id = "MCA";
			_name = "MinerCommand";
        }

        protected override Task<object> Handle(MinerPlayer player, PlainValley.Games.IGameSession session, MinerCommandData data)
        {
            switch (data.Command)
            {
                case MinerCommand.GetConfig:
                    {
                        return Task.FromResult<object>(session.Configuration);
                    }
                default:
                    {
                        return TaskHelper.FinishedTask();
                    }
            }
        }
    }
}
