(function () {
	var window = this || (0, eval)('this');

    if (typeof $ == undefined) {
        throw new Error("jQuery is not enabled.");
    }

    if (typeof window.Presentor == undefined) {
        throw new Error("Presentor is not enabled.");
    }

    if (typeof window.GameView == undefined) {
    	throw new Error("GameView is not enabled.");
    }

    if (typeof window.GuiView == undefined) {
    	throw new Error("GuiView is not enabled.");
    }

    if (typeof window.GuiPresentor == undefined) {
    	throw new Error("GuiPresentor is not enabled.");
    }
	

	

    //var GuiView = window.GuiView;
    //var GuiPresentor = window.GuiPresentor;
    //var Presentor = window.Presentor;
    //var GameView = window.GameView;

    //var guiView = new GuiView($('body'));
    //var guiPresentor = new GuiPresentor(guiView);
    //var gameView = new GameView();

	//var presentor = new Presentor(gameView, guiPresentor);

    var view = window.view;
    var presentor = window.presentor;
    var plainValley = window.plainValley;
    view.setPresentor(presentor);

    view.displayMainMenu();
    
    

})();