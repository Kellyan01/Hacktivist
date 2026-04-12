//Class for un Node of the Map (generated with BSP algorithm)
/*
@x : int
@y : int
@width : int
@height : int
@left : BSPNode
@right : BSPNode
@room : MapNode
*/
export class BSPNode {
    constructor(x,y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.left = null;
        this.right = null;
        this.room = null;
    }

    //Method to split the Node
    //@minNodeSize : int
    split(minNodeSize){
        //Verify if the Node is big enough to be sliced
        const canSplitHorizontal = this.height >= 2 * minNodeSize;
        const canSplitVertical = this.width >= 2 * minNodeSize;    
        if(!canSplitHorizontal && !canSplitVertical) return false;

        //Choose the orientation
        //a. Calculate the ratios
        const dimensionRatio = this.height / this.width;
        let splitHorizontal;

        //b. If(dimensionRatio >= 1.25) => Height > width => orientation = horizontal
        if(dimensionRatio >= 1.25) splitHorizontal = true;

        //c. if(dimensionRatio <= 0.8) => Width > height => orientation = vertical
        else if(dimensionRatio <= 0.8) splitHorizontal = false;

        //if 0.8 < dimensionRatio < 1.25, random orientation
        else splitHorizontal = Math.random() < 0.5;

        //MVerify it the orientation is possible
        if(splitHorizontal && !canSplitHorizontal) splitHorizontal = false;
        if(!splitHorizontal && !canSplitVertical) splitHorizontal = true;


        //SPLICE
        if(splitHorizontal){
            //Splice the Height
            const splice = minNodeSize + Math.floor(Math.random() * (this.height - 2 * minNodeSize + 1));

            //Create new Node
            this.left = new BSPNode(this.x,this.y,this.width,splice);
            this.right = new BSPNode(this.x,this.y + splice,this.width,this.height - splice);
        }else{
            //Splice the width
            const splice = minNodeSize + Math.floor(Math.random() * (this.width - 2 * minNodeSize + 1));

            //Create new Node
            this.left = new BSPNode(this.x,this.y,splice,this.height);
            this.right = new BSPNode(this.x + splice,this.y,this.width - splice,this.height);
        }
        return true;
    }
}