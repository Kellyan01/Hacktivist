import {AbstractPlayable} from '../AbstractPlayable.js';
//Abstract Class for the Enemy Action
/*
@name : string
@type : string
@description : string
*/
export class AbstractAction extends AbstractPlayable{
    constructor(name, type, description){
        if(new.target === AbstractAction){
             throw new Error("AbstractAction can't be instantiated");
        }
        super(name, type, description)
    }
}