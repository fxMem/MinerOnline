using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MinerCore;

namespace GUI
{
    public interface IFieldView
    {
        void ShowField(int xSize, int ySize);

        void UpdateField(BattleFieldSnapshot field);

        void ShowTime(TimeSpan time);

        void ShowGameResult(PlayerResult result, TimeSpan time, Player winner, IEnumerable<TileCoordinates> bombs = null);

        void ShowErrorMessage(string msg);

        void SetPresentor(Presentor presentor);

    }
}
