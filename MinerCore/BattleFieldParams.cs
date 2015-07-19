using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class BattleFieldParams
    {
        public int BombsCount { get; private set; }

        public int SizeX { get; private set; }

        public int SizeY { get; private set; }

        public int PlayerLifeCount { get; private set; }

        public BattleFieldParams()
        {

        }

        public BattleFieldParams(int lifeCount, int bomsCount, int xN, int yN)
        {
            PlayerLifeCount = lifeCount;

            BombsCount = bomsCount;

            SizeY = yN;

            SizeX = xN;
        }

    }
}
