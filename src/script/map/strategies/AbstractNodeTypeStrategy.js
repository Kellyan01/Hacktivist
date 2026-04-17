//Abstract class for the type assign child class
export class AbstractNodeTypeStrategy {
    constructor(){
        if(new.target === AbstractNodeTypeStrategy) throw new Error("AbstractNodeTypeStrategy can't be instanciate !");
    }

    //Abstract Method to use assign type on nodes list
    //@mapNodes = MapNodes[]
    //@totalFloors : int
    assignAll(mapNodes, totalFloors){
        throw new Error("assignAll() must be implemented !");
    }
}