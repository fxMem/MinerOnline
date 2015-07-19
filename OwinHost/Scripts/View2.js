(function () {

	var window = this || (0, eval)('this');

	var enterError = 'Не могу соединиться с сервером!';
	var loadSessionsError = 'Не могу загрузить список игр!';

	/*View privates  */
	var hideClassName = 'hide';
	var $mainMenu = $('#main-menu');
	var $sessions = $('#main-menu-sessions');
	var $menuStatus = $('#main-menu-status');
	var $menuContainer = $('#menu-container');
	var $playerField = $('#player-field');
	var $enemyField = $('#enemy-field');
	var $gameContainer = $('#game-container');
	var $gameField = $('#game-field');
	var $gameView = null;
	var $body = $('body');
	var $chatContainer = $('#chat-container');
	var $msgSendButton = $('#send-msg-btn');
	var $textArea = $("#message-area");
	var $chatMessages = $("#chat-msg");
	var $voteButton = $('#vote-panel');
	var $leaveButton = $('#leave-panel');
	var $popup = $('#popup-win');
	var $nicknameIn = $('#in-nickname');
	var $enterNickBtn = $('#nick-in');
	var $connectionStatus = $('.connection-status');
	var disposable = [];

	var _viewPresentor = null;
	var _inGame = false;
	var _userNickname = null;
	var enemyNickname = null;

	var viewStates = {
		inMainMenu: 0,
		inSessionsList: 1,
		inGame: 2
	};
	var currentState = -1;

	var gameStates = [
		'Ожидание игроков',
		'В процессе',
		'Завершена',
		'Остановлена'
	];

	// PIXI
	var playerFieldRenderer = null;
	var enemyFieldRenderer = null;
	var playerFieldContainer = null;
	var enemyFieldContainer = null;
	var playerInteractionManager,
		enemyInteractionManager;

	var playerStage = null;
	var enemyStage = null;

	var _tileSize = 40;

	var _leftHold = false,
        _rightHold = false;

	function resetButtons() {
		_leftHold = false;
		_rightHold = false;
	}

	var textureIndex = {
		Closed: 11,
		Flagged: 1,
		Bomb: 0,
	
	};

	var chatNotifications = [
		'Пользователь присоединился к группе',
		'Пользователь покинул группу'
	];
	
	var playerField = null;
	var enemyField = null;
	var sizeX = null,
		sizeY = null;


	var voted = false;

	/* View functions */

	var chat = {
		initChat: function () {
			$msgSendButton.click(function () {
				var msgText = $textArea.val();
				_viewPresentor.message(msgText);
			});
		},

		appendChatMessage: function (msg) {
			var msg = $('<p />').html(msg);
			$chatMessages.append(msg);

			$chatMessages.scrollTop($chatMessages[0].scrollHeight - $chatMessages.height());
		},

		clearMessages: function () {
			$chatMessages.empty();
		},

		displayVoteNotification: function (data) {
			var sender = data.PlayerNickname;
			var vote = data.Vote;
			var time = getTime(new Date(Date.now()));
			var text = vote ? 'Я голосую за начало игры! ' : 'Я отзываю голос за начало игры!';
			text += '(' + data.Voted + ' / ' + data.Total + ')';

			var message = '[' + time + '] ' + sender + ' : ' + text;
			console.log(message);
			this.appendChatMessage(message);
		},

		displayChatMessage: function (msg) {
			var sender = msg.SenderNickname;
			var text = msg.Text;
			var time = getTime(new Date(Date.parse(msg.SentTime)));

			var message = '[' + time + '] ' + sender + ' : ' + text;
			console.log(message);
			this.appendChatMessage(message);
		},

		displayChatNotification: function (msg) {
			var sender = msg.Nickname;
			var text = chatNotifications[msg.NotificationType];
			var time = getTime(new Date(Date.parse(msg.SentTime)));

			var message = '[' + time + '] ' + sender + ' : ' + text;
			console.log(message);
			this.appendChatMessage(message);
		},

		displaErrorMessage: function (msg) {
			var time = new Date();

			var message = '[' + time + '] ' + sender + ' : ' + text;
			console.log(message);
			this.appendChatMessage(message);
		},
	};

	

	function getTime(date) {
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();

		return h + ':' + m + ':' + s;
	}

	function handleEvent(e) {
		e.Handled = true;
	}

	function returnToMenu() {
		hideGameView();

		enemyNickname = null;
		chat.clearMessages();
		clearVoted();
		showMainMenu();

		//for (var i = 0; i < disposable.length; i++) {
		//	disposable[i].destroy();
		//}

		$playerField.empty();
		$enemyField.empty();
	}

	function clearVoted() {
		voted = false;
		$voteButton.html('VOTE');
		$voteButton.attr("class", 'green');
	}

	function createMenu(presentor) {
		var menuItems = [
		//{
		//	name: 'Список игр',
		//	action: function () {
				
				
		//		presentor.getSessionsList().done(function (data) {
		//			$sessions.empty();
		//			displaySessions(data);
		//		});
				
		//	}
		//},
		{
			name: 'Создать игру',
			action: function () {
				$sessions.empty();

				presentor.createSession({ Name: "Foo" }).done(function (createSessionResponce) {
					presentor.
					connectSession(createSessionResponce.SessionId).
					done(function () {

						startGameUI();

						_viewPresentor.runMinerGame();
						console.log('Entered game ' + createSessionResponce.SessionId);
						_inGame = true;
					}).fail(function () {
						console.log('Error while connecting to game ' + createSessionResponce.SessionId);
					});
				});

			}
		}];

		for (var i = 0; i < menuItems.length; i++) {
			var item = menuItems[i];
			var $link = createActionLink(item);
			$mainMenu.append($link);
		}

		$voteButton.click(function () {
			if (voted) {
				$voteButton.html('VOTE');
				$voteButton.attr("class", 'green');
				_viewPresentor.unVoteForStart();
			}
			else {
				$voteButton.html('UNVOTE');
				$voteButton.attr("class", 'red');
				
				_viewPresentor.voteForStart();
				
			}

			voted = !voted;
		});

		$leaveButton.click(function () {
			_viewPresentor.leaveGame().done(function () {
				returnToMenu();
			});
		});

		$enterNickBtn.click(function () {
			_userNickname = $nicknameIn.val();

			$connectionStatus.html('Соединяемся с сервером...');

			presentor.initConnection().done(function () {
				presentor.connectGame({ Nickname: _userNickname }).done(function () {
					$connectionStatus.html('Соединение успешно!');
					$popup.addClass(hideClassName);

					showMainMenu();
				}).fail(function () {
					networkError(enterError);
				});
			}).fail(function () {
				networkError(enterError);
			});
		});
	};

	function networkError(msg) {
		$connectionStatus.empty();
		$connectionStatus.html(msg);


	}

	function setMenuStatus(msg) {
		$menuStatus.empty();
		$menuStatus.html(msg);


	}
	
	function createActionLink(action) {
		var $actionLink = $('<div />').addClass('menuItem').text(action.name).click(function () {
			action.action.apply(this);
		});

		return $actionLink;
	}

	function enemyFinished(info) {
		var action = info.Result === 0 ? ' завершил игру' : ' проиграл';
		var msg = 'Ваш противник ' + enemyNickname + action + ' за ' + info.ElapsedTime + ' сек.';
		chat.appendChatMessage(msg);
	}

	function playerFinished(info) {
		var action = info.Result === 0 ? ' завершили игру' : ' проиграли';
		var msg = 'Вы ' + action + ' за ' + info.ElapsedTime + ' сек.';
		chat.appendChatMessage(msg);
	}

	function displayPopup() {
		$popup.attr('class', 'popup');
	}

	function displaySessions(data) {
		currentState = viewStates.inSessionsList;

		var sessions = data.Sessions;
		for (var i = 0; i < sessions.length; i++) {
			var session = sessions[i].Info;
			var title = session.Title;
			var desc = session.Description;
			var created = getTime(new Date(Date.parse(session.Created)));
			var playersCount = session.ConnectedPlayers;
			var stateIndex = session.Status;
			var stateName = gameStates[stateIndex];
			var sessionId = sessions[i].SessionId;

			var $link = $('<button />').addClass('join-session-button').
			text('Присоединиться!').click(
			(function (sessionId) {
				return function () {
					_viewPresentor.connectSession(sessionId).done(function () {
						
						startGameUI();

						_viewPresentor.runMinerGame();
						console.log('Entered game ' + sessionId);
						// Сделать тут каллбек для обработки ошибки
					});
				}
			})(sessionId));
			
			
			var $sessionInfo = $('<tr />').
				html(
				'<td>' + title + '</td>' +
				'<td>' + created + '</td>' +
				'<td>' + desc + '</td>' +
				'<td>' + playersCount + '</td>' +
				'<td>' + stateName + '</td>'
				);
			$sessionInfo.append($link);

			$sessions.append($sessionInfo);
			

		}
	};

	function startGameUI() {
		hideMainMenu();
		showGameView();

		if (pollTimeout) {
			clearTimeout(pollTimeout);
		}
		//view.enableVote();
	}

	function showMainMenu() {
		$menuContainer.removeClass(hideClassName);

		pollSessionsList();
	}

	var pollTimeout = null;
	function pollSessionsList() {
		var loadSessions = function () {
			presentor.getSessionsList().done(function (data) {
				$sessions.empty();
				displaySessions(data);

				setMenuStatus('Последнее обновление списка игр в ' + getTime(new Date()));
				pollTimeout = setTimeout(loadSessions, 500);

			}).fail(function () {
				setMenuStatus(loadSessionsError);
			});
		}
		

		pollTimeout = setTimeout(loadSessions, 500);
	}


	function hideMainMenu() {
		$menuContainer.addClass(hideClassName);
	}

	function showGameView() {
		currentState = viewStates.inGame;

		$gameContainer.removeClass('hide');

		if (enemyNickname) {
			$enemyField.removeClass('hide');
		}
	}

	function showGameField() {
		$gameField.removeClass('hide');

		if (enemyNickname) {
			$enemyField.removeClass('hide');
		}
	}



	function createPIXIStage() {
		var stage = new PIXI.Stage(0x888888);
		var fieldWidth = sizeX * _tileSize;
		var fieldHeight = sizeY * _tileSize;

		
		var playerFieldContainer = new PIXI.DisplayObjectContainer();
		playerStage.addChild(playerFieldContainer);
		playerInteractionManager = playerStage.interactionManager;
		//enemyInteractionManager = enemyStage.interactionManager;

		$playerField.append(playerFieldRenderer.view);
		$enemyField.append(enemyFieldRenderer.view);
		loader.onComplete = callback;
		loader.load();
	}
	
	function hideGameView() {
		$gameContainer.addClass('hide');

		
	}

	function placeTile (tile, x, y, disableUpdate, enemy) {
		disableUpdate = disableUpdate || false;
		enemy = enemy || false;

		tile.width = _tileSize;
		tile.height = _tileSize;
		tile.buttonMode = true;
		tile.interactive = true;

		tile.y = _tileSize * y;
		tile.x = _tileSize * x;

		tile._x = x;
		tile._y = y;

		if (enemy) {
			enemyFieldContainer.addChild(tile);
		}
		else {
			playerFieldContainer.addChild(tile);
			wireEventHandler(tile);
		}
		
		//disposable.push(tile);

		//if (!disableUpdate) {
		//	view.updateView();
		//}
	}

	//function placeText(tile, x, y, disableUpdate, enemy) {
	//	disableUpdate = disableUpdate || false;
	//	enemy = enemy || false;


	//	placeTile(tile, x, y, true, enemy);
	//	//tile.width = _tileSize;
	//	//tile.height = _tileSize;
	//	tile.buttonMode = true;
	//	tile.interactive = true;

	//	tile.y = _tileSize * y + _tileSize / 4;
	//	tile.x = _tileSize * x + _tileSize / 3.5;

	//	tile._x = x;
	//	tile._y = y;

	//	if (enemy) {
	//		enemyFieldContainer.addChild(tile);
	//	}
	//	else {
	//		playerFieldContainer.addChild(tile);
	//		wireEventHandler(tile);
	//	}
		
	//	//if (!disableUpdate) {
	//	//	view.updateView();
	//	//}
	//}

	function lmbDown(event) {
		_leftHold = true;
	}

	function rmbDown(event) {
		_rightHold = true;
		event.originalEvent.defaultPrevented = true;
	}

	function lmbUp(event) {
		if (!_leftHold) {
			return;
		}

		var x = event.target._x;
		var y = event.target._y;

		if (_rightHold) {
			_viewPresentor.detectAction(x, y);
		}
		else {
			_viewPresentor.probeAction(x, y);
		}

		handleEvent(event);
		resetButtons();
	}

	function rmbUp(event) {

		if (!_rightHold) {
			return;
		}

		var x = event.target._x;
		var y = event.target._y;

		if (_leftHold) {
			_viewPresentor.detectAction(x, y);
		}
		else {
			_viewPresentor.setAction(x, y);
		}

		resetButtons();
		handleEvent(event);
		event.originalEvent.defaultPrevented = true;
	}

	function wireEventHandler(tile) {
		tile.rightdown = rmbDown;
		tile.mousedown = lmbDown;

		tile.rightup = rmbUp;
		tile.mouseup = lmbUp;
	}

	var view = {
		Chat: chat,

		displayMainMenu: function () {
			createMenu(_viewPresentor);
			$body.append($menuContainer);
			$body.append($gameContainer);

			//showMainMenu();
			chat.initChat();
		},

		GameBegun: function () {
			showGameField();
			this.Chat.appendChatMessage("Игра началась!");
		},

		displayScore: function (data) {
			var msg = data.IsDraw == true ? 'Ничья!' : 'Победитель - ' + data.WinnerNickName + '! Поздравляем!';
			chat.appendChatMessage(msg);
			
		},

		displayField: function (callback) {

			$voteButton.addClass(hideClassName);

			playerStage = new PIXI.Stage(0x888888);
			
			var fieldWidth = sizeX * _tileSize;
			var fieldHeight = sizeY * _tileSize;

			playerFieldRenderer = PIXI.autoDetectRenderer(fieldWidth, fieldHeight);
			

			var tileAtlas = ["scripts/j.json"];
			var loader = new PIXI.AssetLoader(tileAtlas);
			playerFieldContainer = new PIXI.DisplayObjectContainer();
			

			playerStage.addChild(playerFieldContainer);
			
			playerInteractionManager = playerStage.interactionManager;
			

			$playerField.append(playerFieldRenderer.view);
			
			loader.onComplete = callback;
			loader.load();

			if (enemyNickname) {
				enemyStage = new PIXI.Stage(0x888888);
				enemyFieldRenderer = PIXI.autoDetectRenderer(fieldWidth, fieldHeight);
				enemyFieldContainer = new PIXI.DisplayObjectContainer();
				enemyStage.addChild(enemyFieldContainer);
				//enemyInteractionManager = enemyStage.interactionManager;
				$enemyField.append(enemyFieldRenderer.view);

			}
		},

		displayFinalResult: function (infos) {
			for (var i = 0; i < infos.length; i++) {
				var info = infos[i];

				var nickname = info.PlayerNickname;
				var isEnemyResult = nickname === enemyNickname;
				if (isEnemyResult) {
					enemyFinished(info);
				}
				else {
					playerFinished(info);
				}

				for (var i = 0; i < info.Bombs.length; i++) {
					var bomb = info.Bombs[i];
					view.drawBomb(bomb.Y, bomb.X, nickname);
				}
			}

			view.updateView();
		},

		enemyEntered: function (n) {
			enemyNickname = n;
			this.Chat.appendChatMessage("Игрок " + n + ' присоединился к игре!');
		},

		enemyLeaved: function () {
			this.Chat.appendChatMessage("Игрок " + enemyNickname + ' покинул игру!');
			enemyNickname = null;
		},

		setFieldOptins: function (enterResult) {
			sizeX = enterResult.SizeX;
			sizeY = enterResult.SizeY;
		},

		enableVote: function () {
			$voteButton.removeClass(hideClassName);
			$leaveButton.removeClass(hideClassName);
		},

		setPresentor: function (presentor) {
			_viewPresentor = presentor;
		},

		drawFlag: function (x, y, enemy) {
			var tile = PIXI.Sprite.fromFrame(textureIndex.Flagged);
			var enemy = ($.type(enemy) === 'boolean' && enemy) || (enemy == enemyNickname && enemy);

			placeTile(tile, x, y, true, enemy);
		},

		drawHightligthed: function (x, y) {
			var tile = PIXI.Sprite.fromFrame(textureIndex.Higthligthed);
			placeTile(tile, x, y, true, enemy);
		},

		removeFlag: function (x, y) {

		},

		gameOver: function (bombs) {

		},

		drawBomb: function (x, y, enemy) {
			var tile = PIXI.Sprite.fromFrame(textureIndex.Bomb);
			var enemy = ($.type(enemy) === 'boolean' && enemy) || (enemy == enemyNickname && enemy);

			placeTile(tile, x, y, true, enemy);
		},

		drawClosed: function (x, y, enemy) {
			var tile = PIXI.Sprite.fromFrame(textureIndex.Closed);
			var enemy = ($.type(enemy) === 'boolean' && enemy) || (enemy == enemyNickname && enemy);

			placeTile(tile, x, y, true, enemy);
		},

		setNumber: function (x, y, num, enemy) {
			var tile = PIXI.Sprite.fromFrame(num + 2);
			//var text = new PIXI.Text(num, { font: "25px Arial", fill: "red" });
			var enemy = ($.type(enemy) === 'boolean' && enemy) || (enemy == enemyNickname && enemy);
			placeTile(tile, x, y, true, enemy);
			//placeText(text, x, y, true, enemy);
		},

		
		updateView: function () {
			playerFieldRenderer.render(playerStage);
			if (enemyNickname) {
				enemyFieldRenderer.render(enemyStage);
			}
			
		},
	};

	window.view = view;
})()
