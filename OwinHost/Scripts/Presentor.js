(function () {
    var window = this || (0, eval)('this');

    if (typeof window.plainValley == undefined) {
        throw new Error("PlainValley.Games.JS is not enabled.");
    }

    var plainValley = window.plainValley;
    var createAction = window.plainValley.actionFactory;

    var tileStates = {
        Opened: 0,
        Closed: 1,
        Flagged: 2,
        Explosed: 3
    };

    var minerActions = {

    };

    var probeResult = {

        // Игрок выбрал поле с бомбой, и жизней больше нет. Проигрыш
        Fail: 0,

        // Игрок выбрал поле с бомбой, но еще остались жизни
        Explosed: 1,

        // Игрок не взорвался
        Good: 2
    };

    var tiles = [];

    var _game = null;
    var _inGame = false;
    var _sessionId = null;
	 
    function Presentor(gameView, guiPresentor) {
    	this._gameView = view;
    	this._guiPresentor = guiPresentor;
    	gameView.setPresentor(this);

        _game = plainValley.game;
    }

    Presentor.prototype = {
    	initTiles: function () {
    		for (var y = 0; y < this._sizeY; y++) {
    			tiles[y] = [];

    			for (var x = 0; x < this._sizeX; x++) {
    				tiles[y][x] = tileStates.Closed;
    			}
    		}
    	},

    	processFinal: function (info) {
    		var bombs = info.Bombs;
    		for (var i = 0; i < bombs.length; i++) {
    			var bombCoords = bombs[i];

    			this._gameView.drawBomb(bombCoords.Y, bombCoords.X);
    		}
    		var msg = "";
    		if (info.Result == 0) {
    			msg = "Good! You won!";
    		}
    		else {
    			msg = "Too bad.. You lose, young piglet!";
    		}
    		console.log(msg);
    		console.log("Elapsed time = " + info.ElapsedTime);

        
    		this._gameView.updateView();
    	},

    	updateField: function (playersData) {
    		for (var playerNum in playersData) {
    			var playerInfo = playersData[playerNum];
    			var playerId = playerInfo.PlayerId;
    			var sizeX = playerInfo.Snapshot.SizeX;
    			var sizeY = playerInfo.Snapshot.SizeY;
            

    			var bombCounts = playerInfo.Snapshot.BombCounts;
    			var states = playerInfo.Snapshot.States;

    			for (var i = 0; i < sizeY; i++) {
    				for (var j = 0; j < sizeX; j++) {
    					var tileState = states[i][j];
    					var bombCount = bombCounts[i][j];

                    
                    
    					switch (tileState) {
    						case tileStates.Opened: {

    							if (tiles[j][i] !== tileStates.Opened) {
    								this._gameView.setNumber(i, j, bombCount);
    								tiles[j][i] = tileStates.Opened;
    							}

    							continue;
    						}
    						case tileStates.Closed: {

    							//tiles[i][j] = 1;
    							continue;
    						}
    						case tileStates.Flagged: {
    							if (tiles[j][i] !== tileStates.Flagged) {
    								tiles[j][i] = 2;
    								this._gameView.drawFlag(i, j);
    							}
                            
    							continue;
    						}
    						case tileStates.Explosed: {
    							tiles[j][i] = 3;
    							this._gameView.drawBomb(i, j);
    							continue;
    						}

    					}

    				}
    			}
    		}

    		this._gameView.updateView();
    	},

    	enterGame: function (playerCredits) {
    		if (!enshureContainNames(playerCredits, "Nickname")) {
    			throw new Error("You must supply username!");
    		}
        
    		var that = this;
    		var login = function () {
    			plainValley.connect(playerCredits).done(function (enterResult) {
    				if (!enterResult) {
    					throw new Error("Enter failed!");
    				}

    				plainValley.lobby.createSession().done(function (createSessionResponce) {
    					plainValley.lobby.enterSession({ SessionId: createSessionResponce.SessionId, Configuration: {} }).done(function () {

    						_sessionId = createSessionResponce.SessionId;
    						// Вошли в сессию
    						that.runGame();
                        
    					})
    				});
    			});
    		};

        
    		this.startGame(login);
    	},

    	runGame: function () {
    		var that = this;
    		plainValley.game.MinerCommand({ GameSessionId: _sessionId, Data: { Command: 0 } }).done(function (enterResult) {

    			bindCallbaks(that);
    			//this._playerInfo = enterResult.PlayerInfo;
    			that._sizeX = enterResult.SizeX;
    			that._sizeY = enterResult.SizeY;
    			//this._connected = true;

    			that.initTiles();
    			that._gameView.initField(that._sizeX, that._sizeY, that.drawField.bind(that));

    			plainValley.game.GameStartVote({ GameSessionId: _sessionId, Data: { Vote: true } });
    		});
    	},

    	drawField: function () {
    		for (var y = 0; y < this._sizeY; y++) {
    			for (var x = 0; x < this._sizeX; x++) {
    				var tileState = tiles[y][x];

    				switch (tileState) {
    					case tileStates.Closed: {
    						this._gameView.drawClosed(x, y);
    						break;
    					}
    					case tileStates.Opened: {
    						break;
    					}
    					case tileStates.Flagged: {
    						this._gameView.drawFlag(x, y);
    						break;
    					}
    				}

    			}
    		}

    		this._gameView.updateView();
    	},

    	startGame: function (callback) {


    		var def = plainValley.init().done(function () {
    			callback();
    		});
    	},

    	setReady: function () {
    		if (!this._connected) {
    			throw new Error("You cannot set ready when you are not connected!");
    		}

    		_game.setReady();
    		this._ready = true;
    	},
    };

   


    Presentor.prototype.setAction = function (x, y) {
        if (tiles[y][x] === tileStates.Closed) {
            tiles[y][x] = tileStates.Flagged;
            this._gameView.drawFlag(x, y);
        }
        else if (tiles[y][x] === tileStates.Flagged) {
            tiles[y][x] = tileStates.Closed;
            this._gameView.drawClosed(x, y);
        }
        else {
            throw new Error("Cannot set flag on non-open tile!");
        }

    };

    Presentor.prototype.probeAction = function (x, y) {
        if (tiles[y][x] !== tileStates.Closed) {
            throw new Error("Cannot probe on non-closed tile!");
        }

        plainValley.game.Probe(createActionData(y, x));
    };

    function createActionData(x, y) {
    	return { GameSessionId: _sessionId, Data: { X: x, Y: y } }
    }

    Presentor.prototype.detectAction = function (x, y) {
        if (tiles[y][x] !== tileStates.Opened) {
            throw new Error("Cannot detect on non-open tile!");
        }

        plainValley.game.Detect(createActionData(y, x));
    };

    Presentor.prototype.selectAction = function (x, y) {
        if (tiles[y][x] !== tileStates.Closed) {
            return;
        }

        this._gameView.drawHightligthed(x, y);
    };

    Presentor.prototype.unSelectAction = function (x, y) {
        if (tiles[y][x] !== tileStates.Closed) {
            return;
        }

        this._gameView.drawClosed(x, y);
    };

    window['Presentor'] = Presentor;
    

    function enshureContainNames(o) {
    	if (arguments.length === 1) {
    		return true;
    	}

    	var names = arguments;
    	for (var i = 1; i < names.length; i++) {
    		if (!o.hasOwnProperty(names[i])) {
    			return false;
    		}
    	}

    	return true;
    };

    function bindCallbaks(presentor) {
    	plainValley.callbacks.MinerUpdateData(function (updateInfo) {
    		presentor.updateField(updateInfo.Info);
    	});

    	plainValley.callbacks.EndGameUpdateData(function (updateInfo) {
    		presentor.processFinal(updateInfo.Info[0]);
    	});

    	plainValley.callbacks.callbackNotFound(function () {
    		// ignore
    	});

    	plainValley.callbacks.InvocationErrorResult(function (e) {
    		console.log("server error: " + e.Message)
    	});

    	plainValley.callbacks.SystemUpdateData(function (e) {
    		if (e.CommandType == 'SG') {

				// Зашли в игру
    			_inGame = true;
    		}
    	});
    };
})();