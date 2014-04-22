using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinerCore
{
    public class NearBombsCounter
    {
        private int[,] _nearBombsCounts;

        public NearBombsCounter(int sizeX, int sizeY)
        {
            _nearBombsCounts = new int[sizeY + 2, sizeX + 2];
        }

        public void SetBomb(int x, int y)
        {
            var realX = x + 1;
            var realY = y + 1;

            _nearBombsCounts[realY, realX]++;
            _nearBombsCounts[realY, realX + 1]++;
            _nearBombsCounts[realY, realX - 1]++;

            _nearBombsCounts[realY + 1, realX]++;
            _nearBombsCounts[realY + 1, realX + 1]++;
            _nearBombsCounts[realY + 1, realX - 1]++;

            _nearBombsCounts[realY - 1, realX]++;
            _nearBombsCounts[realY - 1, realX + 1]++;
            _nearBombsCounts[realY - 1, realX - 1]++;
        }

        public int this[int y, int x]
        {
            get 
            {
                var realX = x + 1;
                var realY = y + 1;
                return _nearBombsCounts[realY, realX];
            }
        }

    }
}
