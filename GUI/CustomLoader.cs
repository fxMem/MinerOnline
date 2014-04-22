using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MinerCore;

namespace GUI
{
    public class CustomLoader : IFieldOptionsLoader
    {

        public CustomLoader()
        {

        }

        public BattleFieldParams LoadParams()
        {
            return new BattleFieldParams(10, 10, 10);
        }
    }
}
