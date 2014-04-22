using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;

using MinerCore;

namespace GUI
{
    public partial class Form1 : Form, IFieldView
    {
        private Presentor _presentor;

        private bool _leftMouseButtonHeld = false;
        private bool _rightMouseButtonHeld = false;
        private bool _bothMouseButoonHeld = false;
        private bool  _actionPerformed = false;

        private Button[,] _buttons;
        private bool[,] _buttonsPainted;

        private void resetHold()
        {
            _leftMouseButtonHeld = false;
            _rightMouseButtonHeld = false;
            _bothMouseButoonHeld = false;
        }

        

        public Form1()
        {
            InitializeComponent();
            
        }

        public void ShowField(int xSize, int ySize)
        {
            _buttonsPainted = new bool[ySize, xSize];
            _buttons = new Button[ySize, xSize];
            var buttonSize = 30;
            var buttonPadding = 5;

            var topOffset = 50;
            var leftOffset = 50;

            for (int y = 0; y < ySize; y++)
                for (int x = 0; x < xSize; x++)
                {
                    int _x = x;
                    int _y = y;

                    _buttons[_y, _x] = new Button();
                    var currentButton = _buttons[_y, _x];

                    currentButton.MouseDown += (o, args) => 
                    {
                        _actionPerformed = false;
                        if (args.Button == System.Windows.Forms.MouseButtons.Left)
                        {
                            _leftMouseButtonHeld = true;

                            if (_rightMouseButtonHeld)
                            {
                                _bothMouseButoonHeld = true;
                            }
                        }
                        else if (args.Button == System.Windows.Forms.MouseButtons.Right)
                        {
                            _rightMouseButtonHeld = true;

                            if (_leftMouseButtonHeld)
                            {
                                _bothMouseButoonHeld = true;
                            }
                        }
                    };

                    currentButton.MouseUp += (o, args) =>
                    {
                        if (args.Button == System.Windows.Forms.MouseButtons.Left)
                        {
                            _leftMouseButtonHeld = false;

                            if (!_bothMouseButoonHeld && !_actionPerformed)
                                buttonLeftMouseClicked(_x, _y);
                        }
                        else if (args.Button == System.Windows.Forms.MouseButtons.Right)
                        {
                            _rightMouseButtonHeld = false;

                            if (!_bothMouseButoonHeld && !_actionPerformed)
                                buttonRightMouseClicked(_x, _y);
                        }

                        if (_bothMouseButoonHeld)
                        {
                            _actionPerformed = true;
                            _bothMouseButoonHeld = false;
                            _presentor.Detect(_x, _y);
                        }
                    };


                    currentButton.Width = buttonSize;
                    currentButton.Height = buttonSize;
                    currentButton.Top = topOffset + (buttonSize + buttonPadding) * _y;
                    currentButton.Left = leftOffset + (buttonSize + buttonPadding) * _x;

                    this.Controls.Add(currentButton);
                    

                }
        }

        public void UpdateField(MinerCore.BattleFieldSnapshot field)
        {
            
            for (int y = 0; y < field.SizeY; y++)
                for (int x = 0; x < field.SizeX; x++)
                {
                    var currentTile = field[y, x];
                    var button = _buttons[y, x];

                    if (currentTile.State == MinerCore.TileViewState.Flagged)
                    {
                        button.Text = "F";
                        button.BackColor = Color.Orange;
                    }
                    else if (currentTile.State == MinerCore.TileViewState.Closed)
                    {
                        button.Text = "";
                        button.BackColor = SystemColors.Control;
                    }
                    else
                    if ((currentTile.State == MinerCore.TileViewState.Opened))
                    {
                        button.BackColor = SystemColors.ControlDark;
                        if (currentTile.NearestBombCount.HasValue && currentTile.NearestBombCount != 0)
                        {
                            button.Text = currentTile.NearestBombCount.ToString();
                        }
                        //_buttonsPainted[y, x] = true;
                    }
                }
        }

        public void ShowTime(TimeSpan time)
        {
            throw new NotImplementedException();
        }

        public void ShowGameResult(PlayerResult result, TimeSpan time, MinerCore.Player winner, IEnumerable<TileCoordinates> bombs = null)
        {
            if (bombs != null)
            {
                foreach (var bombCoord in bombs)
                {
                    if (result == PlayerResult.Fail)
                    {
                        _buttons[bombCoord.Y, bombCoord.X].BackColor = Color.Red;
                    }
                    else
                    {
                        _buttons[bombCoord.Y, bombCoord.X].BackColor = Color.Green;
                    }
                }
            }

            errorLabel.Text = string.Format("Spent time: {0:00}::{1:00}", time.Minutes, time.Seconds % 60);
        }

        public void ShowErrorMessage(string msg)
        {
            errorLabel.Text = msg;
        }

        public void SetPresentor(Presentor presentor)
        {
            _presentor = presentor;
        }

        private void buttonLeftMouseClicked(int x, int y)
        {
            _presentor.Probe(x, y);
        }

        private void buttonRightMouseClicked(int x, int y)
        {
            _presentor.SetOrUnsetFlag(x, y);
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            _presentor.StartGame();
            Debug.WriteLine("Game started!");
                
        }

        private void clearField()
        {
            foreach (var button in _buttons)
            {
                button.Text = "";
                button.BackColor = SystemColors.Control;
            }
        }
       
        private void начатьНовуюToolStripMenuItem_Click(object sender, EventArgs e)
        {
            clearField();
            _presentor.StartGame(false);
        }
    }
}
