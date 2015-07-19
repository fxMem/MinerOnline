(function () {

    var window = this || (0, eval)('this');
    if (typeof window.Presentor == undefined) {
        throw new Error("Presentor is not enabled.");
    }

    if (typeof window.PIXI == undefined) {
        throw new Error("PIXI is not enabled.");
    }

    var Presentor = window.Presentor;
    var PIXI = window.PIXI;

    var textureIndex = {
        Closed: 0,
        Flagged: 1,
        Bomb: 2
    };

    var enemyStages = [];

    function addPlayer(playerId) {
    	for (var i = 0; i < stages.length; i++) {
    		var stage = stages[i];
    		if (stage.playerId == playerId) {
    			return;
    		}
    	}

    	var newStage = new PIXI.Stage(0x888888);
    	newStage.playerId = playerId;
    	stages.push({ playerId: playerId, stage: newStage });
    }

    function GameView() {
       
        this._stage = new PIXI.Stage(0x888888);
        //presentor.initView(this);

        presentor.enterGame({ Nickname: 'Mem' });
    }

    var _tileSize = 40;
    var presentor = null;

    var _leftHold = false,
        _rightHold = false;

    function resetButtons() {
        _leftHold = false;
        _rightHold = false;
    }

    GameView.prototype = {
    	setPresentor: function (p) {
    		presentor = p;
    	},

        beginGame: function () {
            var credits = {};

            //presentor = presentor || new Presentor(this);
            presentor.enterGame(credits);
        },

        playerReady: function () {
            presentor.setReady();
        },

        lmbDown: function (event) {
            _leftHold = true;
        },

        rmbDown: function (event) {
            _rightHold = true;
            event.originalEvent.defaultPrevented = true;
        },

        lmbUp: function (event) {
            if (!_leftHold) {
                return;
            }

            var x = event.target._x;
            var y = event.target._y;

            if (_rightHold) {
                presentor.detectAction(x, y);
            }
            else {
                presentor.probeAction(x, y);
            }

            handleEvent(event);
            resetButtons();
        },

        rmbUp: function (event) {

            if (!_rightHold) {
                return;
            }


            var x = event.target._x;
            var y = event.target._y;

            if (_leftHold) {
                presentor.detectAction(x, y);
            }
            else {
                presentor.setAction(x, y);
            }

            resetButtons();
            handleEvent(event);
            event.originalEvent.defaultPrevented = true;
        },

        move: function (event) {
            if (interactionManager.hitTest(this, event)) {
                if (!this._selected) {
                    this._selected = true;
                    var x = this._x;
                    var y = this._y;

                    presentor.selectAction(x, y);
                }
            }
        },

        moveout: function (event) {
            if (interactionManager.hitTest(this, event)) {
                if (this._selected) {
                    this._selected = false;

                    var x = this._x;
                    var y = this._y;

                    presentor.unSelectAction(x, y);
                }
            }
        },

        // Вызывается, когда игрок соединился с сервером и вошел в игру
        initField: function (sizeX, sizeY, callback) {

        	var fieldWidth = sizeX * _tileSize;
        	var fieldHeight = sizeY * _tileSize;

        	this._renderer = PIXI.autoDetectRenderer(fieldWidth, fieldHeight);
            var tileAtlas = ["scripts/j.json"];
            var loader = new PIXI.AssetLoader(tileAtlas);
            this._container = new PIXI.DisplayObjectContainer();
            this._stage.addChild(this._container);
            interactionManager = this._stage.interactionManager;

            document.body.appendChild(this._renderer.view);
            loader.onComplete = callback;
            loader.load();
        },


        drawFlag: function (x, y) {
            var tile = PIXI.Sprite.fromFrame(textureIndex.Flagged);
            this._placeTile(tile, x, y);
        },

        drawHightligthed: function (x, y) {
            var tile = PIXI.Sprite.fromFrame(textureIndex.Higthligthed);
            this._placeTile(tile, x, y);
        },

        removeFlag: function (x, y) {

        },

        gameOver: function (bombs) {

        },

        drawBomb: function (x, y) {
            var tile = PIXI.Sprite.fromFrame(textureIndex.Bomb);
            this._placeTile(tile, x, y);
        },

        drawClosed: function (x, y) {
            var tile = PIXI.Sprite.fromFrame(textureIndex.Closed);
            this._placeTile(tile, x, y);
        },

        setNumber: function (x, y, num) {
        	var text = new PIXI.Text(num, { font: "25px Arial", fill: "red" });
        	this._placeText(text, x, y);
            //text.y = _tileSize * y;
            //text.x = _tileSize * x;
            //this._container.addChild(text);
        },

        _placeText: function (tile, x, y, disableUpdate) {
        	disableUpdate = disableUpdate || false;

        	//tile.width = _tileSize;
        	//tile.height = _tileSize;
        	tile.buttonMode = true;
        	tile.interactive = true;

        	tile.y = _tileSize * y + _tileSize / 4;
        	tile.x = _tileSize * x + _tileSize / 3.5;

        	tile._x = x;
        	tile._y = y;

        	this._container.addChild(tile);
        	this._wireEventHandler(tile);

        	if (!disableUpdate) {
        		this.updateView();
        	}
        },

        _placeTile: function (tile, x, y, disableUpdate) {
            disableUpdate = disableUpdate || false;

            tile.width = _tileSize;
            tile.height = _tileSize;
            tile.buttonMode = true;
            tile.interactive = true;

            tile.y = _tileSize * y;
            tile.x = _tileSize * x;

            tile._x = x;
            tile._y = y;

            this._container.addChild(tile);
            this._wireEventHandler(tile);

            if (!disableUpdate) {
                this.updateView();
            }
        },

        _wireEventHandler: function (tile) {
            tile.rightdown = this.rmbDown.bind(this);
            tile.mousedown = this.lmbDown.bind(this);

            tile.rightup = this.rmbUp.bind(this);
            tile.mouseup = this.lmbUp.bind(this);

            //tile.mousemove = this.move.bind(tile);
            //tile.mouseout = this.moveout.bind(tile);
        },

        updateView: function () {
            this._renderer.render(this._stage);

        }

    };

    GameView.prototype.constructor = GameView;

    window.GameView = window.GameView || GameView;

    function isHandled(e) {
        if (e.Handled) {
            return true;
        }
        else {
            return false;
        }
    }
    function handleEvent(e) {
        e.Handled = true;

    }
})();