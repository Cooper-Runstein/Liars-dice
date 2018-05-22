let main = require('./app.js');

//##### Document Elements #####
let page = {
    currentHandDisplay : document.querySelector("#currentHand"),
    currentPlayerDisplay : document.querySelector("#playerDisplay"),
    playerOptionsDisplay : document.querySelector("#playerOptions"),
    test : document.querySelector("#test"),
    test2 : document.querySelector("#test2"),
    declareDisplay : document.querySelector("#declareDisplay"),
    faceDisplay : document.querySelector("#faceDisplay"),
    result : document.querySelector("#result"),
    inputs : document.querySelector("#inputs"),
    betDisplay : document.querySelector("#betDisplay"),
    gameOver : document.querySelector("#gameOver"),
    atTable : document.querySelector("#players"),

    startButton : document.querySelector("button"),
    nextPlayerButton : document.querySelector("#nextPlayer"),
    bluffButton : document.querySelector("#bluff"),
    spotOnButton : document.querySelector("#spotOn"),
    declareButton : document.querySelector("#declare"),
    nextRoundButton : document.querySelector("#nextRound"),
    faceInput : document.getElementById('face'),
    countInput : document.getElementById('count'),
    passButton : document.getElementById('pass'),
    nameInput : document.getElementById('getName'),
    submit : document.getElementById("submit"),
    playersInput : document.getElementById("getPlayers"),
};


const die1 = document.createElement("img");
const die2 = document.createElement("img");
const die3 = document.createElement("img");
const die4 = document.createElement("img");
const die5 = document.createElement("img");
const die6 = document.createElement("img");

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

const displayRound = () => {
    hideElements([page.result]);
};

const displayChallengeStatus = (challenge, challenger) =>{
    if (challenge){
        page.faceDisplay.innerHTML = `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`;
    }else{
        page.faceDisplay.innerHTML = `<div class="text-warning display-4">No one challenges</div>`;
    }
};

let cleanBoard = () => hideElements([page.submit, page.nameInput, page.playersInput, page.bluffButton, page.spotOnButton, page.passButton, page.nextRoundButton, page.nextPlayerButton, page.faceDisplay, page.playerOptionsDisplay, page.declareButton, page.declareDisplay, page.inputs, page.result, page.betDisplay, page.gameOver]);

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
module.exports = {
    displayElements : displayElements,
    hideElements : hideElements,
    displayAndHide : displayAndHide,
    getMessageColor : getMessageColor,
    displayLastBet : displayLastBet,
    convertToDiceImages : convertToDiceImages,
    displayDiceImages : displayDiceImages,
    clearImages : clearImages,
    displayPlayers : displayPlayers,
    displayRound : displayRound,
    displayChallengeStatus : displayChallengeStatus,
};
