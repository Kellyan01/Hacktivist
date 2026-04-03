//Class for the Status of a character, which can be used to apply effects like poison, burn, etc.
/*
@name : string
@type : string
@intensity : int
@duration : int
*/
export class Status{
    constructor(name, type,  intensity, duration){
        this.name = name;
        this.type = type;
        this.intensity = intensity;
        this.duration = duration;
    }
}