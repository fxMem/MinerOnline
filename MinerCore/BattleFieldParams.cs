using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class BattleFieldParams
    {
        public static BattleFieldParams Default = new BattleFieldParams { SizeX = 10, SizeY = 10, BombsCount = 10 };

        public int BombsCount { get; private set; }

        public int SizeX { get; private set; }

        public int SizeY { get; private set; }

        public BattleFieldParams()
        {

        }

        public BattleFieldParams(int bomsCount, int xN, int yN)
        {
            BombsCount = bomsCount;

            SizeY = yN;

            SizeX = xN;
        }

    }
}
