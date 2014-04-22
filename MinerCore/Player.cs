using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class Player
    {
        public string NickName { get; private set; }

        public Player(string nickname)
        {
            NickName = nickname;
        }


    }
}
