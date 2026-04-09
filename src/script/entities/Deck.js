//Class to Handle the Player Deck
/*
@cards : AbstractCard[]
@hand : AbstractCard[]
@discard : AbstractCard[]
*/
export class Deck{
    constructor(cards){
        this.cards = cards;
        this.hand = [];
        this.discard = [];
    }

    //Method to discard a Card
    //@card : AbstractCard
    discardCard(card) {
        //remove the card from the hand
        const index = this.hand.indexOf(card);
        if (index > -1) {
            this.hand.splice(index, 1);
            //add the card to the discard
            if(!card.exhaust) this.discard.push(card);
        }
    }

    //Method to draw cards
    draw(handSize) {
        //if the deck is empty, shuffle discard into deck
        if (this.cards.length === 0) {
            this.recycleDiscard();
        }

        //if hand size is reached or deck is empty, stop drawing
        if(this.hand.length === handSize || this.cards.length === 0) return;

        //draw a card
        this.hand.push(this.cards.pop());
        
        //call the method recursively until hand size is reached
        this.draw(handSize);
    }

    //Method pour shuffle the player deck
    shuffle() {
        //for each card in the deck, swap it with a random card int the deck
        for(let i = this.cards.length - 1; i > 0; i--){
            const randomIndex = Math.floor(Math.random()*(i+1));
            [this.cards[i], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[i]];
        }
    }

    //Method to shuffle Discard into Deck
    recycleDiscard() {
        //add discard to deck
        this.cards = this.cards.concat(this.discard);
        //empty discard
        this.discard = [];
        //shuffle deck
        this.shuffle();
    }
}