using PlainValley.Games;
using PlainValley.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class MinerPlayer : Player
    {
        private BattleField _field;
        private bool _disabled;

        private object _actionLock = new object();

        public MinerPlayer(IUserInfo info, BattleField field)
            : base(info)
        {
            _field = field;
            _field.SetPlayer(this);
        }

        public void Disable()
        {
            _disabled = true;
        }

        private void checkDisabled()
        {
            if (_disabled)
            {
                throw new InvalidOperationException(string.Format("Player with nickname = {0} is disabled.", Info.Nickname));
            }
        }

        [ActionName("mo_probe")]
        public void Probe(MinerActionData action)
        {
            lock (_actionLock)
            {
                checkDisabled();

                int x = action.X;
                int y = action.Y;

                _field.Probe(x, y);
            }
        }

        [ActionName("mo_set")]
        public void SetOrUnsetFlag(MinerActionData action)
        {
            checkDisabled();

            int x = action.X;
            int y = action.Y;

            _field.SetOrUnsetFlag(x, y);
        }

        [ActionName("mo_detect")]
        public void Detect(MinerActionData action)
        {
            lock (_actionLock)
            {
                checkDisabled();

                int x = action.X;
                int y = action.Y;

                _field.Detect(x, y);
            }
        }
    }
}
