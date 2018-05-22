let main = require('./app.js');
let page = main.page;


die1 = document.createElement("img");
die2 = document.createElement("img");
die3 = document.createElement("img");
die4 = document.createElement("img");
die5 = document.createElement("img");
die6 = document.createElement("img");

die1.src = "images/die1.png";
die2.src = "images/die2.png";
die3.src = "images/die3.png";
die4.src = "images/die4.png";
die5.src = "images/die5.png";
die6.src = "images/die6.png";

let diceImages = [die1, die2, die3, die4, die5, die6];

//##### Element NDisplay Functions  #####
function displayElements(array){
    array.map(x => x.style.display = 'block');
}

function hideElements(array){
    array.map(x => x.style.display = 'none');
}

function displayAndHide(arrayAdd, arrayDelete) {
    displayElements(arrayAdd);
    hideElements(arrayDelete);
}

//##### Event Alter Display Functions #####
function getMessageColor (loser, winner){
    if (loser.player === true){
        return "text-danger";
    }else if(winner.player === true){
        return "text-success";
    }return ""

}

function displayPlayers(table, page){
    let html = `<h3>PLayers</h3>`;
    table.map(x => html += `${x.name} - Dice Left: ${x.hand.length} <br>`);
    page.atTable.innerHTML = html;
}

function displayLastBet(lastBet) {
    if (lastBet[0] !== 0) {
        page.test.innerHTML = `<h3>Last Bet: ${lastBet[1]} </h3>`;
        displayDiceImages(page.test, convertToDiceImages([lastBet[0]]))
    }
}

//##### Image Handlers #####
function convertToDiceImages(hand){
    let imgHand = [];
    for (let i = 0; i < hand.length; i++){
        let face = hand[i];
        let diceImage = diceImages[face-1].cloneNode();
        imgHand.push(diceImage);
    }
    return imgHand;
}

function displayDiceImages(parentNode, handImages){
    for (let i = 0; i < handImages.length; i++){
        parentNode.appendChild(handImages[i]);
    }
}
function clearImages(parentNode){
    while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
}




//##### EXPORTS #####
module.exports.displayElements = displayElements;
module.exports.hideElements = hideElements;
module.exports.displayAndHide = displayAndHide;
module.exports.getMessageColor = getMessageColor;
module.exports.displayLastBet = displayLastBet;
module.exports.convertToDiceImages = convertToDiceImages;
module.exports.displayDiceImages = displayDiceImages;
module.exports.clearImages = clearImages;
module.exports.displayPlayers = displayPlayers;