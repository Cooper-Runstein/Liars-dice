//DICE IMAGES
//####################
const die1 = document.createElement("img");
die1.src="images/die1.png";

const die2 = document.createElement("img");
die2.src="images/die2.png";

const die3 = document.createElement("img");
die3.src="images/die3.png";

const die4 = document.createElement("img");
die4.src="images/die4.png";

const die5 = document.createElement("img");
die5.src="images/die5.png";

const die6 = document.createElement("img");
die6.src="images/die6.png";

const diceImages = [die1, die2, die3, die4, die5, die6];

//Generic Display Functions
//####################

const displayElements = (array)=> {
    for (let element = 0; element < array.length; element++){
        array[element].style.display = 'block';}
};

const hideElements = (array)=> {
    for (let element = 0; element < array.length; element++){
        array[element].style.display = 'none';
    }
};

const displayAndHide = (arrayAdd, arrayDelete)=>{
    displayElements(arrayAdd);
    hideElements(arrayDelete);
};

//Dice Image Functions
//####################

const convertToDiceImages = hand =>{
    let imgHand = [];
    for (let i = 0; i < hand.length; i++){
        let face = hand[i];
        let diceImage = diceImages[face-1].cloneNode();
        imgHand.push(diceImage);
    }
    return imgHand;
};

const displayDiceImages = (parentNode, handImages) =>{
    for (let i = 0; i < handImages.length; i++){
        parentNode.appendChild(handImages[i]);
    }
};

const clearImages = parentNode =>{
    while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
};



const displayPlayers = (element, table)=>{
    let html = `<h3>PLayers</h3>`;
    for (let i =0; i<table.length; i++){
        html += `${table[i].name} - Dice Left: ${table[i].hand.length} <br>`
    }
    element.innerHTML = html;
};

const displayLastBet = (lastBet, element)=> {
    if (lastBet[0] !== 0) {
        element.innerHTML = `<h3>Last Bet: ${lastBet[1]} </h3>`;
        displayDiceImages(element, convertToDiceImages([lastBet[0]]))
    }
};

const displayRound = (result) => {
    hideElements([result]);
};



// EXPORTS
//####################
module.exports = {
    displayElements : displayElements,
    hideElements : hideElements,
    displayAndHide : displayAndHide,
    convertToDiceImages : convertToDiceImages,
    clearImages : clearImages,
    displayDiceImages: displayDiceImages,
    displayPlayers : displayPlayers,
    displayLastBet : displayLastBet,
    displayRound : displayRound,

};



