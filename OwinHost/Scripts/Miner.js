(function () {

    var window = this || (0, eval)('this');
    if (typeof window.plainValley == undefined) {
        throw new Error("PlainValley.Games.JS is not enabled.");
    }

    if (typeof window.PIXI == undefined) {
        throw new Error("PIXIJS is not enabled.");
    }

    var game = window.plainValley.game;
    
    var pixi = window.PIXI;
    var interactionManager;
    

    

    function View(pixiStage) {
        this._stage = pixiStage;
        presentor.initView(this);
    }

    

    

    //window['View'] = View;
    window['startGame'] = function () {
        var view = new View(new PIXI.Stage(0x888888));
        presentor.enterGame({ Nickname: 'Mem' });
        //presentor.startGame(function () {  });
        
    };
    
    
    

})()