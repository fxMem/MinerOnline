using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MinerCore;

namespace GUI
{
    public class Presentor
    {
        private IFieldView _view;

        private BattleField _session;

        private BattleFieldParams _params;

        public Presentor(IFieldView view, IFieldOptionsLoader loader)
        {
            _view = view;
           
            _params = loader.LoadParams();
            //_params = BattleFieldParams.Default;

            _view.SetPresentor(this);
            _session = new BattleField(null, _params);

        }

        public void StartGame(bool repaintField = true)
        {
            _session.StartGame();
            _session.FieldStateChanged += onStateChanged;
            _session.PlayerFinished += onGameFinished;

            if (repaintField)
            {
                _view.ShowField(_params.SizeX, _params.SizeY);
            }
                
        }

        public void Probe(int x, int y)
        {
            
            try
            {
                _session.Probe(x, y);
            }
            catch (Exception e)
            {
                _view.ShowErrorMessage(e.Message);
            }
        }

        public void SetOrUnsetFlag(int x, int y)
        {
            
            try
            {
                _session.SetOrUnsetFlag(x, y);
            }
            catch (Exception e)
            {
                _view.ShowErrorMessage(e.Message);
            }

        }

        public void Detect(int x, int y)
        {
            
            try
            {
                _session.Detect(x, y);
            }
            catch (Exception e)
            {
                _view.ShowErrorMessage(e.Message);
            }
        }

        protected void onStateChanged(object s, FieldStateChangedEventArgs a)
        {
            _view.UpdateField(a.Snapshot);
        }

        protected void onGameFinished(object s, PlayerFinishedEventArgs a)
        {
            _view.ShowGameResult(a.Result, a.ElapsedTime, a.Player, a.Bombs);
        }



    }
}
