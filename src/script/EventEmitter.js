//Class for EventEmitter System
export class EventEmitter{
    //Constructor
    //@events : Map of Callback[]
    constructor(){
        this.events = new Map();
    }

    //METHOD
    //MEthod to subscribe to an event
    /*
    @eventName : string
    @callback : function
    */
    on(eventName, callback){
        //Verify if callback is a function
        if(typeof(callback) !== "function") throw new Error("ERROR : This callback isn't a function");
        //If this event doesn't exist yet, add it with an array of callback
        if(!this.events.has(eventName)){
            this.events.set(eventName,[callback]);
        //If this event exist, push the callback in its array
        }else{
            this.events.get(eventName).push(callback);
        }
    }

    //Method to unsubscibre to an event
    /*
    @eventName : string
    @callback : function
    */
    off(eventName, callback){
        //Verify if this event exists
        if(!this.events.has(eventName)) throw new Error("ERROR : This event doesn't exist !");
        //Verify if callback is a function
        if(typeof(callback) !== "function") throw new Error("ERROR : This callback isn't a function");
        //Get index of the callback in its eventName tab
        const index = this.events.get(eventName).indexOf(callback);
        //Verify is callback exists
        if(index < 0) throw new Error("ERROR : this callback doesn't exist in this event list");
        //Delete the callback from its eventName tab
        this.events.get(eventName).splice(index,1);
    }

    //Method to trigger an event
    async emit(eventName, data){
        //Verify if this event exists
        if(!this.events.has(eventName)) return;
        //Verify if this event tab is empty
        if(this.events.get(eventName).length <= 0) return;
        //Execution of all the callback for this event
        for(const callback of this.events.get(eventName)){
            await callback(data);
        }
    }
}