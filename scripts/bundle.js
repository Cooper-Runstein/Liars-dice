(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let main = require('./liarsdice.js');
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

function getMessageColor (loser, winner){
    if (loser.player === true){
        return "text-danger";
    }else if(winner.player === true){
        return "text-success";
    }return ""

}

function displayLastBet(lastBet) {
    if (lastBet[0] !== 0) {
        page.test.innerHTML = `<h3>Last Bet: ${lastBet[1]} </h3>`;
        displayDiceImages(page.test, convertToDiceImages([lastBet[0]]))
    }
}

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

module.exports.displayElements = displayElements;
module.exports.hideElements = hideElements;
module.exports.displayAndHide = displayAndHide;
module.exports.getMessageColor = getMessageColor;
module.exports.displayLastBet = displayLastBet;
module.exports.convertToDiceImages = convertToDiceImages;
module.exports.displayDiceImages = displayDiceImages;
},{"./liarsdice.js":2}],2:[function(require,module,exports){
//########### IMPORTS ##########
//DISPLAY
const display = require('./display.js');
const displayElements = display.displayElements;
const hideElements = display.hideElements;
const displayAndHide = display.displayAndHide;
const getMessageColor = display.getMessageColor;
const displayLastBet = display.displayLastBet;
const convertToDiceImages = display.convertToDiceImages;
const displayDiceImages = display.displayDiceImages;


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

//generic functions


const clearImages = parentNode =>{
    while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
};


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
    for (let x = 0; x < table.length; x++) {
        table[x].roll();
        table[x].addOccurrences();
    }
    returnNewPlayerNumber();
    currentPlayer = table[PlayerNumber];
    displayPlayers();
    console.log(`startNextRound function exited`);

};

const displayPlayers = ()=>{
    let html = `<h3>PLayers</h3>`;
    for (let i =0; i<table.length; i++){
        html += `${table[i].name} - Dice Left: ${table[i].hand.length} <br>`
    }
    page.atTable.innerHTML = html;
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




},{"./display.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvZGlzcGxheS5qcyIsInNjcmlwdHMvbGlhcnNkaWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgbWFpbiA9IHJlcXVpcmUoJy4vbGlhcnNkaWNlLmpzJyk7XG5sZXQgcGFnZSA9IG1haW4ucGFnZTtcblxuXG5kaWUxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cbmRpZTEuc3JjID0gXCJpbWFnZXMvZGllMS5wbmdcIjtcbmRpZTIuc3JjID0gXCJpbWFnZXMvZGllMi5wbmdcIjtcbmRpZTMuc3JjID0gXCJpbWFnZXMvZGllMy5wbmdcIjtcbmRpZTQuc3JjID0gXCJpbWFnZXMvZGllNC5wbmdcIjtcbmRpZTUuc3JjID0gXCJpbWFnZXMvZGllNS5wbmdcIjtcbmRpZTYuc3JjID0gXCJpbWFnZXMvZGllNi5wbmdcIjtcblxubGV0IGRpY2VJbWFnZXMgPSBbZGllMSwgZGllMiwgZGllMywgZGllNCwgZGllNSwgZGllNl07XG5cbmZ1bmN0aW9uIGRpc3BsYXlFbGVtZW50cyhhcnJheSl7XG4gICAgYXJyYXkubWFwKHggPT4geC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJyk7XG59XG5cbmZ1bmN0aW9uIGhpZGVFbGVtZW50cyhhcnJheSl7XG4gICAgYXJyYXkubWFwKHggPT4geC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnKTtcbn1cblxuZnVuY3Rpb24gZGlzcGxheUFuZEhpZGUoYXJyYXlBZGQsIGFycmF5RGVsZXRlKSB7XG4gICAgZGlzcGxheUVsZW1lbnRzKGFycmF5QWRkKTtcbiAgICBoaWRlRWxlbWVudHMoYXJyYXlEZWxldGUpO1xufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlQ29sb3IgKGxvc2VyLCB3aW5uZXIpe1xuICAgIGlmIChsb3Nlci5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICByZXR1cm4gXCJ0ZXh0LWRhbmdlclwiO1xuICAgIH1lbHNlIGlmKHdpbm5lci5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICByZXR1cm4gXCJ0ZXh0LXN1Y2Nlc3NcIjtcbiAgICB9cmV0dXJuIFwiXCJcblxufVxuXG5mdW5jdGlvbiBkaXNwbGF5TGFzdEJldChsYXN0QmV0KSB7XG4gICAgaWYgKGxhc3RCZXRbMF0gIT09IDApIHtcbiAgICAgICAgcGFnZS50ZXN0LmlubmVySFRNTCA9IGA8aDM+TGFzdCBCZXQ6ICR7bGFzdEJldFsxXX0gPC9oMz5gO1xuICAgICAgICBkaXNwbGF5RGljZUltYWdlcyhwYWdlLnRlc3QsIGNvbnZlcnRUb0RpY2VJbWFnZXMoW2xhc3RCZXRbMF1dKSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb0RpY2VJbWFnZXMoaGFuZCl7XG4gICAgbGV0IGltZ0hhbmQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmQubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgZmFjZSA9IGhhbmRbaV07XG4gICAgICAgIGxldCBkaWNlSW1hZ2UgPSBkaWNlSW1hZ2VzW2ZhY2UtMV0uY2xvbmVOb2RlKCk7XG4gICAgICAgIGltZ0hhbmQucHVzaChkaWNlSW1hZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gaW1nSGFuZDtcbn1cblxuZnVuY3Rpb24gZGlzcGxheURpY2VJbWFnZXMocGFyZW50Tm9kZSwgaGFuZEltYWdlcyl7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kSW1hZ2VzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChoYW5kSW1hZ2VzW2ldKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmRpc3BsYXlFbGVtZW50cyA9IGRpc3BsYXlFbGVtZW50cztcbm1vZHVsZS5leHBvcnRzLmhpZGVFbGVtZW50cyA9IGhpZGVFbGVtZW50cztcbm1vZHVsZS5leHBvcnRzLmRpc3BsYXlBbmRIaWRlID0gZGlzcGxheUFuZEhpZGU7XG5tb2R1bGUuZXhwb3J0cy5nZXRNZXNzYWdlQ29sb3IgPSBnZXRNZXNzYWdlQ29sb3I7XG5tb2R1bGUuZXhwb3J0cy5kaXNwbGF5TGFzdEJldCA9IGRpc3BsYXlMYXN0QmV0O1xubW9kdWxlLmV4cG9ydHMuY29udmVydFRvRGljZUltYWdlcyA9IGNvbnZlcnRUb0RpY2VJbWFnZXM7XG5tb2R1bGUuZXhwb3J0cy5kaXNwbGF5RGljZUltYWdlcyA9IGRpc3BsYXlEaWNlSW1hZ2VzOyIsIi8vIyMjIyMjIyMjIyMgSU1QT1JUUyAjIyMjIyMjIyMjXG4vL0RJU1BMQVlcbmNvbnN0IGRpc3BsYXkgPSByZXF1aXJlKCcuL2Rpc3BsYXkuanMnKTtcbmNvbnN0IGRpc3BsYXlFbGVtZW50cyA9IGRpc3BsYXkuZGlzcGxheUVsZW1lbnRzO1xuY29uc3QgaGlkZUVsZW1lbnRzID0gZGlzcGxheS5oaWRlRWxlbWVudHM7XG5jb25zdCBkaXNwbGF5QW5kSGlkZSA9IGRpc3BsYXkuZGlzcGxheUFuZEhpZGU7XG5jb25zdCBnZXRNZXNzYWdlQ29sb3IgPSBkaXNwbGF5LmdldE1lc3NhZ2VDb2xvcjtcbmNvbnN0IGRpc3BsYXlMYXN0QmV0ID0gZGlzcGxheS5kaXNwbGF5TGFzdEJldDtcbmNvbnN0IGNvbnZlcnRUb0RpY2VJbWFnZXMgPSBkaXNwbGF5LmNvbnZlcnRUb0RpY2VJbWFnZXM7XG5jb25zdCBkaXNwbGF5RGljZUltYWdlcyA9IGRpc3BsYXkuZGlzcGxheURpY2VJbWFnZXM7XG5cblxuLy8jIyMjIyMjIyMjI0RvY3VtZW50IGJ1dHRvbnMgYW5kIGRpc3BsYXlzIyMjIyMjIyMjIyMjIyNcbi8vZGlzcGxheXNcbmxldCBwYWdlID0ge1xuICAgIGN1cnJlbnRIYW5kRGlzcGxheSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3VycmVudEhhbmRcIiksXG4gICAgY3VycmVudFBsYXllckRpc3BsYXkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllckRpc3BsYXlcIiksXG4gICAgcGxheWVyT3B0aW9uc0Rpc3BsYXkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllck9wdGlvbnNcIiksXG4gICAgdGVzdCA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdFwiKSxcbiAgICB0ZXN0MiA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdDJcIiksXG4gICAgZGVjbGFyZURpc3BsYXkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlY2xhcmVEaXNwbGF5XCIpLFxuICAgIGZhY2VEaXNwbGF5IDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmYWNlRGlzcGxheVwiKSxcbiAgICByZXN1bHQgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3VsdFwiKSxcbiAgICBpbnB1dHMgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0c1wiKSxcbiAgICBiZXREaXNwbGF5IDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNiZXREaXNwbGF5XCIpLFxuICAgIGdhbWVPdmVyIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lT3ZlclwiKSxcbiAgICBhdFRhYmxlIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJzXCIpLFxuXG4gICAgc3RhcnRCdXR0b24gOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpLFxuICAgIG5leHRQbGF5ZXJCdXR0b24gOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25leHRQbGF5ZXJcIiksXG4gICAgYmx1ZmZCdXR0b24gOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JsdWZmXCIpLFxuICAgIHNwb3RPbkJ1dHRvbiA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3BvdE9uXCIpLFxuICAgIGRlY2xhcmVCdXR0b24gOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlY2xhcmVcIiksXG4gICAgbmV4dFJvdW5kQnV0dG9uIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXh0Um91bmRcIiksXG4gICAgZmFjZUlucHV0IDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhY2UnKSxcbiAgICBjb3VudElucHV0IDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50JyksXG4gICAgcGFzc0J1dHRvbiA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzJyksXG4gICAgbmFtZUlucHV0IDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldE5hbWUnKSxcbiAgICBzdWJtaXQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKSxcbiAgICBwbGF5ZXJzSW5wdXQgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdldFBsYXllcnNcIiksXG59O1xuXG4vL0J1dHRvbiBMaXN0ZW5lcnNcbmZ1bmN0aW9uIGV2ZW50TGlzdGVuZXJzKCl7XG4gICAgcGFnZS5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW3BhZ2Uuc3VibWl0LCBwYWdlLnBsYXllcnNJbnB1dCwgcGFnZS5uYW1lSW5wdXRdLCBbcGFnZS5zdGFydEJ1dHRvbl0pO1xuICAgIH0pO1xuXG4gICAgcGFnZS5zdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBsZXQgZ2FtZUluaXRpYWxWYWx1ZXMgPSBnZXRHYW1lU2V0dGluZ3MoKTtcbiAgICAgICAgaWYoZ2FtZUluaXRpYWxWYWx1ZXMgIT09IGZhbHNlKXtcbiAgICAgICAgICAgIGdhbWUoZ2FtZUluaXRpYWxWYWx1ZXMpO31lbHNle1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmYWxzZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcGFnZS5ibHVmZkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KHRydWUpO1xuICAgICAgICBlbmRSb3VuZCgpO1xuICAgIH0pO1xuXG4gICAgcGFnZS5uZXh0UGxheWVyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoaWRlRWxlbWVudHMoW3BhZ2UubmV4dFBsYXllckJ1dHRvbl0pO1xuICAgICAgICBjbGVhckltYWdlcyhwYWdlLmN1cnJlbnRIYW5kRGlzcGxheSk7XG4gICAgICAgIHJlYWR5TmV4dFBsYXllcigpO1xuICAgICAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICB9KTtcblxuICAgIHBhZ2UubmV4dFJvdW5kQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoaWRlRWxlbWVudHMoW3BhZ2UubmV4dFJvdW5kQnV0dG9uLCBwYWdlLnRlc3QsIHBhZ2UudGVzdDJdKTtcbiAgICAgICAgcmVzZXRSb3VuZFZhcmlhYmxlcygpO1xuICAgICAgICBkaXNwbGF5Um91bmQoKTtcbiAgICAgICAgc3RhcnROZXh0Um91bmQoKTtcbiAgICAgICAgZmlyc3RQbGF5ZXIoKTtcbiAgICB9KTtcblxuICAgIHBhZ2UuZGVjbGFyZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYocHJvY2Vzc0JldFZhbGlkaXR5KHBhZ2UuZmFjZUlucHV0LnZhbHVlLCBwYWdlLmNvdW50SW5wdXQudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlY2xhcmVidXR0b24gdmFsaWRhdGVkXCIpO1xuICAgICAgICAgICAgbGV0IGNoYWxsZW5nZXJzID0gZ2V0Q2hhbGxlbmdlcnMocGFnZS5mYWNlSW5wdXQudmFsdWUsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICAgICAgICAgICBjaGFsbGVuZ2VkID0gdGFibGVbMF07XG4gICAgICAgICAgICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCgpO1xuICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS5uZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgICAgICB9XG4gICAgIH1cbiAgICB9KTtcblxuICAgIHBhZ2UucGFzc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtwYWdlLm5leHRQbGF5ZXJCdXR0b25dLCBbcGFnZS5wYXNzQnV0dG9uLCBwYWdlLmJsdWZmQnV0dG9uLCBwYWdlLnNwb3RPbkJ1dHRvbl0pO1xuICAgIH0pO1xuXG4gICAgcGFnZS5zcG90T25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTcG90T24gY2FsbGVkJyk7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGxldCBsb3NlcjtcbiAgICAgICAgaWYoY2hlY2tTcG90T24oKSl7XG4gICAgICAgICAgICBwYWdlLnJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIFRydWUgLT4gJHtjaGFsbGVuZ2VkLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgICAgIGxvc2VyID0gY2hhbGxlbmdlZDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBwYWdlLnJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIEZhbHNlLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlRGllKGxvc2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQobG9zZXIpO1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3BhZ2UucmVzdWx0LCBwYWdlLm5leHRSb3VuZEJ1dHRvbl0pO1xuICAgICAgICBlbmRSb3VuZCgpO1xuICAgIH0pO1xufVxuXG5sZXQgbmFtZXMgPSBbXG4gICAgXCJTaGlybGVlblwiLCBcIkthcmFcIiwgXCJDbGV2ZWxhbmRcIixcIk1lcnJpXCIsIFwiQ29uY2VwdGlvblwiLCBcIkhhbGV5XCIsIFwiRmxvcmFuY2VcIiwgXCJEb3JpZVwiLCBcIkx1ZWxsYVwiLCBcIlZlcm5pYVwiLFxuICAgIFwiRnJlZW1hblwiLCBcIkthdGhhcmluYVwiLCBcIkNoYXJtYWluXCIsIFwiR3JhaGFtXCIsIFwiRGFybmVsbFwiLCBcIkJlcm5ldHRhXCIsIFwiSW5lbGxcIiwgXCJQYWdlXCIsIFwiR2FybmV0dFwiLCBcIkFubmFsaXNhXCIsXG4gICAgXCJCcmFudFwiLCBcIlZhbGRhXCIsIFwiVmlraVwiLCBcIkFzdW5jaW9uXCIsIFwiTW9pcmFcIiwgXCJLYXljZWVcIiwgXCJSaWNoZWxsZVwiLCBcIkVsaWNpYVwiLCBcIkVuZWlkYVwiLCBcIkV2ZWx5bm5cIlxuXTtcblxuLy9PQkpFQ1RTXG5jbGFzcyBQbGF5ZXJ7XG4gICAgY29uc3RydWN0b3IobmFtZSlcbiAgICB7XG4gICAgICAgIHRoaXMucGxheWVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgZ2V0UmFuZG9tTmFtZSgpO1xuICAgICAgICB0aGlzLmhhbmQgPSBbMCwwLDAsMF07XG4gICAgICAgIHRoaXMucm9sbCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZCA9IHRoaXMuaGFuZC5tYXAoXG4gICAgICAgICAgICAgICAgKCkgPT4gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpICsgMSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9IGhhcyByb2xsZWRgKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRUb1RhYmxlID0gKCkgPT4ge1xuICAgICAgICAgICAgdGFibGUucHVzaCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRPY2N1cnJlbmNlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5oYW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZGljZU9uVGFibGVJbmRleGVkQXJyYXlbdGhpcy5oYW5kW2ldIC0gMV0gKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG51bWJlck9mRGllICs9IHRoaXMuaGFuZC5sZW5ndGg7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmV0dXJuVHJ1ZUlmQUlDaGFsbGVuZ2VzID0gKGZhY2UsIHBsYXllcikgPT4ge1xuICAgICAgICAgICAgbGV0IHBsYXllck51bSA9IGdldEZhY2VDb3VudCh0aGlzLCBmYWNlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmYWNlOiAke2ZhY2V9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgcGxheWVyTnVtYmVyb2ZGYWNlOiAke3BsYXllck51bX1gKTtcbiAgICAgICAgICAgIGxldCBwY3QgPSBkaWVSYXRpbyhwbGF5ZXJOdW0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHJldHVybiByYXRpbzogJHtwY3R9YCk7XG4gICAgICAgICAgICBpZiAocGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgICAgICAgICBwY3QgKz0gKDEvMTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBjdCA8PSAoMSAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfWVsc2UgaWYgKHBjdCA8PSAoMiAvIDEyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjJcbiAgICAgICAgICAgIH1lbHNlIGlmIChwY3QgPD0gKDQgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjNcbiAgICAgICAgICAgIH1lbHNlIGlmKHBjdCA8PSAoNSAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuNVxuICAgICAgICAgICAgfWVsc2UgaWYocGN0IDw9ICg2IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC43XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxufX1cblxubGV0IGdldEZhY2VDb3VudCA9IChwbGF5ZXIsIGZhY2UpPT57XG4gICAgbGV0IGFyciA9IGNvdW50RmFjZXMocGxheWVyLmhhbmQpO1xuICAgIGNvbnNvbGUubG9nKHBsYXllci5uYW1lICsgYXJyKTtcbiAgICByZXR1cm4gYXJyW2ZhY2UtMV07XG59O1xuXG5sZXQgZGllUmF0aW8gPSAocGxheWVyTnVtKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJOVW1iZXIgZGllIG9uIHRhYmxlXCIgKyBudW1iZXJPZkRpZSk7XG4gICAgY29uc29sZS5sb2coXCJCRk8gYXJyXCIgKyBiZXRDb3VudCk7XG4gICAgcmV0dXJuIChiZXRDb3VudC1wbGF5ZXJOdW0pL251bWJlck9mRGllO1xufTtcblxuLy9NYWluIFZhcmlhYmxlc1xubGV0IHRhYmxlID0gW107XG5sZXQgUGxheWVyTnVtYmVyO1xubGV0IGN1cnJlbnRIYW5kO1xubGV0IGN1cnJlbnRQbGF5ZXI7XG5sZXQgbGFzdEJldCA9IFswLCAwXTtcbmxldCBiZXRDb3VudCA9IDA7XG5sZXQgZGljZU9uVGFibGVJbmRleGVkQXJyYXkgPSBbMCwwLDAsMCwwLDBdO1xubGV0IG51bWJlck9mRGllID0gMDtcbmxldCBjaGFsbGVuZ2VyO1xubGV0IGNoYWxsZW5nZWQ7XG5cbi8vZ2VuZXJpYyBmdW5jdGlvbnNcblxuXG5jb25zdCBjbGVhckltYWdlcyA9IHBhcmVudE5vZGUgPT57XG4gICAgd2hpbGUgKHBhcmVudE5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxuXG4vLyMjIyMjIyMjIyMjIyNHYW1lIEZ1bmN0aW9ucyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY29uc3Qgc3RhcnRHYW1lID0gKGluaXRpYWxWYWx1ZXMpID0+IHtcbiAgICBjcmVhdGVIdW1hblBsYXllcihpbml0aWFsVmFsdWVzKTtcbiAgICBjcmVhdGVBaVBsYXllcnMoaW5pdGlhbFZhbHVlc1sxXSk7XG4gICAgaWYgKHRhYmxlWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFibGVbMF0ucGxheWVyID0gdHJ1ZTt9XG59O1xuXG5jb25zdCBjcmVhdGVIdW1hblBsYXllciA9IChpbml0aWFsVmFsdWVzKT0+e1xuICAgIGxldCBodW1hbiA9IG5ldyBQbGF5ZXIoaW5pdGlhbFZhbHVlc1swXSk7XG4gICAgaHVtYW4uYWRkVG9UYWJsZSh0YWJsZSk7XG59O1xuXG5jb25zdCBnZXRHYW1lU2V0dGluZ3MgPSAoKT0+e1xuICAgIGxldCBuYW1lID0gcGFnZS5uYW1lSW5wdXQudmFsdWU7XG4gICAgaWYgKDEwID4gcGFnZS5wbGF5ZXJzSW5wdXQudmFsdWUgPiAwKXtcbiAgICAgICAgbGV0IG51bVBsYXllcnMgPSBwYWdlLnBsYXllcnNJbnB1dC52YWx1ZTtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtwYWdlLnN1Ym1pdCwgcGFnZS5wbGF5ZXJzSW5wdXQsIHBhZ2UubmFtZUlucHV0XSk7XG4gICAgICAgIHJldHVybiAoW25hbWUsIG51bVBsYXllcnNdKTtcbiAgICB9cmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgZ2V0UmFuZG9tTmFtZSA9ICgpPT4ge1xuICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLmZsb29yKG5hbWVzLmxlbmd0aCkpO1xuICAgICAgICBsZXQgbmFtZSA9IG5hbWVzW2luZGV4XTtcbiAgICAgICAgbmFtZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIG5hbWU7XG59O1xuXG5jb25zdCBjcmVhdGVBaVBsYXllcnMgPSAobnVtKT0+e1xuICAgIGZvciAobGV0IGkgPTA7IGkgPG51bTsgaSsrKXtcbiAgICAgICAgbGV0IHggPSBuZXcgUGxheWVyKCk7XG4gICAgICAgIHguYWRkVG9UYWJsZSgpO1xuICAgIH1cbn07XG5cbi8vUGxheWVyIHNldCB1cFxuY29uc3Qgc2V0VXBOZXh0UGxheWVyID0gKCkgPT4ge1xuICAgZ2V0TmV4dFBsYXllcigpO1xuICAgZGlzcGxheUVsZW1lbnRzKFtwYWdlLmN1cnJlbnRQbGF5ZXJEaXNwbGF5LCBwYWdlLmN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxheWVyID09PSB0cnVlKSB7XG4gICAgICBzZXRVcEh1bWFuVHVybigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgc2V0VXBBaVR1cm4oKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRVcEh1bWFuVHVybiA9ICgpPT57XG4gICAgcGFnZS50ZXN0Mi5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS50ZXN0Ml0pO1xuICAgIHBhZ2UuY3VycmVudEhhbmREaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+IFlvdXIgSGFuZCBpczogPC9oMT5gO1xuICAgIHBhZ2UuY3VycmVudFBsYXllckRpc3BsYXkuaW5uZXJIVE1MID0gYDxoMSBjbGFzcz1cInRleHQtYWxpZ25cIj4ke2N1cnJlbnRQbGF5ZXIubmFtZX08L2gxPmA7XG4gICAgZGlzcGxheUxhc3RCZXQobGFzdEJldCk7XG4gICAgZGlzcGxheURpY2VJbWFnZXMocGFnZS5jdXJyZW50SGFuZERpc3BsYXksIGNvbnZlcnRUb0RpY2VJbWFnZXMoY3VycmVudEhhbmQpKTtcbiAgICBkaXNwbGF5QW5kSGlkZShbcGFnZS5kZWNsYXJlRGlzcGxheSwgcGFnZS5kZWNsYXJlQnV0dG9uLCBwYWdlLmlucHV0c10sIFtwYWdlLnNwb3RPbkJ1dHRvbiwgcGFnZS5ibHVmZkJ1dHRvbiwgcGFnZS5iZXREaXNwbGF5LCBwYWdlLmZhY2VEaXNwbGF5XSk7XG59O1xuXG5cblxuY29uc3Qgc2V0VXBBaVR1cm4gPSAoKT0+e1xuICAgIGRpc3BsYXlBbmRIaWRlKFtwYWdlLnNwb3RPbkJ1dHRvbiwgcGFnZS5ibHVmZkJ1dHRvbiwgcGFnZS5wYXNzQnV0dG9uLCBwYWdlLnJlc3VsdCwgcGFnZS50ZXN0XSwgW3BhZ2UuY3VycmVudEhhbmREaXNwbGF5XSk7XG4gICAgcGFnZS5yZXN1bHQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBwYWdlLmN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9IGlzIHBsYXlpbmc8L2gxPmA7XG4gICAgcGFnZS50ZXN0LmlubmVySFRNTCA9IGBZb3VyIGhhbmQgaXM6YDtcbiAgICBkaXNwbGF5RGljZUltYWdlcyhwYWdlLnRlc3QsIGNvbnZlcnRUb0RpY2VJbWFnZXModGFibGVbMF0uaGFuZCkpO1xuICAgIGxhc3RCZXQgPSBhaVBsYXlzKCk7XG4gICAgcnVuQWlBZ2FpbnN0QWkoKTtcbn07XG5cbmNvbnN0IHJ1bkFpQWdhaW5zdEFpID0gKCk9PntcbiAgICBsZXQgY2hhbGxlbmdlcnMgPSBnZXRDaGFsbGVuZ2VycyhsYXN0QmV0WzBdLCBmYWxzZSk7XG4gICAgY29uc29sZS5sb2coY2hhbGxlbmdlcnMpO1xuICAgIGlmIChjaGFsbGVuZ2Vycy5sZW5ndGggPiAwKXtcbiAgICAgICAgY2hhbGxlbmdlciA9IGdldE9wcG9uZW50KGNoYWxsZW5nZXJzKTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbcGFnZS5ibHVmZkJ1dHRvbiwgcGFnZS5zcG90T25CdXR0b24sIHBhZ2UucGFzc0J1dHRvbl0pO1xuICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKHRydWUpO1xuICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQoKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSk7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0TmV4dFBsYXllciA9ICgpPT57XG4gICAgY3VycmVudFBsYXllciA9IHRhYmxlW1BsYXllck51bWJlcl07XG4gICAgY3VycmVudEhhbmQgPSBjdXJyZW50UGxheWVyLmhhbmQ7XG59O1xuXG5jb25zdCBmaXJzdFBsYXllciA9ICgpID0+IHtcbiAgICBzZXRVcE5leHRQbGF5ZXIoKTtcbiAgICBQbGF5ZXJOdW1iZXIgKz0gMTtcbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbn07XG5cbmNvbnN0IHJlYWR5TmV4dFBsYXllciA9ICgpID0+IHtcbiAgICBzZXRVcE5leHRQbGF5ZXIoKTtcbiAgICBQbGF5ZXJOdW1iZXIgKz0gMTtcbn07XG5cbmNvbnN0IHJldHVybk5ld1BsYXllck51bWJlciA9ICgpID0+IHtcbiAgICBpZiAoUGxheWVyTnVtYmVyID49IHRhYmxlLmxlbmd0aCB8fCBQbGF5ZXJOdW1iZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBQbGF5ZXJOdW1iZXIgPSAwO1xuICAgIH0gZWxzZSBpZiAoUGxheWVyTnVtYmVyIDwgMCkge1xuICAgICAgICBQbGF5ZXJOdW1iZXIgPSB0YWJsZS5sZW5ndGggLSAxO1xuICAgIH1cbn07XG5cbi8vTkVXIFJPVU5EXG5jb25zdCBzdGFydE5leHRSb3VuZCA9ICgpID0+IHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRhYmxlLmxlbmd0aDsgeCsrKSB7XG4gICAgICAgIHRhYmxlW3hdLnJvbGwoKTtcbiAgICAgICAgdGFibGVbeF0uYWRkT2NjdXJyZW5jZXMoKTtcbiAgICB9XG4gICAgcmV0dXJuTmV3UGxheWVyTnVtYmVyKCk7XG4gICAgY3VycmVudFBsYXllciA9IHRhYmxlW1BsYXllck51bWJlcl07XG4gICAgZGlzcGxheVBsYXllcnMoKTtcbiAgICBjb25zb2xlLmxvZyhgc3RhcnROZXh0Um91bmQgZnVuY3Rpb24gZXhpdGVkYCk7XG5cbn07XG5cbmNvbnN0IGRpc3BsYXlQbGF5ZXJzID0gKCk9PntcbiAgICBsZXQgaHRtbCA9IGA8aDM+UExheWVyczwvaDM+YDtcbiAgICBmb3IgKGxldCBpID0wOyBpPHRhYmxlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaHRtbCArPSBgJHt0YWJsZVtpXS5uYW1lfSAtIERpY2UgTGVmdDogJHt0YWJsZVtpXS5oYW5kLmxlbmd0aH0gPGJyPmBcbiAgICB9XG4gICAgcGFnZS5hdFRhYmxlLmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5jb25zdCBlbmRSb3VuZCA9ICgpID0+IHtcbiAgICByZXNldFJvdW5kVmFyaWFibGVzKCk7XG4gICAgcGFnZS50ZXN0LmlubmVySFRNTCA9IFwiUk9VTkQgT1ZFUlwiO1xuICAgIFBsYXllck51bWJlciAtPSAxO1xufTtcblxuY29uc3QgcmVzZXRSb3VuZFZhcmlhYmxlcyA9ICgpID0+IHtcbiAgICBsYXN0QmV0ID0gWzAsMF07XG4gICAgYmV0Q291bnQgPSAwO1xuICAgIG51bWJlck9mRGllID0gMDtcbiAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheT1bMCwwLDAsMCwwLDBdO1xuICAgIGhpZGVFbGVtZW50cyhbcGFnZS5wYXNzQnV0dG9uLCBwYWdlLmJsdWZmQnV0dG9uLCBwYWdlLnNwb3RPbkJ1dHRvbiwgcGFnZS5uZXh0UGxheWVyQnV0dG9uXSk7XG59O1xuXG5jb25zdCBkaXNwbGF5Um91bmQgPSAoKSA9PiB7XG4gICAgaGlkZUVsZW1lbnRzKFtwYWdlLnJlc3VsdF0pO1xufTtcblxuLy9HQU1FIFBMQVkgRlVOQ1RJT05TXG5jb25zdCBnZXRCZXRUcnV0aCA9ICgpID0+IHtcbiAgICBsZXQgZmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGNvdW50ID0gbGFzdEJldFsxXTtcbiAgICBjb25zb2xlLmxvZyhkaWNlT25UYWJsZUluZGV4ZWRBcnJheSk7XG4gICAgcmV0dXJuIGRpY2VPblRhYmxlSW5kZXhlZEFycmF5W2ZhY2UgLSAxXSA+PSBjb3VudDtcbn07XG5cbmNvbnN0IHByb2Nlc3NCZXRWYWxpZGl0eSA9IChmYWNlLCBjb3VudCkgPT4ge1xuICAgIGxldCBiZXQgPSBnZXRCZXRJZlZhbGlkKGZhY2UsIGNvdW50KTtcbiAgICBpZiAoYmV0ICE9PSBmYWxzZSkge1xuICAgICAgICBsYXN0QmV0ID0gYmV0O1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbcGFnZS5mYWNlRGlzcGxheV0sIFtwYWdlLmRlY2xhcmVEaXNwbGF5LCBwYWdlLmRlY2xhcmVCdXR0b24sIHBhZ2UuaW5wdXRzXSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2UudGVzdDIuaW5uZXJIVE1MID0gYDxwIGNsYXNzPVwiZGlzcGxheS01IHRleHQtaW5mb1wiPk5vdCBWYWxpZCBJbnB1dDwvcD5gO1xuICAgIH1cbn07XG5cblxuY29uc3QgZ2V0QmV0SWZWYWxpZCA9IChmYWNlLCBjb3VudCkgPT4ge1xuICAgIGZhY2UgPSBwYXJzZUludChmYWNlKTtcbiAgICBjb3VudCA9IHBhcnNlSW50KGNvdW50KTtcbiAgICBsZXQgbGFzdEZhY2UgPSBsYXN0QmV0WzBdO1xuICAgIGxldCBsYXN0Q291bnQgPSBsYXN0QmV0WzFdO1xuICAgIGNvbnNvbGUubG9nKGBsYXN0RmFjZSA9ICR7bGFzdEJldFswXX0sIGxhc3RDb3VudCA9ICR7bGFzdEJldFsxXX0gZmFjZT0ke2ZhY2V9LCBjb3VudD0ke2NvdW50fWApO1xuICAgIGlmIChcbiAgICAgICAgKCAgICgoZmFjZSA+IGxhc3RGYWNlKSAmJiAoY291bnQgPT09IGxhc3RDb3VudCkpICYmXG4gICAgICAgICAgICAoKGNvdW50ID4gMCkgJiYgKDcgPiBmYWNlID4gMCkpXG4gICAgICAgIClcblxuICAgICAgICB8fFxuXG4gICAgICAgICgoY291bnQgPiBsYXN0Q291bnQpICYmICgoY291bnQgPiAwKSAmJiAoNyA+IGZhY2UgJiYgZmFjZSA+IDApKSlcbiAgICApIHtcbiAgICAgICAgYmV0Q291bnQgPSBjb3VudDtcbiAgICAgICAgcmV0dXJuIFtmYWNlLCBjb3VudF07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldENoYWxsZW5nZXJzID0gKGZhY2UsIHBsYXllcik9PntcbiAgICBsZXQgY2hhbGxlbmdlcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpPTE7IGkgPCB0YWJsZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGlmKHRhYmxlW2ldLnJldHVyblRydWVJZkFJQ2hhbGxlbmdlcyhmYWNlLCBwbGF5ZXIpKXtcbiAgICAgICAgICAgIGlmICh0YWJsZVtpXSAhPT0gY3VycmVudFBsYXllcil7XG4gICAgICAgICAgICBjaGFsbGVuZ2Vycy5wdXNoKHRhYmxlW2ldKX1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgUG9zc2libGUgQ2hhbGxlbmdlcnM6ICR7Y2hhbGxlbmdlcnN9YCk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAuMyl7XG4gICAgcmV0dXJuIGNoYWxsZW5nZXJzO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbn07XG5cbmNvbnN0IGdldE9wcG9uZW50ID0gKGNoYWxsZW5nZXJzKT0+e1xuICAgIGxldCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1hdGguZmxvb3IoY2hhbGxlbmdlcnMubGVuZ3RoKSk7XG5cbiAgICBjb25zb2xlLmxvZyhjaGFsbGVuZ2Vyc1tpbmRleF0pO1xuICAgIHJldHVybiBjaGFsbGVuZ2Vyc1tpbmRleF1cbn07XG5cbmNvbnN0IGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMgPSAoY2hhbGxlbmdlKSA9PntcbiAgICBpZiAoY2hhbGxlbmdlKXtcbiAgICAgICAgcGFnZS5mYWNlRGlzcGxheS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj5DSEFMTEVOR0VEIEJZICR7Y2hhbGxlbmdlci5uYW1lfTwvZGl2PmA7XG4gICAgfWVsc2V7XG4gICAgICAgIHBhZ2UuZmFjZURpc3BsYXkuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+Tm8gb25lIGNoYWxsZW5nZXM8L2Rpdj5gO1xuICAgIH1cbn07XG5cbmNvbnN0IGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCA9ICgpID0+e1xuICAgIGNvbnNvbGUubG9nKFwiZGV0ZXJtaW5pbmcgY2hhbGxlbmdlc1wiKTtcbiAgICBkaXNwbGF5QW5kSGlkZShbcGFnZS5uZXh0Um91bmRCdXR0b24sIHBhZ2UucmVzdWx0XSwgW3BhZ2UubmV4dFBsYXllckJ1dHRvbl0pO1xuICAgIGhhbmRsZUNoYWxsZW5nZUNoZWNrKGdldEJldFRydXRoKCkpO1xuXG59O1xuXG5jb25zdCBoYW5kbGVDaGFsbGVuZ2VDaGVjayA9IChiZXRCb29sZWFuKT0+e1xuICAgIGNvbnNvbGUubG9nKFwiaGFuZGxlIGNoYWxsZW5nZSBmdW5jdGlvbiBjYWxsZWRcIik7XG4gICAgaWYoYmV0Qm9vbGVhbil7XG4gICAgICAgIGxldCBjb2xvciA9IGdldE1lc3NhZ2VDb2xvcihjaGFsbGVuZ2VyLGNoYWxsZW5nZWQpO1xuICAgICAgICBwYWdlLnJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwiJHtjb2xvcn0gZGlzcGxheS00XCI+IENoYWxsZW5nZSBGYWlsZWQgLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgIHJlbW92ZURpZShjaGFsbGVuZ2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQoY2hhbGxlbmdlcik7XG59ZWxzZXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZWQsIGNoYWxsZW5nZXIpO1xuICAgICAgICBwYWdlLnJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwiJHtjb2xvcn0gZGlzcGxheS00XCI+IENoYWxsZW5nZSBTdWNjZWVkZWQgLT4gJHtjaGFsbGVuZ2VkLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgIHJlbW92ZURpZShjaGFsbGVuZ2VkKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQoY2hhbGxlbmdlZCk7XG4gICAgfVxufTtcblxuXG5cbmNvbnN0IGNoZWNrU3BvdE9uID0gKCkgPT57XG4gICAgcmV0dXJuIChkaWNlT25UYWJsZUluZGV4ZWRBcnJheVtsYXN0QmV0WzBdIC0xXSA9PT0gbGFzdEJldFsxXSlcbn07XG5cbmNvbnN0IGNoZWNrSWZFbGltaW5hdGVkID0gKGJldExvc2VyKT0+e1xuICAgIGlmIChyZXR1cm5JZkxhc3REaWUoYmV0TG9zZXIpKXtcbiAgICAgICAgaGFuZGxlTGFzdERpZUxvc3QoYmV0TG9zZXIpO1xuICAgICAgICBjaGVja0Zvcldpbm5lcigpO1xuICAgIH1cbn07XG5cbmNvbnN0IHJlbW92ZURpZSA9IChwbGF5ZXIpID0+e1xuICAgIHBsYXllci5oYW5kICA9IHBsYXllci5oYW5kLnNwbGljZSgxKTtcbn07XG5cbi8vQ29tcHV0ZXIgYmV0c1xuY29uc3QgYWlQbGF5cyA9ICgpPT4ge1xuICAgIGxldCBuZXdCZXQgPSBwbGF5ZXJCZXQoKTtcbiAgICBiZXRDb3VudCA9IG5ld0JldFsxXTtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3BhZ2UuYmV0RGlzcGxheV0pO1xuICAgIHBhZ2UuYmV0RGlzcGxheS5pbm5lckhUTUwgPSBgPHAgY2xhc3M9XCJkaXNwbGF5LTRcIj4ke2N1cnJlbnRQbGF5ZXIubmFtZX0gYmV0cyB0aGVyZSBhcmUgPGJyPiAke25ld0JldFsxXX0gPHNwYW4gaWQ9XCJkaWNlXCI+IDwvc3Bhbj5zIG9uIHRoZSB0YWJsZTwvcD5gO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKHBhZ2UuYmV0RGlzcGxheSwgY29udmVydFRvRGljZUltYWdlcyhbbmV3QmV0WzBdXSkpO1xuICAgIHJldHVybiBuZXdCZXQ7XG59O1xuXG5jb25zdCBjb3VudEZhY2VzID0gKGhhbmQpID0+e1xuICAgIGxldCBjdXJyZW50SGFuZEludHMgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGN1cnJlbnRIYW5kSW50c1toYW5kW2ldIC0gMV0gKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRIYW5kSW50cztcbn07XG5jb25zdCBwbGF5ZXJCZXQgPSAoKSA9PiB7XG4gICAgbGV0IGN1cnJlbnRIYW5kSW50cyA9IGNvdW50RmFjZXMoY3VycmVudEhhbmQpO1xuICAgIGxldCBsYXJnZXN0Q291bnQgPSBNYXRoLm1heCguLi5jdXJyZW50SGFuZEludHMpO1xuICAgIGxldCBiZXN0SGFuZCA9IFtjdXJyZW50SGFuZEludHMuaW5kZXhPZihsYXJnZXN0Q291bnQpKzEsIGxhcmdlc3RDb3VudF07XG4gICAgcmV0dXJuIGFpQmx1ZmYoYmVzdEhhbmQpO1xufTtcblxuY29uc3QgYWlCbHVmZiA9IChiZXN0SGFuZCk9PntcbiAgICB3aGlsZSAoYWlDaGVja0N1cnJlbnRIYW5kVmFsaWRpdHkoYmVzdEhhbmQpICE9PSB0cnVlKXtcbiAgICAgICAgYmVzdEhhbmRbMV0gKz0gMTtcbiAgICB9XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPCAuMyl7XG4gICAgICAgIGJlc3RIYW5kWzFdICs9IDE7XG4gICAgICAgIHJldHVybiBiZXN0SGFuZDtcbiAgICB9ZWxzZXtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAuMSl7XG4gICAgICAgICAgICBiZXN0SGFuZFsxXSArPSAyO1xuICAgICAgICAgICAgcmV0dXJuIGJlc3RIYW5kO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0SGFuZFxufTtcblxuY29uc3QgYWlDaGVja0N1cnJlbnRIYW5kVmFsaWRpdHkgPSBoYW5kID0+IHtcbiAgICByZXR1cm4gKChoYW5kWzBdID4gbGFzdEJldFswXSAgJiYgaGFuZFsxXSA+PSBsYXN0QmV0WzFdKSB8fCBoYW5kWzFdID4gbGFzdEJldFsxXSlcbn07XG5cbmNvbnN0IHJldHVybklmTGFzdERpZSA9IHBsYXllciA9PiB7XG4gICAgcmV0dXJuIHBsYXllci5oYW5kLmxlbmd0aCA9PT0gMDtcbn07XG5cbmNvbnN0IGhhbmRsZUxhc3REaWVMb3N0ID0gcGxheWVyID0+e1xuICAgIGNvbnNvbGUubG9nKGBIYW5kbGluZyBsYXN0IGRpY2Ugb2YgJHtwbGF5ZXIubmFtZX1gKTtcbiAgICBsZXQgaW5kZXggPSB0YWJsZS5pbmRleE9mKHBsYXllcik7XG4gICAgY29uc29sZS5sb2coaW5kZXgpO1xuICAgIGNvbnNvbGUubG9nKHRhYmxlW2luZGV4XSk7XG4gICAgaWYgKHRhYmxlW2luZGV4XS5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3BhZ2UuZ2FtZU92ZXJdKTtcbiAgICAgICAgcGFnZS5nYW1lT3Zlci5pbm5lckhUTUw9XCJZT1UgTE9TRVwiXG4gICAgfWVsc2V7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcGFnZS50ZXN0Ml0pO1xuICAgICAgICBwYWdlLnRlc3QyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LXdhcm5pbmdcIj4ke3BsYXllci5uYW1lfSBoYXMgYmVlbiBlbGltaW5hdGVkPC9oMT5gO1xuICAgICAgICB0YWJsZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0YWJsZSk7XG59O1xuXG5jb25zdCBjaGVja0Zvcldpbm5lciA9ICgpPT57XG4gICAgaWYgKHRhYmxlLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjI0dBTUUgT1ZFUiMjIyMjIyMjIyMjJyk7XG4gICAgICAgIHBhZ2UucmVzdWx0LmlubmVySFRNTCA9IFwiWU9VIFdJTlwiO1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3BhZ2UuZ2FtZU92ZXJdKTtcbiAgICB9XG59O1xuXG4vL0dhbWUgU3RhcnQgRnVuY3Rpb25zXG5sZXQgY2xlYW5Cb2FyZCA9ICgpID0+IGhpZGVFbGVtZW50cyhbcGFnZS5zdWJtaXQsIHBhZ2UubmFtZUlucHV0LCBwYWdlLnBsYXllcnNJbnB1dCwgcGFnZS5ibHVmZkJ1dHRvbiwgcGFnZS5zcG90T25CdXR0b24sIHBhZ2UucGFzc0J1dHRvbiwgcGFnZS5uZXh0Um91bmRCdXR0b24sIHBhZ2UubmV4dFBsYXllckJ1dHRvbiwgcGFnZS5mYWNlRGlzcGxheSwgcGFnZS5wbGF5ZXJPcHRpb25zRGlzcGxheSwgcGFnZS5kZWNsYXJlQnV0dG9uLCBwYWdlLmRlY2xhcmVEaXNwbGF5LCBwYWdlLmlucHV0cywgcGFnZS5yZXN1bHQsIHBhZ2UuYmV0RGlzcGxheSwgcGFnZS5nYW1lT3Zlcl0pO1xuXG5sZXQgZ2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgc3RhcnRHYW1lKGluaXRpYWxWYWx1ZXMpO1xuICAgIHN0YXJ0TmV4dFJvdW5kKCk7XG4gICAgZmlyc3RQbGF5ZXIoKTtcbn07XG5cbmNsZWFuQm9hcmQoKTtcbmV2ZW50TGlzdGVuZXJzKCk7XG5cbm1vZHVsZS5leHBvcnRzLnBhZ2UgPSBwYWdlO1xuXG5cblxuIl19
