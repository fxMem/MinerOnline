(function () {

	var window = this || (0, eval)('this');

	/*presentor privates */
	var playerNickname = null;
	var enemyNickname = null;
	var _connected = false;
	var _view = window.view;
	var _sessionId = null;
	var tiles = [];
	var enemyTiles = [];
	var tileStates = {
		Opened: 0,
		Closed: 1,
		Flagged: 2,
		Explosed: 3
	};
	
	var _gameStarted = false;
	

	/* Presentor functions */

	function initTiles() {
		for (var y = 0; y < sizeY; y++) {
			tiles[y] = [];
			enemyTiles[y] = [];

			for (var x = 0; x < sizeX; x++) {
				tiles[y][x] = tileStates.Closed;
				enemyTiles[y][x] = tileStates.Closed;
			}
		}
	}

	function setUpTileForTilesArray(tiles) {

		
	}

	function updateField(playersData) {
		for (var playerNum in playersData) {
			var playerInfo = playersData[playerNum];
			var nickname = playerInfo.Nickname;

			var isPlayerData = nickname === playerNickname;
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

							if (isPlayerData) {
								if (tiles[j][i] !== tileStates.Opened) {
									_view.setNumber(i, j, bombCount, nickname);
									tiles[j][i] = tileStates.Opened;
								}
							}
							else {
								if (enemyTiles[j][i] !== tileStates.Opened) {
									_view.setNumber(i, j, bombCount, nickname);
									enemyTiles[j][i] = tileStates.Opened;
								}
							}
							

							continue;
						}
						case tileStates.Closed: {
							if (isPlayerData) {
								if (tiles[j][i] !== tileStates.Closed) {

									tiles[j][i] = tileStates.Closed;
									_view.drawClosed(i, j, nickname);
								}

							}
							else {

								if (enemyTiles[j][i] !== tileStates.Closed) {

									enemyTiles[j][i] = tileStates.Closed;
									_view.drawClosed(i, j, nickname);
								}

							}
							continue;
						}
						case tileStates.Flagged: {

							if (isPlayerData) {
								if (tiles[j][i] !== tileStates.Flagged) {

									tiles[j][i] = tileStates.Flagged;
									_view.drawFlag(i, j, nickname);
								}
							}
							else {
								if (enemyTiles[j][i] !== tileStates.Flagged) {
									enemyTiles[j][i] = tileStates.Flagged;
									_view.drawFlag(i, j, nickname);
								}
							}
							
                            
							continue;
						}
						case tileStates.Explosed: {

							if (isPlayerData) {
								tiles[j][i] = 3;
							}
							_view.drawBomb(i, j, nickname);
							continue;
						}
					}
				}
			}
		}

		_view.updateView();
	}



	function prepareMinerGame() {
		plainValley.game.
		MinerCommand({ GameSessionId: _sessionId, Data: { Command: 0 } }).
		done(function (enterResult) {

			sizeX = enterResult.SizeX;
			sizeY = enterResult.SizeY;

			initTiles();
			_view.setFieldOptins(enterResult);
			
			_view.enableVote();
		});
	}

	function bindCallbaks() {
		plainValley.callbacks.MinerUpdateData(function (updateInfo) {
			updateField(updateInfo.Info);
		});

		plainValley.callbacks.EndGameUpdateData(function (updateInfo) {
			_view.displayFinalResult(updateInfo.Info);
		});

		plainValley.callbacks.callbackNotFound(function (e) {
			console.log("Message arrived with type for which handler was not registered: " + e.Type);
		});

		plainValley.callbacks.InvocationErrorResult(function (e) {
			console.log("server error: " + e.Message);
			_view.Chat.displaErrorMessage(msg);
		});

		plainValley.callbacks.ChatMessageData(function (msg) {
			_view.Chat.displayChatMessage(msg);
		});

		plainValley.callbacks.ChatGroupNotificationData(function (msg) {
			_view.Chat.displayChatNotification(msg);
		});

		plainValley.callbacks.MinerScore(function (data) {
			_view.displayScore(data);
		});

		plainValley.callbacks.GameStartVoteNotification(function (data) {
			_view.Chat.displayVoteNotification(data);
		});

		plainValley.callbacks.GameStatusUpdateData(function (e) {
			if (e.CommandType == '0') {

				// Игра началась
				_gameStarted = true;

				_view.displayField(drawField);
				_view.GameBegun();
			}
			else if (e.CommandType == '1') {
				// Игра закончена
			}
			else if (e.CommandType == '2') {
				// Зашел игрок

				var nickname = e.PlayerNickname;
				if (nickname !== playerNickname) {
					_view.enemyEntered(nickname);
					enemyNickname = nickname;
				}
			}
			else if (e.CommandType == '3') {
				// Игрок вышел

				enemyNickname = null;
				_view.enemyLeaved();
			}
		});

	};

	function checkInGame() {
		if (!_gameStarted) {
			throw new Error('Game doesnt started!');
		}
	}

	function createActionData(x, y) {
		return { GameSessionId: _sessionId, Data: { X: x, Y: y } }
	}
	
	function drawField () {
		for (var y = 0; y < sizeY; y++) {
			for (var x = 0; x < sizeX; x++) {
				var tileState = tiles[y][x];

				switch (tileState) {
					case tileStates.Closed: {
						_view.drawClosed(x, y);
						if (enemyNickname) {
							_view.drawClosed(x, y, true);
						}
						
						break;
					}
					case tileStates.Opened: {
						break;
					}
					case tileStates.Flagged: {
						_viewiew.drawFlag(x, y);
						break;
					}
				}

			}
		}

		_view.updateView();
	}

	var presentor = {
		connectGame: function (playerCredits) {
			var nickname = playerCredits.Nickname;
			playerNickname = nickname;
			bindCallbaks();

			return plainValley.connect(playerCredits).done(function (enterResult) {
				if (!enterResult) {
					throw new Error("Enter failed!");
				}

				_connected = true;
			});
		},

		leaveGame: function () {
			return plainValley.lobby.leaveSession({ SessionId: _sessionId }).done(function () {
				_sessionId = null;
				enemyNickname = null;
			});
		},

		getSessionsList: function () {
			return plainValley.lobby.getSessionsList();
		},

		initConnection: function () {
			return plainValley.init();
		},

		connectedUsers: function () {
			return plainValley.lobby.getPlayers({ SessionId: _sessionId });
		},

		connectSession: function (sessionId) {
			var d = $.Deferred();

			plainValley.lobby.enterSession({ SessionId: sessionId, Configuration: {} })
			.done(function (responce) {
				if (responce.Type == 'OK') {
					_sessionId = sessionId;
					var users = presentor.connectedUsers().done(function (info) {
						var users = info.Players;
						for (var i = 0; i < users.length; i++) {
							var p = users[i];
							if (p.Nickname == playerNickname) {
								continue;
							}

							enemyNickname = p.Nickname;
							_view.enemyEntered(enemyNickname);
							break;
						}

						d.resolve();
					}).fail(function () {
						d.reject();
					});

					
				}
				else {
					d.reject();
				}
			});

			return d.promise();
		},

		createSession: function (data) {
			var sessionName = data.Name;
			return plainValley.lobby.createSession();
		},

		message: function (text) {
			plainValley.Chat.SendMessage({ TargetGroup: _sessionId, Text: text });
		},

		runMinerGame: function () {

			prepareMinerGame();
		},

		voteForStart: function () {
			plainValley.game.GameStartVote({ GameSessionId: _sessionId, Data: { Vote: true } });
		},

		reset: function () {
			_sessionId = null;
		},

		unVoteForStart: function () {
			plainValley.game.GameStartVote({ GameSessionId: _sessionId, Data: { Vote: false } });
		},

		probeAction: function (x, y) {
			checkInGame();

			if (tiles[y][x] !== tileStates.Closed) {
				throw new Error("Cannot probe on non-closed tile!");
			}

			plainValley.game.Probe(createActionData(y, x));
		},
		
		detectAction: function (x, y) {
			checkInGame();

			if (tiles[y][x] !== tileStates.Opened) {
        		throw new Error("Cannot detect on non-open tile!");
			}

			plainValley.game.Detect(createActionData(y, x));
		},

		setAction: function (x, y) {
			checkInGame();

			if (tiles[y][x] === tileStates.Closed) {
				//tiles[y][x] = tileStates.Flagged;
				plainValley.game.SetOrUnsetFlag(createActionData(y, x));

				//_view.drawFlag(x, y);
			}
			else if (tiles[y][x] === tileStates.Flagged) {
				//tiles[y][x] = tileStates.Closed;
				plainValley.game.SetOrUnsetFlag(createActionData(y, x));
			}
			else {
				throw new Error("Cannot set flag on non-open tile!");
			}

		}
	};

	_view.setPresentor(presentor);
	window.presentor = presentor;
})()