(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//########### IMPORTS ##########
//DISPLAY
let display = require('./display.js');
const displayElements = display.displayElements;
const hideElements = display.hideElements;
const displayAndHide = display.displayAndHide;
const getMessageColor = display.getMessageColor;
const displayLastBet = display.displayLastBet;
const convertToDiceImages = display.convertToDiceImages;
const displayDiceImages = display.displayDiceImages;
const clearImages = display.clearImages;
const displayPlayers = display.displayPlayers;


//###########Document buttons and displays##############
//displays
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

//Button Listeners
function eventListeners(){
    page.startButton.addEventListener('click', () => {
        displayAndHide([page.submit, page.playersInput, page.nameInput], [page.startButton]);
    });

    page.submit.addEventListener('click', ()=>{
        let gameInitialValues = getGameSettings();
        if(gameInitialValues !== false){
            game(gameInitialValues);}else{
            console.log("false");
        }
    });

    page.bluffButton.addEventListener('click', () => {
        challenger = table[0];
        challenged = currentPlayer;
        displayChallengeStatus(true);
        determineChallengeResult(true);
        endRound();
    });

    page.nextPlayerButton.addEventListener('click', () => {
        hideElements([page.nextPlayerButton]);
        clearImages(page.currentHandDisplay);
        readyNextPlayer();
        returnNewPlayerNumber();
    });

    page.nextRoundButton.addEventListener('click', () => {
        hideElements([page.nextRoundButton, page.test, page.test2]);
        resetRoundVariables();
        displayRound();
        startNextRound();
        firstPlayer();
    });

    page.declareButton.addEventListener('click', () => {
        if(processBetValidity(page.faceInput.value, page.countInput.value)) {
            console.log("declarebutton validated");
            let challengers = getChallengers(page.faceInput.value, true);
            if (challengers.length > 0){
                 challenger = getOpponent(challengers);
                 challenged = table[0];
                 displayChallengeStatus(true);
                 determineChallengeResult();
             }else{
                displayChallengeStatus(false);
                displayElements([page.nextPlayerButton]);
            }
     }
    });

    page.passButton.addEventListener('click', ()=>{
        displayAndHide([page.nextPlayerButton], [page.passButton, page.bluffButton, page.spotOnButton]);
    });

    page.spotOnButton.addEventListener('click', () => {
        console.log('SpotOn called');
        challenger = table[0];
        challenged = currentPlayer;
        let loser;
        if(checkSpotOn()){
            page.result.innerHTML = `<div class = "text-warning display-4"> Spot On True -> ${challenged.name} loses a die </div>`;
           loser = challenged;
        }else{
            page.result.innerHTML = `<div class = "text-warning display-4"> Spot On False-> ${challenger.name} loses a die </div>`;
            loser = challenger;
        }
        removeDie(loser);
        checkIfEliminated(loser);
        displayElements([page.result, page.nextRoundButton]);
        endRound();
    });
}

let names = [
    "Shirleen", "Kara", "Cleveland","Merri", "Conception", "Haley", "Florance", "Dorie", "Luella", "Vernia",
    "Freeman", "Katharina", "Charmain", "Graham", "Darnell", "Bernetta", "Inell", "Page", "Garnett", "Annalisa",
    "Brant", "Valda", "Viki", "Asuncion", "Moira", "Kaycee", "Richelle", "Elicia", "Eneida", "Evelynn"
];

//OBJECTS
class Player{
    constructor(name)
    {
        this.player = false;
        this.name = name || getRandomName();
        this.hand = [0,0,0,0];
        this.roll = () => {
            this.hand = this.hand.map(
                () => (Math.floor(Math.random() * 6) + 1)
            );
            console.log(`${this.name} has rolled`);
        };
        this.addToTable = () => {
            table.push(this);
        };
        this.addOccurrences = () => {
            for (let i = 0; i < this.hand.length; i++) {
                diceOnTableIndexedArray[this.hand[i] - 1] += 1;
            }
            numberOfDie += this.hand.length;
        };
        this.returnTrueIfAIChallenges = (face, player) => {
            let playerNum = getFaceCount(this, face);
            console.log(`face: ${face}`);
            console.log(`playerNumberofFace: ${playerNum}`);
            let pct = dieRatio(playerNum);
            console.log(`return ratio: ${pct}`);
            if (player === true){
                pct += (1/12);
            }
            if (pct <= (1 / 12)){
                return false;
            }else if (pct <= (2 / 12)) {
                return Math.random() < .2
            }else if (pct <= (4 / 12)){
                return Math.random() < .3
            }else if(pct <= (5 / 12)){
                return Math.random() < .5
            }else if(pct <= (6 / 12)){
                return Math.random() < .7
            }else{
                return true;
            }
        }
}}

let getFaceCount = (player, face)=>{
    let arr = countFaces(player.hand);
    console.log(player.name + arr);
    return arr[face-1];
};

let dieRatio = (playerNum) => {
    console.log("NUmber die on table" + numberOfDie);
    console.log("BFO arr" + betCount);
    return (betCount-playerNum)/numberOfDie;
};

//Main Variables
let table = [];
let PlayerNumber;
let currentHand;
let currentPlayer;
let lastBet = [0, 0];
let betCount = 0;
let diceOnTableIndexedArray = [0,0,0,0,0,0];
let numberOfDie = 0;
let challenger;
let challenged;

//#############Game Functions###################

const startGame = (initialValues) => {
    createHumanPlayer(initialValues);
    createAiPlayers(initialValues[1]);
    if (table[0] !== undefined) {
        table[0].player = true;}
};

const createHumanPlayer = (initialValues)=>{
    let human = new Player(initialValues[0]);
    human.addToTable(table);
};

const getGameSettings = ()=>{
    let name = page.nameInput.value;
    if (10 > page.playersInput.value > 0){
        let numPlayers = page.playersInput.value;
        hideElements([page.submit, page.playersInput, page.nameInput]);
        return ([name, numPlayers]);
    }return false;
};

const getRandomName = ()=> {
        let index = Math.floor(Math.random() * Math.floor(names.length));
        let name = names[index];
        names.splice(index, 1);
        return name;
};

const createAiPlayers = (num)=>{
    for (let i =0; i <num; i++){
        let x = new Player();
        x.addToTable();
    }
};

//Player set up
const setUpNextPlayer = () => {
   getNextPlayer();
   displayElements([page.currentPlayerDisplay, page.currentHandDisplay]);
   if (currentPlayer.player === true) {
      setUpHumanTurn();
    } else {
       setUpAiTurn();
    }
};

const setUpHumanTurn = ()=>{
    page.test2.innerHTML = "";
    displayElements([page.test2]);
    page.currentHandDisplay.innerHTML = `<h1 class="text-align"> Your Hand is: </h1>`;
    page.currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name}</h1>`;
    displayLastBet(lastBet);
    displayDiceImages(page.currentHandDisplay, convertToDiceImages(currentHand));
    displayAndHide([page.declareDisplay, page.declareButton, page.inputs], [page.spotOnButton, page.bluffButton, page.betDisplay, page.faceDisplay]);
};



const setUpAiTurn = ()=>{
    displayAndHide([page.spotOnButton, page.bluffButton, page.passButton, page.result, page.test], [page.currentHandDisplay]);
    page.result.innerHTML = "";
    page.currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name} is playing</h1>`;
    page.test.innerHTML = `Your hand is:`;
    displayDiceImages(page.test, convertToDiceImages(table[0].hand));
    lastBet = aiPlays();
    runAiAgainstAi();
};

const runAiAgainstAi = ()=>{
    let challengers = getChallengers(lastBet[0], false);
    console.log(challengers);
    if (challengers.length > 0){
        challenger = getOpponent(challengers);
        challenged = currentPlayer;
        hideElements([page.bluffButton, page.spotOnButton, page.passButton]);
        displayChallengeStatus(true);
        determineChallengeResult();
    }else{
        displayChallengeStatus(false);
    }
};

const getNextPlayer = ()=>{
    currentPlayer = table[PlayerNumber];
    currentHand = currentPlayer.hand;
};

const firstPlayer = () => {
    setUpNextPlayer();
    PlayerNumber += 1;
    returnNewPlayerNumber();
};

const readyNextPlayer = () => {
    setUpNextPlayer();
    PlayerNumber += 1;
};

const returnNewPlayerNumber = () => {
    if (PlayerNumber >= table.length || PlayerNumber === undefined) {
        PlayerNumber = 0;
    } else if (PlayerNumber < 0) {
        PlayerNumber = table.length - 1;
    }
};

//NEW ROUND
const startNextRound = () => {
    table.map(x => {
        x.roll();
        x.addOccurrences();
    });
    returnNewPlayerNumber();
    currentPlayer = table[PlayerNumber];
    displayPlayers(table, page);
    console.log(`startNextRound function exited`);

};

const endRound = () => {
    resetRoundVariables();
    page.test.innerHTML = "ROUND OVER";
    PlayerNumber -= 1;
};

const resetRoundVariables = () => {
    lastBet = [0,0];
    betCount = 0;
    numberOfDie = 0;
    diceOnTableIndexedArray=[0,0,0,0,0,0];
    hideElements([page.passButton, page.bluffButton, page.spotOnButton, page.nextPlayerButton]);
};

const displayRound = () => {
    hideElements([page.result]);
};

//GAME PLAY FUNCTIONS
const getBetTruth = () => {
    let face = lastBet[0];
    let count = lastBet[1];
    console.log(diceOnTableIndexedArray);
    return diceOnTableIndexedArray[face - 1] >= count;
};

const processBetValidity = (face, count) => {
    let bet = getBetIfValid(face, count);
    if (bet !== false) {
        lastBet = bet;
        displayAndHide([page.faceDisplay], [page.declareDisplay, page.declareButton, page.inputs]);
        return true;
    } else {
        page.test2.innerHTML = `<p class="display-5 text-info">Not Valid Input</p>`;
    }
};


const getBetIfValid = (face, count) => {
    face = parseInt(face);
    count = parseInt(count);
    let lastFace = lastBet[0];
    let lastCount = lastBet[1];
    console.log(`lastFace = ${lastBet[0]}, lastCount = ${lastBet[1]} face=${face}, count=${count}`);
    if (
        (   ((face > lastFace) && (count === lastCount)) &&
            ((count > 0) && (7 > face > 0))
        )

        ||

        ((count > lastCount) && ((count > 0) && (7 > face && face > 0)))
    ) {
        betCount = count;
        return [face, count];
    }
    return false;
};

const getChallengers = (face, player)=>{
    let challengers = [];
    for (let i=1; i < table.length; i++){
        if(table[i].returnTrueIfAIChallenges(face, player)){
            if (table[i] !== currentPlayer){
            challengers.push(table[i])}
        }
    }
    console.log(`Possible Challengers: ${challengers}`);
    if (Math.random() > .3){
    return challengers;
    }

    return [];
};

const getOpponent = (challengers)=>{
    let index = Math.floor(Math.random() * Math.floor(challengers.length));

    console.log(challengers[index]);
    return challengers[index]
};

const displayChallengeStatus = (challenge) =>{
    if (challenge){
        page.faceDisplay.innerHTML = `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`;
    }else{
        page.faceDisplay.innerHTML = `<div class="text-warning display-4">No one challenges</div>`;
    }
};

const determineChallengeResult = () =>{
    console.log("determining challenges");
    displayAndHide([page.nextRoundButton, page.result], [page.nextPlayerButton]);
    handleChallengeCheck(getBetTruth());

};

const handleChallengeCheck = (betBoolean)=>{
    console.log("handle challenge function called");
    if(betBoolean){
        let color = getMessageColor(challenger,challenged);
        page.result.innerHTML = `<div class = "${color} display-4"> Challenge Failed -> ${challenger.name} loses a die </div>`;
        removeDie(challenger);
        checkIfEliminated(challenger);
}else{
        let color = getMessageColor(challenged, challenger);
        page.result.innerHTML = `<div class = "${color} display-4"> Challenge Succeeded -> ${challenged.name} loses a die </div>`;
        removeDie(challenged);
        checkIfEliminated(challenged);
    }
};



const checkSpotOn = () =>{
    return (diceOnTableIndexedArray[lastBet[0] -1] === lastBet[1])
};

const checkIfEliminated = (betLoser)=>{
    if (returnIfLastDie(betLoser)){
        handleLastDieLost(betLoser);
        checkForWinner();
    }
};

const removeDie = (player) =>{
    player.hand  = player.hand.splice(1);
};

//Computer bets
const aiPlays = ()=> {
    let newBet = playerBet();
    betCount = newBet[1];
    displayElements([page.betDisplay]);
    page.betDisplay.innerHTML = `<p class="display-4">${currentPlayer.name} bets there are <br> ${newBet[1]} <span id="dice"> </span>s on the table</p>`;
    displayDiceImages(page.betDisplay, convertToDiceImages([newBet[0]]));
    return newBet;
};

const countFaces = (hand) =>{
    let currentHandInts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < hand.length; i++) {
        currentHandInts[hand[i] - 1] += 1;
    }
    return currentHandInts;
};
const playerBet = () => {
    let currentHandInts = countFaces(currentHand);
    let largestCount = Math.max(...currentHandInts);
    let bestHand = [currentHandInts.indexOf(largestCount)+1, largestCount];
    return aiBluff(bestHand);
};

const aiBluff = (bestHand)=>{
    while (aiCheckCurrentHandValidity(bestHand) !== true){
        bestHand[1] += 1;
    }
    if (Math.random() < .3){
        bestHand[1] += 1;
        return bestHand;
    }else{
        if (Math.random() < .1){
            bestHand[1] += 2;
            return bestHand;
        }
    }
    return bestHand
};

const aiCheckCurrentHandValidity = hand => {
    return ((hand[0] > lastBet[0]  && hand[1] >= lastBet[1]) || hand[1] > lastBet[1])
};

const returnIfLastDie = player => {
    return player.hand.length === 0;
};

const handleLastDieLost = player =>{
    console.log(`Handling last dice of ${player.name}`);
    let index = table.indexOf(player);
    console.log(index);
    console.log(table[index]);
    if (table[index].player === true){
        displayElements([page.gameOver]);
        page.gameOver.innerHTML="YOU LOSE"
    }else{
        displayElements([page.test2]);
        page.test2.innerHTML = `<h1 class="text-warning">${player.name} has been eliminated</h1>`;
        table.splice(index, 1);
    }
    console.log(table);
};

const checkForWinner = ()=>{
    if (table.length === 1){
        console.log('########GAME OVER###########');
        page.result.innerHTML = "YOU WIN";
        displayElements([page.gameOver]);
    }
};

//Game Start Functions
let cleanBoard = () => hideElements([page.submit, page.nameInput, page.playersInput, page.bluffButton, page.spotOnButton, page.passButton, page.nextRoundButton, page.nextPlayerButton, page.faceDisplay, page.playerOptionsDisplay, page.declareButton, page.declareDisplay, page.inputs, page.result, page.betDisplay, page.gameOver]);

let game = (initialValues) => {
    startGame(initialValues);
    startNextRound();
    firstPlayer();
};

cleanBoard();
eventListeners();

module.exports.page = page;




},{"./display.js":2}],2:[function(require,module,exports){
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
},{"./app.js":1}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9kaXNwbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyMjIyMjIyMjIyMjIElNUE9SVFMgIyMjIyMjIyMjI1xuLy9ESVNQTEFZXG5sZXQgZGlzcGxheSA9IHJlcXVpcmUoJy4vZGlzcGxheS5qcycpO1xuY29uc3QgZGlzcGxheUVsZW1lbnRzID0gZGlzcGxheS5kaXNwbGF5RWxlbWVudHM7XG5jb25zdCBoaWRlRWxlbWVudHMgPSBkaXNwbGF5LmhpZGVFbGVtZW50cztcbmNvbnN0IGRpc3BsYXlBbmRIaWRlID0gZGlzcGxheS5kaXNwbGF5QW5kSGlkZTtcbmNvbnN0IGdldE1lc3NhZ2VDb2xvciA9IGRpc3BsYXkuZ2V0TWVzc2FnZUNvbG9yO1xuY29uc3QgZGlzcGxheUxhc3RCZXQgPSBkaXNwbGF5LmRpc3BsYXlMYXN0QmV0O1xuY29uc3QgY29udmVydFRvRGljZUltYWdlcyA9IGRpc3BsYXkuY29udmVydFRvRGljZUltYWdlcztcbmNvbnN0IGRpc3BsYXlEaWNlSW1hZ2VzID0gZGlzcGxheS5kaXNwbGF5RGljZUltYWdlcztcbmNvbnN0IGNsZWFySW1hZ2VzID0gZGlzcGxheS5jbGVhckltYWdlcztcbmNvbnN0IGRpc3BsYXlQbGF5ZXJzID0gZGlzcGxheS5kaXNwbGF5UGxheWVycztcblxuXG4vLyMjIyMjIyMjIyMjRG9jdW1lbnQgYnV0dG9ucyBhbmQgZGlzcGxheXMjIyMjIyMjIyMjIyMjI1xuLy9kaXNwbGF5c1xubGV0IHBhZ2UgPSB7XG4gICAgY3VycmVudEhhbmREaXNwbGF5IDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjdXJyZW50SGFuZFwiKSxcbiAgICBjdXJyZW50UGxheWVyRGlzcGxheSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyRGlzcGxheVwiKSxcbiAgICBwbGF5ZXJPcHRpb25zRGlzcGxheSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyT3B0aW9uc1wiKSxcbiAgICB0ZXN0IDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXN0XCIpLFxuICAgIHRlc3QyIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXN0MlwiKSxcbiAgICBkZWNsYXJlRGlzcGxheSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZURpc3BsYXlcIiksXG4gICAgZmFjZURpc3BsYXkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZhY2VEaXNwbGF5XCIpLFxuICAgIHJlc3VsdCA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdWx0XCIpLFxuICAgIGlucHV0cyA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5wdXRzXCIpLFxuICAgIGJldERpc3BsYXkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JldERpc3BsYXlcIiksXG4gICAgZ2FtZU92ZXIgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVPdmVyXCIpLFxuICAgIGF0VGFibGUgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIiksXG5cbiAgICBzdGFydEJ1dHRvbiA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b25cIiksXG4gICAgbmV4dFBsYXllckJ1dHRvbiA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFBsYXllclwiKSxcbiAgICBibHVmZkJ1dHRvbiA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYmx1ZmZcIiksXG4gICAgc3BvdE9uQnV0dG9uIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzcG90T25cIiksXG4gICAgZGVjbGFyZUJ1dHRvbiA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZVwiKSxcbiAgICBuZXh0Um91bmRCdXR0b24gOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25leHRSb3VuZFwiKSxcbiAgICBmYWNlSW5wdXQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFjZScpLFxuICAgIGNvdW50SW5wdXQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnQnKSxcbiAgICBwYXNzQnV0dG9uIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3MnKSxcbiAgICBuYW1lSW5wdXQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0TmFtZScpLFxuICAgIHN1Ym1pdCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpLFxuICAgIHBsYXllcnNJbnB1dCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2V0UGxheWVyc1wiKSxcbn07XG5cbi8vQnV0dG9uIExpc3RlbmVyc1xuZnVuY3Rpb24gZXZlbnRMaXN0ZW5lcnMoKXtcbiAgICBwYWdlLnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbcGFnZS5zdWJtaXQsIHBhZ2UucGxheWVyc0lucHV0LCBwYWdlLm5hbWVJbnB1dF0sIFtwYWdlLnN0YXJ0QnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBwYWdlLnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XG4gICAgICAgIGxldCBnYW1lSW5pdGlhbFZhbHVlcyA9IGdldEdhbWVTZXR0aW5ncygpO1xuICAgICAgICBpZihnYW1lSW5pdGlhbFZhbHVlcyAhPT0gZmFsc2Upe1xuICAgICAgICAgICAgZ2FtZShnYW1lSW5pdGlhbFZhbHVlcyk7fWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhbHNlXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBwYWdlLmJsdWZmQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjaGFsbGVuZ2VyID0gdGFibGVbMF07XG4gICAgICAgIGNoYWxsZW5nZWQgPSBjdXJyZW50UGxheWVyO1xuICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKHRydWUpO1xuICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQodHJ1ZSk7XG4gICAgICAgIGVuZFJvdW5kKCk7XG4gICAgfSk7XG5cbiAgICBwYWdlLm5leHRQbGF5ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbcGFnZS5uZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgIGNsZWFySW1hZ2VzKHBhZ2UuY3VycmVudEhhbmREaXNwbGF5KTtcbiAgICAgICAgcmVhZHlOZXh0UGxheWVyKCk7XG4gICAgICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xuICAgIH0pO1xuXG4gICAgcGFnZS5uZXh0Um91bmRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbcGFnZS5uZXh0Um91bmRCdXR0b24sIHBhZ2UudGVzdCwgcGFnZS50ZXN0Ml0pO1xuICAgICAgICByZXNldFJvdW5kVmFyaWFibGVzKCk7XG4gICAgICAgIGRpc3BsYXlSb3VuZCgpO1xuICAgICAgICBzdGFydE5leHRSb3VuZCgpO1xuICAgICAgICBmaXJzdFBsYXllcigpO1xuICAgIH0pO1xuXG4gICAgcGFnZS5kZWNsYXJlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZihwcm9jZXNzQmV0VmFsaWRpdHkocGFnZS5mYWNlSW5wdXQudmFsdWUsIHBhZ2UuY291bnRJbnB1dC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVjbGFyZWJ1dHRvbiB2YWxpZGF0ZWRcIik7XG4gICAgICAgICAgICBsZXQgY2hhbGxlbmdlcnMgPSBnZXRDaGFsbGVuZ2VycyhwYWdlLmZhY2VJbnB1dC52YWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZWQgPSB0YWJsZVswXTtcbiAgICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KCk7XG4gICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtwYWdlLm5leHRQbGF5ZXJCdXR0b25dKTtcbiAgICAgICAgICAgIH1cbiAgICAgfVxuICAgIH0pO1xuXG4gICAgcGFnZS5wYXNzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PntcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW3BhZ2UubmV4dFBsYXllckJ1dHRvbl0sIFtwYWdlLnBhc3NCdXR0b24sIHBhZ2UuYmx1ZmZCdXR0b24sIHBhZ2Uuc3BvdE9uQnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBwYWdlLnNwb3RPbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Nwb3RPbiBjYWxsZWQnKTtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgbGV0IGxvc2VyO1xuICAgICAgICBpZihjaGVja1Nwb3RPbigpKXtcbiAgICAgICAgICAgIHBhZ2UucmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gVHJ1ZSAtPiAke2NoYWxsZW5nZWQubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgICAgbG9zZXIgPSBjaGFsbGVuZ2VkO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHBhZ2UucmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gRmFsc2UtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgICAgIGxvc2VyID0gY2hhbGxlbmdlcjtcbiAgICAgICAgfVxuICAgICAgICByZW1vdmVEaWUobG9zZXIpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChsb3Nlcik7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS5yZXN1bHQsIHBhZ2UubmV4dFJvdW5kQnV0dG9uXSk7XG4gICAgICAgIGVuZFJvdW5kKCk7XG4gICAgfSk7XG59XG5cbmxldCBuYW1lcyA9IFtcbiAgICBcIlNoaXJsZWVuXCIsIFwiS2FyYVwiLCBcIkNsZXZlbGFuZFwiLFwiTWVycmlcIiwgXCJDb25jZXB0aW9uXCIsIFwiSGFsZXlcIiwgXCJGbG9yYW5jZVwiLCBcIkRvcmllXCIsIFwiTHVlbGxhXCIsIFwiVmVybmlhXCIsXG4gICAgXCJGcmVlbWFuXCIsIFwiS2F0aGFyaW5hXCIsIFwiQ2hhcm1haW5cIiwgXCJHcmFoYW1cIiwgXCJEYXJuZWxsXCIsIFwiQmVybmV0dGFcIiwgXCJJbmVsbFwiLCBcIlBhZ2VcIiwgXCJHYXJuZXR0XCIsIFwiQW5uYWxpc2FcIixcbiAgICBcIkJyYW50XCIsIFwiVmFsZGFcIiwgXCJWaWtpXCIsIFwiQXN1bmNpb25cIiwgXCJNb2lyYVwiLCBcIktheWNlZVwiLCBcIlJpY2hlbGxlXCIsIFwiRWxpY2lhXCIsIFwiRW5laWRhXCIsIFwiRXZlbHlublwiXG5dO1xuXG4vL09CSkVDVFNcbmNsYXNzIFBsYXllcntcbiAgICBjb25zdHJ1Y3RvcihuYW1lKVxuICAgIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZSB8fCBnZXRSYW5kb21OYW1lKCk7XG4gICAgICAgIHRoaXMuaGFuZCA9IFswLDAsMCwwXTtcbiAgICAgICAgdGhpcy5yb2xsID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kID0gdGhpcy5oYW5kLm1hcChcbiAgICAgICAgICAgICAgICAoKSA9PiAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNikgKyAxKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMubmFtZX0gaGFzIHJvbGxlZGApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZFRvVGFibGUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0YWJsZS5wdXNoKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZE9jY3VycmVuY2VzID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmhhbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheVt0aGlzLmhhbmRbaV0gLSAxXSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbnVtYmVyT2ZEaWUgKz0gdGhpcy5oYW5kLmxlbmd0aDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZXR1cm5UcnVlSWZBSUNoYWxsZW5nZXMgPSAoZmFjZSwgcGxheWVyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGxheWVyTnVtID0gZ2V0RmFjZUNvdW50KHRoaXMsIGZhY2UpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGZhY2U6ICR7ZmFjZX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBwbGF5ZXJOdW1iZXJvZkZhY2U6ICR7cGxheWVyTnVtfWApO1xuICAgICAgICAgICAgbGV0IHBjdCA9IGRpZVJhdGlvKHBsYXllck51bSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgcmV0dXJuIHJhdGlvOiAke3BjdH1gKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICAgICAgICAgIHBjdCArPSAoMS8xMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGN0IDw9ICgxIC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9ZWxzZSBpZiAocGN0IDw9ICgyIC8gMTIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuMlxuICAgICAgICAgICAgfWVsc2UgaWYgKHBjdCA8PSAoNCAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuM1xuICAgICAgICAgICAgfWVsc2UgaWYocGN0IDw9ICg1IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC41XG4gICAgICAgICAgICB9ZWxzZSBpZihwY3QgPD0gKDYgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjdcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG59fVxuXG5sZXQgZ2V0RmFjZUNvdW50ID0gKHBsYXllciwgZmFjZSk9PntcbiAgICBsZXQgYXJyID0gY291bnRGYWNlcyhwbGF5ZXIuaGFuZCk7XG4gICAgY29uc29sZS5sb2cocGxheWVyLm5hbWUgKyBhcnIpO1xuICAgIHJldHVybiBhcnJbZmFjZS0xXTtcbn07XG5cbmxldCBkaWVSYXRpbyA9IChwbGF5ZXJOdW0pID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk5VbWJlciBkaWUgb24gdGFibGVcIiArIG51bWJlck9mRGllKTtcbiAgICBjb25zb2xlLmxvZyhcIkJGTyBhcnJcIiArIGJldENvdW50KTtcbiAgICByZXR1cm4gKGJldENvdW50LXBsYXllck51bSkvbnVtYmVyT2ZEaWU7XG59O1xuXG4vL01haW4gVmFyaWFibGVzXG5sZXQgdGFibGUgPSBbXTtcbmxldCBQbGF5ZXJOdW1iZXI7XG5sZXQgY3VycmVudEhhbmQ7XG5sZXQgY3VycmVudFBsYXllcjtcbmxldCBsYXN0QmV0ID0gWzAsIDBdO1xubGV0IGJldENvdW50ID0gMDtcbmxldCBkaWNlT25UYWJsZUluZGV4ZWRBcnJheSA9IFswLDAsMCwwLDAsMF07XG5sZXQgbnVtYmVyT2ZEaWUgPSAwO1xubGV0IGNoYWxsZW5nZXI7XG5sZXQgY2hhbGxlbmdlZDtcblxuLy8jIyMjIyMjIyMjIyMjR2FtZSBGdW5jdGlvbnMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IHN0YXJ0R2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgY3JlYXRlSHVtYW5QbGF5ZXIoaW5pdGlhbFZhbHVlcyk7XG4gICAgY3JlYXRlQWlQbGF5ZXJzKGluaXRpYWxWYWx1ZXNbMV0pO1xuICAgIGlmICh0YWJsZVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhYmxlWzBdLnBsYXllciA9IHRydWU7fVxufTtcblxuY29uc3QgY3JlYXRlSHVtYW5QbGF5ZXIgPSAoaW5pdGlhbFZhbHVlcyk9PntcbiAgICBsZXQgaHVtYW4gPSBuZXcgUGxheWVyKGluaXRpYWxWYWx1ZXNbMF0pO1xuICAgIGh1bWFuLmFkZFRvVGFibGUodGFibGUpO1xufTtcblxuY29uc3QgZ2V0R2FtZVNldHRpbmdzID0gKCk9PntcbiAgICBsZXQgbmFtZSA9IHBhZ2UubmFtZUlucHV0LnZhbHVlO1xuICAgIGlmICgxMCA+IHBhZ2UucGxheWVyc0lucHV0LnZhbHVlID4gMCl7XG4gICAgICAgIGxldCBudW1QbGF5ZXJzID0gcGFnZS5wbGF5ZXJzSW5wdXQudmFsdWU7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbcGFnZS5zdWJtaXQsIHBhZ2UucGxheWVyc0lucHV0LCBwYWdlLm5hbWVJbnB1dF0pO1xuICAgICAgICByZXR1cm4gKFtuYW1lLCBudW1QbGF5ZXJzXSk7XG4gICAgfXJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJhbmRvbU5hbWUgPSAoKT0+IHtcbiAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihuYW1lcy5sZW5ndGgpKTtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpbmRleF07XG4gICAgICAgIG5hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xufTtcblxuY29uc3QgY3JlYXRlQWlQbGF5ZXJzID0gKG51bSk9PntcbiAgICBmb3IgKGxldCBpID0wOyBpIDxudW07IGkrKyl7XG4gICAgICAgIGxldCB4ID0gbmV3IFBsYXllcigpO1xuICAgICAgICB4LmFkZFRvVGFibGUoKTtcbiAgICB9XG59O1xuXG4vL1BsYXllciBzZXQgdXBcbmNvbnN0IHNldFVwTmV4dFBsYXllciA9ICgpID0+IHtcbiAgIGdldE5leHRQbGF5ZXIoKTtcbiAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS5jdXJyZW50UGxheWVyRGlzcGxheSwgcGFnZS5jdXJyZW50SGFuZERpc3BsYXldKTtcbiAgIGlmIChjdXJyZW50UGxheWVyLnBsYXllciA9PT0gdHJ1ZSkge1xuICAgICAgc2V0VXBIdW1hblR1cm4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgIHNldFVwQWlUdXJuKCk7XG4gICAgfVxufTtcblxuY29uc3Qgc2V0VXBIdW1hblR1cm4gPSAoKT0+e1xuICAgIHBhZ2UudGVzdDIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3BhZ2UudGVzdDJdKTtcbiAgICBwYWdlLmN1cnJlbnRIYW5kRGlzcGxheS5pbm5lckhUTUwgPSBgPGgxIGNsYXNzPVwidGV4dC1hbGlnblwiPiBZb3VyIEhhbmQgaXM6IDwvaDE+YDtcbiAgICBwYWdlLmN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9PC9oMT5gO1xuICAgIGRpc3BsYXlMYXN0QmV0KGxhc3RCZXQpO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKHBhZ2UuY3VycmVudEhhbmREaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKGN1cnJlbnRIYW5kKSk7XG4gICAgZGlzcGxheUFuZEhpZGUoW3BhZ2UuZGVjbGFyZURpc3BsYXksIHBhZ2UuZGVjbGFyZUJ1dHRvbiwgcGFnZS5pbnB1dHNdLCBbcGFnZS5zcG90T25CdXR0b24sIHBhZ2UuYmx1ZmZCdXR0b24sIHBhZ2UuYmV0RGlzcGxheSwgcGFnZS5mYWNlRGlzcGxheV0pO1xufTtcblxuXG5cbmNvbnN0IHNldFVwQWlUdXJuID0gKCk9PntcbiAgICBkaXNwbGF5QW5kSGlkZShbcGFnZS5zcG90T25CdXR0b24sIHBhZ2UuYmx1ZmZCdXR0b24sIHBhZ2UucGFzc0J1dHRvbiwgcGFnZS5yZXN1bHQsIHBhZ2UudGVzdF0sIFtwYWdlLmN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgIHBhZ2UucmVzdWx0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgcGFnZS5jdXJyZW50UGxheWVyRGlzcGxheS5pbm5lckhUTUwgPSBgPGgxIGNsYXNzPVwidGV4dC1hbGlnblwiPiR7Y3VycmVudFBsYXllci5uYW1lfSBpcyBwbGF5aW5nPC9oMT5gO1xuICAgIHBhZ2UudGVzdC5pbm5lckhUTUwgPSBgWW91ciBoYW5kIGlzOmA7XG4gICAgZGlzcGxheURpY2VJbWFnZXMocGFnZS50ZXN0LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKHRhYmxlWzBdLmhhbmQpKTtcbiAgICBsYXN0QmV0ID0gYWlQbGF5cygpO1xuICAgIHJ1bkFpQWdhaW5zdEFpKCk7XG59O1xuXG5jb25zdCBydW5BaUFnYWluc3RBaSA9ICgpPT57XG4gICAgbGV0IGNoYWxsZW5nZXJzID0gZ2V0Q2hhbGxlbmdlcnMobGFzdEJldFswXSwgZmFsc2UpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxsZW5nZXJzKTtcbiAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgIGNoYWxsZW5nZWQgPSBjdXJyZW50UGxheWVyO1xuICAgICAgICBoaWRlRWxlbWVudHMoW3BhZ2UuYmx1ZmZCdXR0b24sIHBhZ2Uuc3BvdE9uQnV0dG9uLCBwYWdlLnBhc3NCdXR0b25dKTtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KCk7XG4gICAgfWVsc2V7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMoZmFsc2UpO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldE5leHRQbGF5ZXIgPSAoKT0+e1xuICAgIGN1cnJlbnRQbGF5ZXIgPSB0YWJsZVtQbGF5ZXJOdW1iZXJdO1xuICAgIGN1cnJlbnRIYW5kID0gY3VycmVudFBsYXllci5oYW5kO1xufTtcblxuY29uc3QgZmlyc3RQbGF5ZXIgPSAoKSA9PiB7XG4gICAgc2V0VXBOZXh0UGxheWVyKCk7XG4gICAgUGxheWVyTnVtYmVyICs9IDE7XG4gICAgcmV0dXJuTmV3UGxheWVyTnVtYmVyKCk7XG59O1xuXG5jb25zdCByZWFkeU5leHRQbGF5ZXIgPSAoKSA9PiB7XG4gICAgc2V0VXBOZXh0UGxheWVyKCk7XG4gICAgUGxheWVyTnVtYmVyICs9IDE7XG59O1xuXG5jb25zdCByZXR1cm5OZXdQbGF5ZXJOdW1iZXIgPSAoKSA9PiB7XG4gICAgaWYgKFBsYXllck51bWJlciA+PSB0YWJsZS5sZW5ndGggfHwgUGxheWVyTnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgUGxheWVyTnVtYmVyID0gMDtcbiAgICB9IGVsc2UgaWYgKFBsYXllck51bWJlciA8IDApIHtcbiAgICAgICAgUGxheWVyTnVtYmVyID0gdGFibGUubGVuZ3RoIC0gMTtcbiAgICB9XG59O1xuXG4vL05FVyBST1VORFxuY29uc3Qgc3RhcnROZXh0Um91bmQgPSAoKSA9PiB7XG4gICAgdGFibGUubWFwKHggPT4ge1xuICAgICAgICB4LnJvbGwoKTtcbiAgICAgICAgeC5hZGRPY2N1cnJlbmNlcygpO1xuICAgIH0pO1xuICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xuICAgIGN1cnJlbnRQbGF5ZXIgPSB0YWJsZVtQbGF5ZXJOdW1iZXJdO1xuICAgIGRpc3BsYXlQbGF5ZXJzKHRhYmxlLCBwYWdlKTtcbiAgICBjb25zb2xlLmxvZyhgc3RhcnROZXh0Um91bmQgZnVuY3Rpb24gZXhpdGVkYCk7XG5cbn07XG5cbmNvbnN0IGVuZFJvdW5kID0gKCkgPT4ge1xuICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICBwYWdlLnRlc3QuaW5uZXJIVE1MID0gXCJST1VORCBPVkVSXCI7XG4gICAgUGxheWVyTnVtYmVyIC09IDE7XG59O1xuXG5jb25zdCByZXNldFJvdW5kVmFyaWFibGVzID0gKCkgPT4ge1xuICAgIGxhc3RCZXQgPSBbMCwwXTtcbiAgICBiZXRDb3VudCA9IDA7XG4gICAgbnVtYmVyT2ZEaWUgPSAwO1xuICAgIGRpY2VPblRhYmxlSW5kZXhlZEFycmF5PVswLDAsMCwwLDAsMF07XG4gICAgaGlkZUVsZW1lbnRzKFtwYWdlLnBhc3NCdXR0b24sIHBhZ2UuYmx1ZmZCdXR0b24sIHBhZ2Uuc3BvdE9uQnV0dG9uLCBwYWdlLm5leHRQbGF5ZXJCdXR0b25dKTtcbn07XG5cbmNvbnN0IGRpc3BsYXlSb3VuZCA9ICgpID0+IHtcbiAgICBoaWRlRWxlbWVudHMoW3BhZ2UucmVzdWx0XSk7XG59O1xuXG4vL0dBTUUgUExBWSBGVU5DVElPTlNcbmNvbnN0IGdldEJldFRydXRoID0gKCkgPT4ge1xuICAgIGxldCBmYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgY291bnQgPSBsYXN0QmV0WzFdO1xuICAgIGNvbnNvbGUubG9nKGRpY2VPblRhYmxlSW5kZXhlZEFycmF5KTtcbiAgICByZXR1cm4gZGljZU9uVGFibGVJbmRleGVkQXJyYXlbZmFjZSAtIDFdID49IGNvdW50O1xufTtcblxuY29uc3QgcHJvY2Vzc0JldFZhbGlkaXR5ID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgbGV0IGJldCA9IGdldEJldElmVmFsaWQoZmFjZSwgY291bnQpO1xuICAgIGlmIChiZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIGxhc3RCZXQgPSBiZXQ7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtwYWdlLmZhY2VEaXNwbGF5XSwgW3BhZ2UuZGVjbGFyZURpc3BsYXksIHBhZ2UuZGVjbGFyZUJ1dHRvbiwgcGFnZS5pbnB1dHNdKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZS50ZXN0Mi5pbm5lckhUTUwgPSBgPHAgY2xhc3M9XCJkaXNwbGF5LTUgdGV4dC1pbmZvXCI+Tm90IFZhbGlkIElucHV0PC9wPmA7XG4gICAgfVxufTtcblxuXG5jb25zdCBnZXRCZXRJZlZhbGlkID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgZmFjZSA9IHBhcnNlSW50KGZhY2UpO1xuICAgIGNvdW50ID0gcGFyc2VJbnQoY291bnQpO1xuICAgIGxldCBsYXN0RmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGxhc3RDb3VudCA9IGxhc3RCZXRbMV07XG4gICAgY29uc29sZS5sb2coYGxhc3RGYWNlID0gJHtsYXN0QmV0WzBdfSwgbGFzdENvdW50ID0gJHtsYXN0QmV0WzFdfSBmYWNlPSR7ZmFjZX0sIGNvdW50PSR7Y291bnR9YCk7XG4gICAgaWYgKFxuICAgICAgICAoICAgKChmYWNlID4gbGFzdEZhY2UpICYmIChjb3VudCA9PT0gbGFzdENvdW50KSkgJiZcbiAgICAgICAgICAgICgoY291bnQgPiAwKSAmJiAoNyA+IGZhY2UgPiAwKSlcbiAgICAgICAgKVxuXG4gICAgICAgIHx8XG5cbiAgICAgICAgKChjb3VudCA+IGxhc3RDb3VudCkgJiYgKChjb3VudCA+IDApICYmICg3ID4gZmFjZSAmJiBmYWNlID4gMCkpKVxuICAgICkge1xuICAgICAgICBiZXRDb3VudCA9IGNvdW50O1xuICAgICAgICByZXR1cm4gW2ZhY2UsIGNvdW50XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgZ2V0Q2hhbGxlbmdlcnMgPSAoZmFjZSwgcGxheWVyKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IFtdO1xuICAgIGZvciAobGV0IGk9MTsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYodGFibGVbaV0ucmV0dXJuVHJ1ZUlmQUlDaGFsbGVuZ2VzKGZhY2UsIHBsYXllcikpe1xuICAgICAgICAgICAgaWYgKHRhYmxlW2ldICE9PSBjdXJyZW50UGxheWVyKXtcbiAgICAgICAgICAgIGNoYWxsZW5nZXJzLnB1c2godGFibGVbaV0pfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBQb3NzaWJsZSBDaGFsbGVuZ2VyczogJHtjaGFsbGVuZ2Vyc31gKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IC4zKXtcbiAgICByZXR1cm4gY2hhbGxlbmdlcnM7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtdO1xufTtcblxuY29uc3QgZ2V0T3Bwb25lbnQgPSAoY2hhbGxlbmdlcnMpPT57XG4gICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihjaGFsbGVuZ2Vycy5sZW5ndGgpKTtcblxuICAgIGNvbnNvbGUubG9nKGNoYWxsZW5nZXJzW2luZGV4XSk7XG4gICAgcmV0dXJuIGNoYWxsZW5nZXJzW2luZGV4XVxufTtcblxuY29uc3QgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyA9IChjaGFsbGVuZ2UpID0+e1xuICAgIGlmIChjaGFsbGVuZ2Upe1xuICAgICAgICBwYWdlLmZhY2VEaXNwbGF5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPkNIQUxMRU5HRUQgQlkgJHtjaGFsbGVuZ2VyLm5hbWV9PC9kaXY+YDtcbiAgICB9ZWxzZXtcbiAgICAgICAgcGFnZS5mYWNlRGlzcGxheS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj5ObyBvbmUgY2hhbGxlbmdlczwvZGl2PmA7XG4gICAgfVxufTtcblxuY29uc3QgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0ID0gKCkgPT57XG4gICAgY29uc29sZS5sb2coXCJkZXRlcm1pbmluZyBjaGFsbGVuZ2VzXCIpO1xuICAgIGRpc3BsYXlBbmRIaWRlKFtwYWdlLm5leHRSb3VuZEJ1dHRvbiwgcGFnZS5yZXN1bHRdLCBbcGFnZS5uZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgaGFuZGxlQ2hhbGxlbmdlQ2hlY2soZ2V0QmV0VHJ1dGgoKSk7XG5cbn07XG5cbmNvbnN0IGhhbmRsZUNoYWxsZW5nZUNoZWNrID0gKGJldEJvb2xlYW4pPT57XG4gICAgY29uc29sZS5sb2coXCJoYW5kbGUgY2hhbGxlbmdlIGZ1bmN0aW9uIGNhbGxlZFwiKTtcbiAgICBpZihiZXRCb29sZWFuKXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZXIsY2hhbGxlbmdlZCk7XG4gICAgICAgIHBhZ2UucmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCIke2NvbG9yfSBkaXNwbGF5LTRcIj4gQ2hhbGxlbmdlIEZhaWxlZCAtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgcmVtb3ZlRGllKGNoYWxsZW5nZXIpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChjaGFsbGVuZ2VyKTtcbn1lbHNle1xuICAgICAgICBsZXQgY29sb3IgPSBnZXRNZXNzYWdlQ29sb3IoY2hhbGxlbmdlZCwgY2hhbGxlbmdlcik7XG4gICAgICAgIHBhZ2UucmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCIke2NvbG9yfSBkaXNwbGF5LTRcIj4gQ2hhbGxlbmdlIFN1Y2NlZWRlZCAtPiAke2NoYWxsZW5nZWQubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgcmVtb3ZlRGllKGNoYWxsZW5nZWQpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChjaGFsbGVuZ2VkKTtcbiAgICB9XG59O1xuXG5cblxuY29uc3QgY2hlY2tTcG90T24gPSAoKSA9PntcbiAgICByZXR1cm4gKGRpY2VPblRhYmxlSW5kZXhlZEFycmF5W2xhc3RCZXRbMF0gLTFdID09PSBsYXN0QmV0WzFdKVxufTtcblxuY29uc3QgY2hlY2tJZkVsaW1pbmF0ZWQgPSAoYmV0TG9zZXIpPT57XG4gICAgaWYgKHJldHVybklmTGFzdERpZShiZXRMb3Nlcikpe1xuICAgICAgICBoYW5kbGVMYXN0RGllTG9zdChiZXRMb3Nlcik7XG4gICAgICAgIGNoZWNrRm9yV2lubmVyKCk7XG4gICAgfVxufTtcblxuY29uc3QgcmVtb3ZlRGllID0gKHBsYXllcikgPT57XG4gICAgcGxheWVyLmhhbmQgID0gcGxheWVyLmhhbmQuc3BsaWNlKDEpO1xufTtcblxuLy9Db21wdXRlciBiZXRzXG5jb25zdCBhaVBsYXlzID0gKCk9PiB7XG4gICAgbGV0IG5ld0JldCA9IHBsYXllckJldCgpO1xuICAgIGJldENvdW50ID0gbmV3QmV0WzFdO1xuICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS5iZXREaXNwbGF5XSk7XG4gICAgcGFnZS5iZXREaXNwbGF5LmlubmVySFRNTCA9IGA8cCBjbGFzcz1cImRpc3BsYXktNFwiPiR7Y3VycmVudFBsYXllci5uYW1lfSBiZXRzIHRoZXJlIGFyZSA8YnI+ICR7bmV3QmV0WzFdfSA8c3BhbiBpZD1cImRpY2VcIj4gPC9zcGFuPnMgb24gdGhlIHRhYmxlPC9wPmA7XG4gICAgZGlzcGxheURpY2VJbWFnZXMocGFnZS5iZXREaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKFtuZXdCZXRbMF1dKSk7XG4gICAgcmV0dXJuIG5ld0JldDtcbn07XG5cbmNvbnN0IGNvdW50RmFjZXMgPSAoaGFuZCkgPT57XG4gICAgbGV0IGN1cnJlbnRIYW5kSW50cyA9IFswLCAwLCAwLCAwLCAwLCAwXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3VycmVudEhhbmRJbnRzW2hhbmRbaV0gLSAxXSArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudEhhbmRJbnRzO1xufTtcbmNvbnN0IHBsYXllckJldCA9ICgpID0+IHtcbiAgICBsZXQgY3VycmVudEhhbmRJbnRzID0gY291bnRGYWNlcyhjdXJyZW50SGFuZCk7XG4gICAgbGV0IGxhcmdlc3RDb3VudCA9IE1hdGgubWF4KC4uLmN1cnJlbnRIYW5kSW50cyk7XG4gICAgbGV0IGJlc3RIYW5kID0gW2N1cnJlbnRIYW5kSW50cy5pbmRleE9mKGxhcmdlc3RDb3VudCkrMSwgbGFyZ2VzdENvdW50XTtcbiAgICByZXR1cm4gYWlCbHVmZihiZXN0SGFuZCk7XG59O1xuXG5jb25zdCBhaUJsdWZmID0gKGJlc3RIYW5kKT0+e1xuICAgIHdoaWxlIChhaUNoZWNrQ3VycmVudEhhbmRWYWxpZGl0eShiZXN0SGFuZCkgIT09IHRydWUpe1xuICAgICAgICBiZXN0SGFuZFsxXSArPSAxO1xuICAgIH1cbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IC4zKXtcbiAgICAgICAgYmVzdEhhbmRbMV0gKz0gMTtcbiAgICAgICAgcmV0dXJuIGJlc3RIYW5kO1xuICAgIH1lbHNle1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IC4xKXtcbiAgICAgICAgICAgIGJlc3RIYW5kWzFdICs9IDI7XG4gICAgICAgICAgICByZXR1cm4gYmVzdEhhbmQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3RIYW5kXG59O1xuXG5jb25zdCBhaUNoZWNrQ3VycmVudEhhbmRWYWxpZGl0eSA9IGhhbmQgPT4ge1xuICAgIHJldHVybiAoKGhhbmRbMF0gPiBsYXN0QmV0WzBdICAmJiBoYW5kWzFdID49IGxhc3RCZXRbMV0pIHx8IGhhbmRbMV0gPiBsYXN0QmV0WzFdKVxufTtcblxuY29uc3QgcmV0dXJuSWZMYXN0RGllID0gcGxheWVyID0+IHtcbiAgICByZXR1cm4gcGxheWVyLmhhbmQubGVuZ3RoID09PSAwO1xufTtcblxuY29uc3QgaGFuZGxlTGFzdERpZUxvc3QgPSBwbGF5ZXIgPT57XG4gICAgY29uc29sZS5sb2coYEhhbmRsaW5nIGxhc3QgZGljZSBvZiAke3BsYXllci5uYW1lfWApO1xuICAgIGxldCBpbmRleCA9IHRhYmxlLmluZGV4T2YocGxheWVyKTtcbiAgICBjb25zb2xlLmxvZyhpbmRleCk7XG4gICAgY29uc29sZS5sb2codGFibGVbaW5kZXhdKTtcbiAgICBpZiAodGFibGVbaW5kZXhdLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS5nYW1lT3Zlcl0pO1xuICAgICAgICBwYWdlLmdhbWVPdmVyLmlubmVySFRNTD1cIllPVSBMT1NFXCJcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtwYWdlLnRlc3QyXSk7XG4gICAgICAgIHBhZ2UudGVzdDIuaW5uZXJIVE1MID0gYDxoMSBjbGFzcz1cInRleHQtd2FybmluZ1wiPiR7cGxheWVyLm5hbWV9IGhhcyBiZWVuIGVsaW1pbmF0ZWQ8L2gxPmA7XG4gICAgICAgIHRhYmxlLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRhYmxlKTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yV2lubmVyID0gKCk9PntcbiAgICBpZiAodGFibGUubGVuZ3RoID09PSAxKXtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjR0FNRSBPVkVSIyMjIyMjIyMjIyMnKTtcbiAgICAgICAgcGFnZS5yZXN1bHQuaW5uZXJIVE1MID0gXCJZT1UgV0lOXCI7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS5nYW1lT3Zlcl0pO1xuICAgIH1cbn07XG5cbi8vR2FtZSBTdGFydCBGdW5jdGlvbnNcbmxldCBjbGVhbkJvYXJkID0gKCkgPT4gaGlkZUVsZW1lbnRzKFtwYWdlLnN1Ym1pdCwgcGFnZS5uYW1lSW5wdXQsIHBhZ2UucGxheWVyc0lucHV0LCBwYWdlLmJsdWZmQnV0dG9uLCBwYWdlLnNwb3RPbkJ1dHRvbiwgcGFnZS5wYXNzQnV0dG9uLCBwYWdlLm5leHRSb3VuZEJ1dHRvbiwgcGFnZS5uZXh0UGxheWVyQnV0dG9uLCBwYWdlLmZhY2VEaXNwbGF5LCBwYWdlLnBsYXllck9wdGlvbnNEaXNwbGF5LCBwYWdlLmRlY2xhcmVCdXR0b24sIHBhZ2UuZGVjbGFyZURpc3BsYXksIHBhZ2UuaW5wdXRzLCBwYWdlLnJlc3VsdCwgcGFnZS5iZXREaXNwbGF5LCBwYWdlLmdhbWVPdmVyXSk7XG5cbmxldCBnYW1lID0gKGluaXRpYWxWYWx1ZXMpID0+IHtcbiAgICBzdGFydEdhbWUoaW5pdGlhbFZhbHVlcyk7XG4gICAgc3RhcnROZXh0Um91bmQoKTtcbiAgICBmaXJzdFBsYXllcigpO1xufTtcblxuY2xlYW5Cb2FyZCgpO1xuZXZlbnRMaXN0ZW5lcnMoKTtcblxubW9kdWxlLmV4cG9ydHMucGFnZSA9IHBhZ2U7XG5cblxuXG4iLCJsZXQgbWFpbiA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG5sZXQgcGFnZSA9IG1haW4ucGFnZTtcblxuXG5kaWUxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cbmRpZTEuc3JjID0gXCJpbWFnZXMvZGllMS5wbmdcIjtcbmRpZTIuc3JjID0gXCJpbWFnZXMvZGllMi5wbmdcIjtcbmRpZTMuc3JjID0gXCJpbWFnZXMvZGllMy5wbmdcIjtcbmRpZTQuc3JjID0gXCJpbWFnZXMvZGllNC5wbmdcIjtcbmRpZTUuc3JjID0gXCJpbWFnZXMvZGllNS5wbmdcIjtcbmRpZTYuc3JjID0gXCJpbWFnZXMvZGllNi5wbmdcIjtcblxubGV0IGRpY2VJbWFnZXMgPSBbZGllMSwgZGllMiwgZGllMywgZGllNCwgZGllNSwgZGllNl07XG5cbi8vIyMjIyMgRWxlbWVudCBORGlzcGxheSBGdW5jdGlvbnMgICMjIyMjXG5mdW5jdGlvbiBkaXNwbGF5RWxlbWVudHMoYXJyYXkpe1xuICAgIGFycmF5Lm1hcCh4ID0+IHguc3R5bGUuZGlzcGxheSA9ICdibG9jaycpO1xufVxuXG5mdW5jdGlvbiBoaWRlRWxlbWVudHMoYXJyYXkpe1xuICAgIGFycmF5Lm1hcCh4ID0+IHguc3R5bGUuZGlzcGxheSA9ICdub25lJyk7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlBbmRIaWRlKGFycmF5QWRkLCBhcnJheURlbGV0ZSkge1xuICAgIGRpc3BsYXlFbGVtZW50cyhhcnJheUFkZCk7XG4gICAgaGlkZUVsZW1lbnRzKGFycmF5RGVsZXRlKTtcbn1cblxuLy8jIyMjIyBFdmVudCBBbHRlciBEaXNwbGF5IEZ1bmN0aW9ucyAjIyMjI1xuZnVuY3Rpb24gZ2V0TWVzc2FnZUNvbG9yIChsb3Nlciwgd2lubmVyKXtcbiAgICBpZiAobG9zZXIucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIFwidGV4dC1kYW5nZXJcIjtcbiAgICB9ZWxzZSBpZih3aW5uZXIucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIFwidGV4dC1zdWNjZXNzXCI7XG4gICAgfXJldHVybiBcIlwiXG5cbn1cblxuZnVuY3Rpb24gZGlzcGxheVBsYXllcnModGFibGUsIHBhZ2Upe1xuICAgIGxldCBodG1sID0gYDxoMz5QTGF5ZXJzPC9oMz5gO1xuICAgIHRhYmxlLm1hcCh4ID0+IGh0bWwgKz0gYCR7eC5uYW1lfSAtIERpY2UgTGVmdDogJHt4LmhhbmQubGVuZ3RofSA8YnI+YCk7XG4gICAgcGFnZS5hdFRhYmxlLmlubmVySFRNTCA9IGh0bWw7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlMYXN0QmV0KGxhc3RCZXQpIHtcbiAgICBpZiAobGFzdEJldFswXSAhPT0gMCkge1xuICAgICAgICBwYWdlLnRlc3QuaW5uZXJIVE1MID0gYDxoMz5MYXN0IEJldDogJHtsYXN0QmV0WzFdfSA8L2gzPmA7XG4gICAgICAgIGRpc3BsYXlEaWNlSW1hZ2VzKHBhZ2UudGVzdCwgY29udmVydFRvRGljZUltYWdlcyhbbGFzdEJldFswXV0pKVxuICAgIH1cbn1cblxuLy8jIyMjIyBJbWFnZSBIYW5kbGVycyAjIyMjI1xuZnVuY3Rpb24gY29udmVydFRvRGljZUltYWdlcyhoYW5kKXtcbiAgICBsZXQgaW1nSGFuZCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZC5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGxldCBmYWNlID0gaGFuZFtpXTtcbiAgICAgICAgbGV0IGRpY2VJbWFnZSA9IGRpY2VJbWFnZXNbZmFjZS0xXS5jbG9uZU5vZGUoKTtcbiAgICAgICAgaW1nSGFuZC5wdXNoKGRpY2VJbWFnZSk7XG4gICAgfVxuICAgIHJldHVybiBpbWdIYW5kO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5RGljZUltYWdlcyhwYXJlbnROb2RlLCBoYW5kSW1hZ2VzKXtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRJbWFnZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGhhbmRJbWFnZXNbaV0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFySW1hZ2VzKHBhcmVudE5vZGUpe1xuICAgIHdoaWxlIChwYXJlbnROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xuICAgIH1cbn1cblxuXG5cblxuLy8jIyMjIyBFWFBPUlRTICMjIyMjXG5tb2R1bGUuZXhwb3J0cy5kaXNwbGF5RWxlbWVudHMgPSBkaXNwbGF5RWxlbWVudHM7XG5tb2R1bGUuZXhwb3J0cy5oaWRlRWxlbWVudHMgPSBoaWRlRWxlbWVudHM7XG5tb2R1bGUuZXhwb3J0cy5kaXNwbGF5QW5kSGlkZSA9IGRpc3BsYXlBbmRIaWRlO1xubW9kdWxlLmV4cG9ydHMuZ2V0TWVzc2FnZUNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yO1xubW9kdWxlLmV4cG9ydHMuZGlzcGxheUxhc3RCZXQgPSBkaXNwbGF5TGFzdEJldDtcbm1vZHVsZS5leHBvcnRzLmNvbnZlcnRUb0RpY2VJbWFnZXMgPSBjb252ZXJ0VG9EaWNlSW1hZ2VzO1xubW9kdWxlLmV4cG9ydHMuZGlzcGxheURpY2VJbWFnZXMgPSBkaXNwbGF5RGljZUltYWdlcztcbm1vZHVsZS5leHBvcnRzLmNsZWFySW1hZ2VzID0gY2xlYXJJbWFnZXM7XG5tb2R1bGUuZXhwb3J0cy5kaXNwbGF5UGxheWVycyA9IGRpc3BsYXlQbGF5ZXJzOyJdfQ==
