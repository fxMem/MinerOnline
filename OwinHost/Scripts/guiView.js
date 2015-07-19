(function () {

    var $body = null;
    var $mainMenu = null;
    var $gameContainer = null;
    var $chatView = null;
    var hideClassName = 'hide';

    var window = this || (0, eval)('this');
    if (typeof window.GuiPresentor == undefined) {
        throw new Error("GuiPresentor is not enabled.");
    }

    var GuiPresentor = window.GuiPresentor;
    var _guiPresentor = null;

    function GuiView(body) {
        $body = body;
        _guiPresentor = new GuiPresentor(this);

        $mainMenu = $mainMenu || createMenu();
        $body.append($mainMenu);

        var $gameView = $gameView || createGameView();
        $body.append($gameContainer);

        this.Container = $gameView;
    };

    
    GuiView.prototype = {
        showMainMenu: function () {
        	$($mainMenu).removeClass(hideClassName)
        },

        hideMainMenu: function () {
            $($mainMenu).addClass(hideClassName);
        },

        showGameView: function () {
        	$($gameContainer).removeClass('hide');
        },

        hideGameView: function () {
        	$($gameContainer).addClass('hide');
        },

        messageToChat: function (sender, time, message) {
        	var msg = $('<div />').addClass('chat-msg').
			html('<span>' + '(' + time + ') ' + sender + ': ' + message + '</span>');
        	$($chatView).append(msg);
        },

        clearChat: function () {
        	$($chatView).empty();
        }
    };

    GuiView.prototype.constructor = GuiView;

    window.GuiView = window.GuiView || GuiView;

    function createMenu() {
    	var $menu = $('<div />').addClass('main-menu').addClass('hide').html('Miner Online');
    	var menuItems = [{
    		name: 'Начать игру',
    		action: function () {
    			_guiPresentor.startGame();

    		}
    	},
			{
				name: 'Список игр',
				action: function () {
					_guiPresentor.startGame();

				}
			}];

    	for (var i = 0; i < menuItems.length; i++) {
    		var item = menuItems[i];
    		var $link = createActionLink(item);
    		$menu.append($link);
    	}

    	return $menu;
    };

    function createGameView() {
    	$gameContainer = $('<div />').addClass('game-container').addClass('hide');
    	var $gameView = $('<div />').addClass('game-view');
    	$chatView = $('<div />').addClass('chat-view');

    	$gameContainer.append($gameView);
    	$gameContainer.append($chatView);

    	return $gameView;
    	
		
    };

    function createActionLink(action) {
        var $actionLink = $('<button />').addClass('menuItem').text(action.name).click(function () {
            action.action.apply(this);
        });

        return $actionLink;
    }
})();