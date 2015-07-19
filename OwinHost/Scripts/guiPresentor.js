(function () {

    var window = this || (0, eval)('this');

    if (typeof window.GameView == undefined) {
        throw new Error("GameView is not enabled.");
    }

    var _gameView = null;
    var _guiView;
    function GuiPresentor(guiView) {
        _guiView = guiView;
    };


    GuiPresentor.prototype = {
    	startGame: function () {
    		_guiView.hide();

    		_gameView = new window.GameView();
    	}
    };
	


    window.GuiPresentor = window.GuiPresentor || GuiPresentor;
})();