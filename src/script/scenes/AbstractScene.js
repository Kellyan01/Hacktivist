//Abstract Class to lauch the differents scenes
//@gameController : GameController
export class AbstractScene {
    constructor(gameController){
        if(new.target === AbstractScene) throw new Error("AbstractScene can't be instanciated");

        this.gameController = gameController;
    }

    //Abstract Method to launch scenes
    launch(){
        throw new Error("launch() method must be implemented");
    }
}