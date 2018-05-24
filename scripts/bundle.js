(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//########### IMPORTS ##########
//######DISPLAY#########
const display = require('./display.js');
const {displayElements} = display;
const {hideElements} = display;
const {displayAndHide} = display;
const {convertToDiceImages} = display;
const {displayDiceImages} = display;
const {clearImages} = display;
const {displayPlayers} = display;
const {displayLastBet} = display;
const {displayRound} = display;
const {displayChallengeStatus} = display;


//###########Document buttons and displays##############
//displays
let currentHandDisplay = document.querySelector("#currentHand");
let currentPlayerDisplay = document.querySelector("#playerDisplay");
let playerOptionsDisplay = document.querySelector("#playerOptions");
let test = document.querySelector("#test");
let test2 = document.querySelector("#test2");
let declareDisplay = document.querySelector("#declareDisplay");
let faceDisplay = document.querySelector("#faceDisplay");
let result = document.querySelector("#result");
let inputs = document.querySelector("#inputs");
let betDisplay = document.querySelector("#betDisplay");
let gameOver = document.querySelector("#gameOver");
const atTable = document.querySelector("#players");

//Buttons
const startButton = document.querySelector("button");
const nextPlayerButton = document.querySelector("#nextPlayer");
const bluffButton = document.querySelector("#bluff");
const spotOnButton = document.querySelector("#spotOn");
const declareButton = document.querySelector("#declare");
const nextRoundButton = document.querySelector("#nextRound");
const faceInput = document.getElementById('face');
const countInput = document.getElementById('count');
const passButton = document.getElementById('pass');
const nameInput = document.getElementById('getName');
const submit = document.getElementById("submit");
const playersInput = document.getElementById("getPlayers");

//Images

//Button Listeners
const eventListeners = ()=> {
    startButton.addEventListener('click', () => {
        displayAndHide([submit, playersInput, nameInput], [startButton]);
    });

    submit.addEventListener('click', ()=>{
        let gameInitialValues = getGameSettings();
        if(gameInitialValues !== false){
            game(gameInitialValues);}else{
            console.log("false");
        }
    });

    bluffButton.addEventListener('click', () => {
        challenger = table[0];
        challenged = currentPlayer;
        displayChallengeStatus(true, faceDisplay, challenger);
        determineChallengeResult(true);
        endRound();
    });

    nextPlayerButton.addEventListener('click', () => {
        hideElements([nextPlayerButton]);
        clearImages(currentHandDisplay);
        readyNextPlayer();
        returnNewPlayerNumber();
    });

    nextRoundButton.addEventListener('click', () => {
        hideElements([nextRoundButton, test, test2]);
        resetRoundVariables();
        displayRound(result);
        startNextRound();
        firstPlayer();
    });

    declareButton.addEventListener('click', () => {
        if(processBetValidity(faceInput.value, countInput.value)) {
            console.log("declarebutton validated");
            let challengers = getChallengers(faceInput.value, true);
            if (challengers.length > 0){
                 challenger = getOpponent(challengers);
                 challenged = table[0];
                 displayChallengeStatus(true, faceDisplay, challenger);
                 determineChallengeResult();
             }else{
                displayChallengeStatus(false, faceDisplay, challenger);
                displayElements([nextPlayerButton]);
            }
     }
    });

    passButton.addEventListener('click', ()=>{
        displayAndHide([nextPlayerButton], [passButton, bluffButton, spotOnButton]);
    });

    spotOnButton.addEventListener('click', () => {
        console.log('SpotOn called');
        challenger = table[0];
        challenged = currentPlayer;
        let loser;
        if(checkSpotOn()){
            result.innerHTML = `<div class = "text-warning display-4"> Spot On True -> ${challenged.name} loses a die </div>`;
           loser = challenged;
        }else{
            result.innerHTML = `<div class = "text-warning display-4"> Spot On False-> ${challenger.name} loses a die </div>`;
            loser = challenger;
        }
        removeDie(loser);
        checkIfEliminated(loser);
        displayElements([result, nextRoundButton]);
        endRound();
    });

};

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
    let name = nameInput.value;
    if (10 > playersInput.value > 0){
        let numPlayers = playersInput.value;
        hideElements([submit, playersInput, nameInput]);
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
   displayElements([currentPlayerDisplay, currentHandDisplay]);
   if (currentPlayer.player === true) {
      setUpHumanTurn();
    } else {
       setUpAiTurn();
    }
};

const setUpHumanTurn = ()=>{
    test2.innerHTML = "";
    displayElements([test2]);
    currentHandDisplay.innerHTML = `<h1 class="text-align"> Your Hand is: </h1>`;
    currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name}</h1>`;
    displayLastBet(lastBet, test);
    displayDiceImages(currentHandDisplay, convertToDiceImages(currentHand));
    displayAndHide([declareDisplay, declareButton, inputs], [spotOnButton, bluffButton, betDisplay, faceDisplay]);
};


const setUpAiTurn = ()=>{
    displayAndHide([spotOnButton, bluffButton, passButton, result, test], [currentHandDisplay]);
    result.innerHTML = "";
    currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name} is playing</h1>`;
    test.innerHTML = `Your hand is:`;
    displayDiceImages(test, convertToDiceImages(table[0].hand));
    lastBet = aiPlays();
    runAiAgainstAi();
};

const runAiAgainstAi = ()=>{
    let challengers = getChallengers(lastBet[0], false);
    console.log(challengers);
    if (challengers.length > 0){
        challenger = getOpponent(challengers);
        challenged = currentPlayer;
        hideElements([bluffButton, spotOnButton, passButton]);
        displayChallengeStatus(true, faceDisplay, challenger);
        determineChallengeResult();
    }else{
        displayChallengeStatus(false, faceDisplay, challenger);
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
    displayPlayers(atTable, table);
    console.log(`startNextRound function exited`);

};

const endRound = () => {
    resetRoundVariables();
    test.innerHTML = "ROUND OVER";
    PlayerNumber -= 1;
};

const resetRoundVariables = () => {
    lastBet = [0,0];
    betCount = 0;
    numberOfDie = 0;
    diceOnTableIndexedArray=[0,0,0,0,0,0];
    hideElements([passButton, bluffButton, spotOnButton, nextPlayerButton]);
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
        displayAndHide([faceDisplay], [declareDisplay, declareButton, inputs]);
        return true;
    } else {
        test2.innerHTML = `<p class="display-5 text-info">Not Valid Input</p>`;
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

const determineChallengeResult = () =>{
    console.log("determining challenges");
    displayAndHide([nextRoundButton, result], [nextPlayerButton]);
    handleChallengeCheck(getBetTruth());

};

const handleChallengeCheck = (betBoolean)=>{
    console.log("handle challenge function called");
    if(betBoolean){
        let color = getMessageColor(challenger,challenged);
        result.innerHTML = `<div class = "${color} display-4"> Challenge Failed -> ${challenger.name} loses a die </div>`;
        removeDie(challenger);
        checkIfEliminated(challenger);
}else{
        let color = getMessageColor(challenged, challenger);
        result.innerHTML = `<div class = "${color} display-4"> Challenge Succeeded -> ${challenged.name} loses a die </div>`;
        removeDie(challenged);
        checkIfEliminated(challenged);
    }
};

const getMessageColor = (loser, winner) =>{
    if (loser.player === true){
        return "text-danger";
    }else if(winner.player === true){
        return "text-success";
    }return ""

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
    displayElements([betDisplay]);
    betDisplay.innerHTML = `<p class="display-4">${currentPlayer.name} bets there are <br> ${newBet[1]} <span id="dice"> </span>s on the table</p>`;
    let dieDisplay = document.getElementById("dice");
    displayDiceImages(dieDisplay, convertToDiceImages([newBet[0]]));
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
        displayElements([gameOver]);
        gameOver.innerHTML="YOU LOSE"
    }else{
        displayElements([test2]);
        test2.innerHTML = `<h1 class="text-warning">${player.name} has been eliminated</h1>`;
        table.splice(index, 1);
    }
    console.log(table);
};

const checkForWinner = ()=>{
    if (table.length === 1){
        console.log('########GAME OVER###########');
        result.innerHTML = "YOU WIN";
        displayElements([gameOver]);
    }
};

//Game Start Functions
let cleanBoard = () => hideElements([submit, nameInput, playersInput, bluffButton,spotOnButton,passButton,nextRoundButton,nextPlayerButton,faceDisplay,playerOptionsDisplay, declareButton, declareDisplay, inputs, result, betDisplay, gameOver]);
let game = (initialValues) => {
    startGame(initialValues);
    startNextRound();
    firstPlayer();
};
cleanBoard();
eventListeners();


},{"./display.js":2}],2:[function(require,module,exports){
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

const displayChallengeStatus = (challenge, display, challenger) =>{
    if (challenge){
        display.innerHTML = `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`;
    }else{
        display.innerHTML = `<div class="text-warning display-4">No one challenges</div>`;
    }
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
    displayChallengeStatus : displayChallengeStatus,

};




},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9kaXNwbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9nQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIyMjIyMjIyMjIyMgSU1QT1JUUyAjIyMjIyMjIyMjXG4vLyMjIyMjI0RJU1BMQVkjIyMjIyMjIyNcbmNvbnN0IGRpc3BsYXkgPSByZXF1aXJlKCcuL2Rpc3BsYXkuanMnKTtcbmNvbnN0IHtkaXNwbGF5RWxlbWVudHN9ID0gZGlzcGxheTtcbmNvbnN0IHtoaWRlRWxlbWVudHN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5QW5kSGlkZX0gPSBkaXNwbGF5O1xuY29uc3Qge2NvbnZlcnRUb0RpY2VJbWFnZXN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5RGljZUltYWdlc30gPSBkaXNwbGF5O1xuY29uc3Qge2NsZWFySW1hZ2VzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheVBsYXllcnN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5TGFzdEJldH0gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlSb3VuZH0gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlDaGFsbGVuZ2VTdGF0dXN9ID0gZGlzcGxheTtcblxuXG4vLyMjIyMjIyMjIyMjRG9jdW1lbnQgYnV0dG9ucyBhbmQgZGlzcGxheXMjIyMjIyMjIyMjIyMjI1xuLy9kaXNwbGF5c1xubGV0IGN1cnJlbnRIYW5kRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3VycmVudEhhbmRcIik7XG5sZXQgY3VycmVudFBsYXllckRpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllckRpc3BsYXlcIik7XG5sZXQgcGxheWVyT3B0aW9uc0Rpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllck9wdGlvbnNcIik7XG5sZXQgdGVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdFwiKTtcbmxldCB0ZXN0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdDJcIik7XG5sZXQgZGVjbGFyZURpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlY2xhcmVEaXNwbGF5XCIpO1xubGV0IGZhY2VEaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmYWNlRGlzcGxheVwiKTtcbmxldCByZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3VsdFwiKTtcbmxldCBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0c1wiKTtcbmxldCBiZXREaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNiZXREaXNwbGF5XCIpO1xubGV0IGdhbWVPdmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lT3ZlclwiKTtcbmNvbnN0IGF0VGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XG5cbi8vQnV0dG9uc1xuY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpO1xuY29uc3QgbmV4dFBsYXllckJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFBsYXllclwiKTtcbmNvbnN0IGJsdWZmQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNibHVmZlwiKTtcbmNvbnN0IHNwb3RPbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3BvdE9uXCIpO1xuY29uc3QgZGVjbGFyZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZVwiKTtcbmNvbnN0IG5leHRSb3VuZEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFJvdW5kXCIpO1xuY29uc3QgZmFjZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhY2UnKTtcbmNvbnN0IGNvdW50SW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnQnKTtcbmNvbnN0IHBhc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzcycpO1xuY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldE5hbWUnKTtcbmNvbnN0IHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xuY29uc3QgcGxheWVyc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnZXRQbGF5ZXJzXCIpO1xuXG4vL0ltYWdlc1xuXG4vL0J1dHRvbiBMaXN0ZW5lcnNcbmNvbnN0IGV2ZW50TGlzdGVuZXJzID0gKCk9PiB7XG4gICAgc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtzdWJtaXQsIHBsYXllcnNJbnB1dCwgbmFtZUlucHV0XSwgW3N0YXJ0QnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBsZXQgZ2FtZUluaXRpYWxWYWx1ZXMgPSBnZXRHYW1lU2V0dGluZ3MoKTtcbiAgICAgICAgaWYoZ2FtZUluaXRpYWxWYWx1ZXMgIT09IGZhbHNlKXtcbiAgICAgICAgICAgIGdhbWUoZ2FtZUluaXRpYWxWYWx1ZXMpO31lbHNle1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmYWxzZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYmx1ZmZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQodHJ1ZSk7XG4gICAgICAgIGVuZFJvdW5kKCk7XG4gICAgfSk7XG5cbiAgICBuZXh0UGxheWVyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoaWRlRWxlbWVudHMoW25leHRQbGF5ZXJCdXR0b25dKTtcbiAgICAgICAgY2xlYXJJbWFnZXMoY3VycmVudEhhbmREaXNwbGF5KTtcbiAgICAgICAgcmVhZHlOZXh0UGxheWVyKCk7XG4gICAgICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xuICAgIH0pO1xuXG4gICAgbmV4dFJvdW5kQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoaWRlRWxlbWVudHMoW25leHRSb3VuZEJ1dHRvbiwgdGVzdCwgdGVzdDJdKTtcbiAgICAgICAgcmVzZXRSb3VuZFZhcmlhYmxlcygpO1xuICAgICAgICBkaXNwbGF5Um91bmQocmVzdWx0KTtcbiAgICAgICAgc3RhcnROZXh0Um91bmQoKTtcbiAgICAgICAgZmlyc3RQbGF5ZXIoKTtcbiAgICB9KTtcblxuICAgIGRlY2xhcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmKHByb2Nlc3NCZXRWYWxpZGl0eShmYWNlSW5wdXQudmFsdWUsIGNvdW50SW5wdXQudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlY2xhcmVidXR0b24gdmFsaWRhdGVkXCIpO1xuICAgICAgICAgICAgbGV0IGNoYWxsZW5nZXJzID0gZ2V0Q2hhbGxlbmdlcnMoZmFjZUlucHV0LnZhbHVlLCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChjaGFsbGVuZ2Vycy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgY2hhbGxlbmdlciA9IGdldE9wcG9uZW50KGNoYWxsZW5nZXJzKTtcbiAgICAgICAgICAgICAgICAgY2hhbGxlbmdlZCA9IHRhYmxlWzBdO1xuICAgICAgICAgICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKHRydWUsIGZhY2VEaXNwbGF5LCBjaGFsbGVuZ2VyKTtcbiAgICAgICAgICAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KCk7XG4gICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbGVtZW50cyhbbmV4dFBsYXllckJ1dHRvbl0pO1xuICAgICAgICAgICAgfVxuICAgICB9XG4gICAgfSk7XG5cbiAgICBwYXNzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PntcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW25leHRQbGF5ZXJCdXR0b25dLCBbcGFzc0J1dHRvbiwgYmx1ZmZCdXR0b24sIHNwb3RPbkJ1dHRvbl0pO1xuICAgIH0pO1xuXG4gICAgc3BvdE9uQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnU3BvdE9uIGNhbGxlZCcpO1xuICAgICAgICBjaGFsbGVuZ2VyID0gdGFibGVbMF07XG4gICAgICAgIGNoYWxsZW5nZWQgPSBjdXJyZW50UGxheWVyO1xuICAgICAgICBsZXQgbG9zZXI7XG4gICAgICAgIGlmKGNoZWNrU3BvdE9uKCkpe1xuICAgICAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gVHJ1ZSAtPiAke2NoYWxsZW5nZWQubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgICAgbG9zZXIgPSBjaGFsbGVuZ2VkO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIEZhbHNlLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlRGllKGxvc2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQobG9zZXIpO1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3Jlc3VsdCwgbmV4dFJvdW5kQnV0dG9uXSk7XG4gICAgICAgIGVuZFJvdW5kKCk7XG4gICAgfSk7XG5cbn07XG5cbmxldCBuYW1lcyA9IFtcbiAgICBcIlNoaXJsZWVuXCIsIFwiS2FyYVwiLCBcIkNsZXZlbGFuZFwiLFwiTWVycmlcIiwgXCJDb25jZXB0aW9uXCIsIFwiSGFsZXlcIiwgXCJGbG9yYW5jZVwiLCBcIkRvcmllXCIsIFwiTHVlbGxhXCIsIFwiVmVybmlhXCIsXG4gICAgXCJGcmVlbWFuXCIsIFwiS2F0aGFyaW5hXCIsIFwiQ2hhcm1haW5cIiwgXCJHcmFoYW1cIiwgXCJEYXJuZWxsXCIsIFwiQmVybmV0dGFcIiwgXCJJbmVsbFwiLCBcIlBhZ2VcIiwgXCJHYXJuZXR0XCIsIFwiQW5uYWxpc2FcIixcbiAgICBcIkJyYW50XCIsIFwiVmFsZGFcIiwgXCJWaWtpXCIsIFwiQXN1bmNpb25cIiwgXCJNb2lyYVwiLCBcIktheWNlZVwiLCBcIlJpY2hlbGxlXCIsIFwiRWxpY2lhXCIsIFwiRW5laWRhXCIsIFwiRXZlbHlublwiXG5dO1xuXG4vL09CSkVDVFNcbmNsYXNzIFBsYXllcntcbiAgICBjb25zdHJ1Y3RvcihuYW1lKVxuICAgIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZSB8fCBnZXRSYW5kb21OYW1lKCk7XG4gICAgICAgIHRoaXMuaGFuZCA9IFswLDAsMCwwXTtcbiAgICAgICAgdGhpcy5yb2xsID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kID0gdGhpcy5oYW5kLm1hcChcbiAgICAgICAgICAgICAgICAoKSA9PiAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNikgKyAxKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMubmFtZX0gaGFzIHJvbGxlZGApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZFRvVGFibGUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0YWJsZS5wdXNoKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZE9jY3VycmVuY2VzID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmhhbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheVt0aGlzLmhhbmRbaV0gLSAxXSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbnVtYmVyT2ZEaWUgKz0gdGhpcy5oYW5kLmxlbmd0aDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZXR1cm5UcnVlSWZBSUNoYWxsZW5nZXMgPSAoZmFjZSwgcGxheWVyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGxheWVyTnVtID0gZ2V0RmFjZUNvdW50KHRoaXMsIGZhY2UpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGZhY2U6ICR7ZmFjZX1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBwbGF5ZXJOdW1iZXJvZkZhY2U6ICR7cGxheWVyTnVtfWApO1xuICAgICAgICAgICAgbGV0IHBjdCA9IGRpZVJhdGlvKHBsYXllck51bSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgcmV0dXJuIHJhdGlvOiAke3BjdH1gKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICAgICAgICAgIHBjdCArPSAoMS8xMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGN0IDw9ICgxIC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9ZWxzZSBpZiAocGN0IDw9ICgyIC8gMTIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuMlxuICAgICAgICAgICAgfWVsc2UgaWYgKHBjdCA8PSAoNCAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuM1xuICAgICAgICAgICAgfWVsc2UgaWYocGN0IDw9ICg1IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC41XG4gICAgICAgICAgICB9ZWxzZSBpZihwY3QgPD0gKDYgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjdcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG59fVxuXG5sZXQgZ2V0RmFjZUNvdW50ID0gKHBsYXllciwgZmFjZSk9PntcbiAgICBsZXQgYXJyID0gY291bnRGYWNlcyhwbGF5ZXIuaGFuZCk7XG4gICAgY29uc29sZS5sb2cocGxheWVyLm5hbWUgKyBhcnIpO1xuICAgIHJldHVybiBhcnJbZmFjZS0xXTtcbn07XG5cbmxldCBkaWVSYXRpbyA9IChwbGF5ZXJOdW0pID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk5VbWJlciBkaWUgb24gdGFibGVcIiArIG51bWJlck9mRGllKTtcbiAgICBjb25zb2xlLmxvZyhcIkJGTyBhcnJcIiArIGJldENvdW50KTtcbiAgICByZXR1cm4gKGJldENvdW50LXBsYXllck51bSkvbnVtYmVyT2ZEaWU7XG59O1xuXG4vL01haW4gVmFyaWFibGVzXG5sZXQgdGFibGUgPSBbXTtcbmxldCBQbGF5ZXJOdW1iZXI7XG5sZXQgY3VycmVudEhhbmQ7XG5sZXQgY3VycmVudFBsYXllcjtcbmxldCBsYXN0QmV0ID0gWzAsIDBdO1xubGV0IGJldENvdW50ID0gMDtcbmxldCBkaWNlT25UYWJsZUluZGV4ZWRBcnJheSA9IFswLDAsMCwwLDAsMF07XG5sZXQgbnVtYmVyT2ZEaWUgPSAwO1xubGV0IGNoYWxsZW5nZXI7XG5sZXQgY2hhbGxlbmdlZDtcblxuLy8jIyMjIyMjIyMjIyMjR2FtZSBGdW5jdGlvbnMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IHN0YXJ0R2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgY3JlYXRlSHVtYW5QbGF5ZXIoaW5pdGlhbFZhbHVlcyk7XG4gICAgY3JlYXRlQWlQbGF5ZXJzKGluaXRpYWxWYWx1ZXNbMV0pO1xuICAgIGlmICh0YWJsZVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhYmxlWzBdLnBsYXllciA9IHRydWU7fVxufTtcblxuY29uc3QgY3JlYXRlSHVtYW5QbGF5ZXIgPSAoaW5pdGlhbFZhbHVlcyk9PntcbiAgICBsZXQgaHVtYW4gPSBuZXcgUGxheWVyKGluaXRpYWxWYWx1ZXNbMF0pO1xuICAgIGh1bWFuLmFkZFRvVGFibGUodGFibGUpO1xufTtcblxuY29uc3QgZ2V0R2FtZVNldHRpbmdzID0gKCk9PntcbiAgICBsZXQgbmFtZSA9IG5hbWVJbnB1dC52YWx1ZTtcbiAgICBpZiAoMTAgPiBwbGF5ZXJzSW5wdXQudmFsdWUgPiAwKXtcbiAgICAgICAgbGV0IG51bVBsYXllcnMgPSBwbGF5ZXJzSW5wdXQudmFsdWU7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbc3VibWl0LCBwbGF5ZXJzSW5wdXQsIG5hbWVJbnB1dF0pO1xuICAgICAgICByZXR1cm4gKFtuYW1lLCBudW1QbGF5ZXJzXSk7XG4gICAgfXJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJhbmRvbU5hbWUgPSAoKT0+IHtcbiAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihuYW1lcy5sZW5ndGgpKTtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpbmRleF07XG4gICAgICAgIG5hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xufTtcblxuY29uc3QgY3JlYXRlQWlQbGF5ZXJzID0gKG51bSk9PntcbiAgICBmb3IgKGxldCBpID0wOyBpIDxudW07IGkrKyl7XG4gICAgICAgIGxldCB4ID0gbmV3IFBsYXllcigpO1xuICAgICAgICB4LmFkZFRvVGFibGUoKTtcbiAgICB9XG59O1xuXG4vL1BsYXllciBzZXQgdXBcbmNvbnN0IHNldFVwTmV4dFBsYXllciA9ICgpID0+IHtcbiAgIGdldE5leHRQbGF5ZXIoKTtcbiAgIGRpc3BsYXlFbGVtZW50cyhbY3VycmVudFBsYXllckRpc3BsYXksIGN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxheWVyID09PSB0cnVlKSB7XG4gICAgICBzZXRVcEh1bWFuVHVybigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgc2V0VXBBaVR1cm4oKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRVcEh1bWFuVHVybiA9ICgpPT57XG4gICAgdGVzdDIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgY3VycmVudEhhbmREaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+IFlvdXIgSGFuZCBpczogPC9oMT5gO1xuICAgIGN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9PC9oMT5gO1xuICAgIGRpc3BsYXlMYXN0QmV0KGxhc3RCZXQsIHRlc3QpO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKGN1cnJlbnRIYW5kRGlzcGxheSwgY29udmVydFRvRGljZUltYWdlcyhjdXJyZW50SGFuZCkpO1xuICAgIGRpc3BsYXlBbmRIaWRlKFtkZWNsYXJlRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgaW5wdXRzXSwgW3Nwb3RPbkJ1dHRvbiwgYmx1ZmZCdXR0b24sIGJldERpc3BsYXksIGZhY2VEaXNwbGF5XSk7XG59O1xuXG5cbmNvbnN0IHNldFVwQWlUdXJuID0gKCk9PntcbiAgICBkaXNwbGF5QW5kSGlkZShbc3BvdE9uQnV0dG9uLCBibHVmZkJ1dHRvbiwgcGFzc0J1dHRvbiwgcmVzdWx0LCB0ZXN0XSwgW2N1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgIHJlc3VsdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9IGlzIHBsYXlpbmc8L2gxPmA7XG4gICAgdGVzdC5pbm5lckhUTUwgPSBgWW91ciBoYW5kIGlzOmA7XG4gICAgZGlzcGxheURpY2VJbWFnZXModGVzdCwgY29udmVydFRvRGljZUltYWdlcyh0YWJsZVswXS5oYW5kKSk7XG4gICAgbGFzdEJldCA9IGFpUGxheXMoKTtcbiAgICBydW5BaUFnYWluc3RBaSgpO1xufTtcblxuY29uc3QgcnVuQWlBZ2FpbnN0QWkgPSAoKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IGdldENoYWxsZW5nZXJzKGxhc3RCZXRbMF0sIGZhbHNlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsbGVuZ2Vycyk7XG4gICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uLCBwYXNzQnV0dG9uXSk7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQoKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldE5leHRQbGF5ZXIgPSAoKT0+e1xuICAgIGN1cnJlbnRQbGF5ZXIgPSB0YWJsZVtQbGF5ZXJOdW1iZXJdO1xuICAgIGN1cnJlbnRIYW5kID0gY3VycmVudFBsYXllci5oYW5kO1xufTtcblxuY29uc3QgZmlyc3RQbGF5ZXIgPSAoKSA9PiB7XG4gICAgc2V0VXBOZXh0UGxheWVyKCk7XG4gICAgUGxheWVyTnVtYmVyICs9IDE7XG4gICAgcmV0dXJuTmV3UGxheWVyTnVtYmVyKCk7XG59O1xuXG5jb25zdCByZWFkeU5leHRQbGF5ZXIgPSAoKSA9PiB7XG4gICAgc2V0VXBOZXh0UGxheWVyKCk7XG4gICAgUGxheWVyTnVtYmVyICs9IDE7XG59O1xuXG5jb25zdCByZXR1cm5OZXdQbGF5ZXJOdW1iZXIgPSAoKSA9PiB7XG4gICAgaWYgKFBsYXllck51bWJlciA+PSB0YWJsZS5sZW5ndGggfHwgUGxheWVyTnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgUGxheWVyTnVtYmVyID0gMDtcbiAgICB9IGVsc2UgaWYgKFBsYXllck51bWJlciA8IDApIHtcbiAgICAgICAgUGxheWVyTnVtYmVyID0gdGFibGUubGVuZ3RoIC0gMTtcbiAgICB9XG59O1xuXG4vL05FVyBST1VORFxuY29uc3Qgc3RhcnROZXh0Um91bmQgPSAoKSA9PiB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0YWJsZS5sZW5ndGg7IHgrKykge1xuICAgICAgICB0YWJsZVt4XS5yb2xsKCk7XG4gICAgICAgIHRhYmxlW3hdLmFkZE9jY3VycmVuY2VzKCk7XG4gICAgfVxuICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xuICAgIGN1cnJlbnRQbGF5ZXIgPSB0YWJsZVtQbGF5ZXJOdW1iZXJdO1xuICAgIGRpc3BsYXlQbGF5ZXJzKGF0VGFibGUsIHRhYmxlKTtcbiAgICBjb25zb2xlLmxvZyhgc3RhcnROZXh0Um91bmQgZnVuY3Rpb24gZXhpdGVkYCk7XG5cbn07XG5cbmNvbnN0IGVuZFJvdW5kID0gKCkgPT4ge1xuICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICB0ZXN0LmlubmVySFRNTCA9IFwiUk9VTkQgT1ZFUlwiO1xuICAgIFBsYXllck51bWJlciAtPSAxO1xufTtcblxuY29uc3QgcmVzZXRSb3VuZFZhcmlhYmxlcyA9ICgpID0+IHtcbiAgICBsYXN0QmV0ID0gWzAsMF07XG4gICAgYmV0Q291bnQgPSAwO1xuICAgIG51bWJlck9mRGllID0gMDtcbiAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheT1bMCwwLDAsMCwwLDBdO1xuICAgIGhpZGVFbGVtZW50cyhbcGFzc0J1dHRvbiwgYmx1ZmZCdXR0b24sIHNwb3RPbkJ1dHRvbiwgbmV4dFBsYXllckJ1dHRvbl0pO1xufTtcblxuXG4vL0dBTUUgUExBWSBGVU5DVElPTlNcbmNvbnN0IGdldEJldFRydXRoID0gKCkgPT4ge1xuICAgIGxldCBmYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgY291bnQgPSBsYXN0QmV0WzFdO1xuICAgIGNvbnNvbGUubG9nKGRpY2VPblRhYmxlSW5kZXhlZEFycmF5KTtcbiAgICByZXR1cm4gZGljZU9uVGFibGVJbmRleGVkQXJyYXlbZmFjZSAtIDFdID49IGNvdW50O1xufTtcblxuY29uc3QgcHJvY2Vzc0JldFZhbGlkaXR5ID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgbGV0IGJldCA9IGdldEJldElmVmFsaWQoZmFjZSwgY291bnQpO1xuICAgIGlmIChiZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIGxhc3RCZXQgPSBiZXQ7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtmYWNlRGlzcGxheV0sIFtkZWNsYXJlRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgaW5wdXRzXSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRlc3QyLmlubmVySFRNTCA9IGA8cCBjbGFzcz1cImRpc3BsYXktNSB0ZXh0LWluZm9cIj5Ob3QgVmFsaWQgSW5wdXQ8L3A+YDtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRCZXRJZlZhbGlkID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgZmFjZSA9IHBhcnNlSW50KGZhY2UpO1xuICAgIGNvdW50ID0gcGFyc2VJbnQoY291bnQpO1xuICAgIGxldCBsYXN0RmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGxhc3RDb3VudCA9IGxhc3RCZXRbMV07XG4gICAgY29uc29sZS5sb2coYGxhc3RGYWNlID0gJHtsYXN0QmV0WzBdfSwgbGFzdENvdW50ID0gJHtsYXN0QmV0WzFdfSBmYWNlPSR7ZmFjZX0sIGNvdW50PSR7Y291bnR9YCk7XG4gICAgaWYgKFxuICAgICAgICAoICAgKChmYWNlID4gbGFzdEZhY2UpICYmIChjb3VudCA9PT0gbGFzdENvdW50KSkgJiZcbiAgICAgICAgICAgICgoY291bnQgPiAwKSAmJiAoNyA+IGZhY2UgPiAwKSlcbiAgICAgICAgKVxuXG4gICAgICAgIHx8XG5cbiAgICAgICAgKChjb3VudCA+IGxhc3RDb3VudCkgJiYgKChjb3VudCA+IDApICYmICg3ID4gZmFjZSAmJiBmYWNlID4gMCkpKVxuICAgICkge1xuICAgICAgICBiZXRDb3VudCA9IGNvdW50O1xuICAgICAgICByZXR1cm4gW2ZhY2UsIGNvdW50XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgZ2V0Q2hhbGxlbmdlcnMgPSAoZmFjZSwgcGxheWVyKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IFtdO1xuICAgIGZvciAobGV0IGk9MTsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYodGFibGVbaV0ucmV0dXJuVHJ1ZUlmQUlDaGFsbGVuZ2VzKGZhY2UsIHBsYXllcikpe1xuICAgICAgICAgICAgaWYgKHRhYmxlW2ldICE9PSBjdXJyZW50UGxheWVyKXtcbiAgICAgICAgICAgIGNoYWxsZW5nZXJzLnB1c2godGFibGVbaV0pfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBQb3NzaWJsZSBDaGFsbGVuZ2VyczogJHtjaGFsbGVuZ2Vyc31gKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IC4zKXtcbiAgICByZXR1cm4gY2hhbGxlbmdlcnM7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtdO1xufTtcblxuY29uc3QgZ2V0T3Bwb25lbnQgPSAoY2hhbGxlbmdlcnMpPT57XG4gICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihjaGFsbGVuZ2Vycy5sZW5ndGgpKTtcblxuICAgIGNvbnNvbGUubG9nKGNoYWxsZW5nZXJzW2luZGV4XSk7XG4gICAgcmV0dXJuIGNoYWxsZW5nZXJzW2luZGV4XVxufTtcblxuY29uc3QgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0ID0gKCkgPT57XG4gICAgY29uc29sZS5sb2coXCJkZXRlcm1pbmluZyBjaGFsbGVuZ2VzXCIpO1xuICAgIGRpc3BsYXlBbmRIaWRlKFtuZXh0Um91bmRCdXR0b24sIHJlc3VsdF0sIFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgaGFuZGxlQ2hhbGxlbmdlQ2hlY2soZ2V0QmV0VHJ1dGgoKSk7XG5cbn07XG5cbmNvbnN0IGhhbmRsZUNoYWxsZW5nZUNoZWNrID0gKGJldEJvb2xlYW4pPT57XG4gICAgY29uc29sZS5sb2coXCJoYW5kbGUgY2hhbGxlbmdlIGZ1bmN0aW9uIGNhbGxlZFwiKTtcbiAgICBpZihiZXRCb29sZWFuKXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZXIsY2hhbGxlbmdlZCk7XG4gICAgICAgIHJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwiJHtjb2xvcn0gZGlzcGxheS00XCI+IENoYWxsZW5nZSBGYWlsZWQgLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgIHJlbW92ZURpZShjaGFsbGVuZ2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQoY2hhbGxlbmdlcik7XG59ZWxzZXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZWQsIGNoYWxsZW5nZXIpO1xuICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3MgPSBcIiR7Y29sb3J9IGRpc3BsYXktNFwiPiBDaGFsbGVuZ2UgU3VjY2VlZGVkIC0+ICR7Y2hhbGxlbmdlZC5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gO1xuICAgICAgICByZW1vdmVEaWUoY2hhbGxlbmdlZCk7XG4gICAgICAgIGNoZWNrSWZFbGltaW5hdGVkKGNoYWxsZW5nZWQpO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldE1lc3NhZ2VDb2xvciA9IChsb3Nlciwgd2lubmVyKSA9PntcbiAgICBpZiAobG9zZXIucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIFwidGV4dC1kYW5nZXJcIjtcbiAgICB9ZWxzZSBpZih3aW5uZXIucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIFwidGV4dC1zdWNjZXNzXCI7XG4gICAgfXJldHVybiBcIlwiXG5cbn07XG5cbmNvbnN0IGNoZWNrU3BvdE9uID0gKCkgPT57XG4gICAgcmV0dXJuIChkaWNlT25UYWJsZUluZGV4ZWRBcnJheVtsYXN0QmV0WzBdIC0xXSA9PT0gbGFzdEJldFsxXSlcbn07XG5cbmNvbnN0IGNoZWNrSWZFbGltaW5hdGVkID0gKGJldExvc2VyKT0+e1xuICAgIGlmIChyZXR1cm5JZkxhc3REaWUoYmV0TG9zZXIpKXtcbiAgICAgICAgaGFuZGxlTGFzdERpZUxvc3QoYmV0TG9zZXIpO1xuICAgICAgICBjaGVja0Zvcldpbm5lcigpO1xuICAgIH1cbn07XG5cbmNvbnN0IHJlbW92ZURpZSA9IChwbGF5ZXIpID0+e1xuICAgIHBsYXllci5oYW5kICA9IHBsYXllci5oYW5kLnNwbGljZSgxKTtcbn07XG5cbi8vQ29tcHV0ZXIgYmV0c1xuY29uc3QgYWlQbGF5cyA9ICgpPT4ge1xuICAgIGxldCBuZXdCZXQgPSBwbGF5ZXJCZXQoKTtcbiAgICBiZXRDb3VudCA9IG5ld0JldFsxXTtcbiAgICBkaXNwbGF5RWxlbWVudHMoW2JldERpc3BsYXldKTtcbiAgICBiZXREaXNwbGF5LmlubmVySFRNTCA9IGA8cCBjbGFzcz1cImRpc3BsYXktNFwiPiR7Y3VycmVudFBsYXllci5uYW1lfSBiZXRzIHRoZXJlIGFyZSA8YnI+ICR7bmV3QmV0WzFdfSA8c3BhbiBpZD1cImRpY2VcIj4gPC9zcGFuPnMgb24gdGhlIHRhYmxlPC9wPmA7XG4gICAgbGV0IGRpZURpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpY2VcIik7XG4gICAgZGlzcGxheURpY2VJbWFnZXMoZGllRGlzcGxheSwgY29udmVydFRvRGljZUltYWdlcyhbbmV3QmV0WzBdXSkpO1xuICAgIHJldHVybiBuZXdCZXQ7XG59O1xuXG5jb25zdCBjb3VudEZhY2VzID0gKGhhbmQpID0+e1xuICAgIGxldCBjdXJyZW50SGFuZEludHMgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGN1cnJlbnRIYW5kSW50c1toYW5kW2ldIC0gMV0gKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRIYW5kSW50cztcbn07XG5jb25zdCBwbGF5ZXJCZXQgPSAoKSA9PiB7XG4gICAgbGV0IGN1cnJlbnRIYW5kSW50cyA9IGNvdW50RmFjZXMoY3VycmVudEhhbmQpO1xuICAgIGxldCBsYXJnZXN0Q291bnQgPSBNYXRoLm1heCguLi5jdXJyZW50SGFuZEludHMpO1xuICAgIGxldCBiZXN0SGFuZCA9IFtjdXJyZW50SGFuZEludHMuaW5kZXhPZihsYXJnZXN0Q291bnQpKzEsIGxhcmdlc3RDb3VudF07XG4gICAgcmV0dXJuIGFpQmx1ZmYoYmVzdEhhbmQpO1xufTtcblxuY29uc3QgYWlCbHVmZiA9IChiZXN0SGFuZCk9PntcbiAgICB3aGlsZSAoYWlDaGVja0N1cnJlbnRIYW5kVmFsaWRpdHkoYmVzdEhhbmQpICE9PSB0cnVlKXtcbiAgICAgICAgYmVzdEhhbmRbMV0gKz0gMTtcbiAgICB9XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPCAuMyl7XG4gICAgICAgIGJlc3RIYW5kWzFdICs9IDE7XG4gICAgICAgIHJldHVybiBiZXN0SGFuZDtcbiAgICB9ZWxzZXtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAuMSl7XG4gICAgICAgICAgICBiZXN0SGFuZFsxXSArPSAyO1xuICAgICAgICAgICAgcmV0dXJuIGJlc3RIYW5kO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0SGFuZFxufTtcblxuY29uc3QgYWlDaGVja0N1cnJlbnRIYW5kVmFsaWRpdHkgPSBoYW5kID0+IHtcbiAgICByZXR1cm4gKChoYW5kWzBdID4gbGFzdEJldFswXSAgJiYgaGFuZFsxXSA+PSBsYXN0QmV0WzFdKSB8fCBoYW5kWzFdID4gbGFzdEJldFsxXSlcbn07XG5cbmNvbnN0IHJldHVybklmTGFzdERpZSA9IHBsYXllciA9PiB7XG4gICAgcmV0dXJuIHBsYXllci5oYW5kLmxlbmd0aCA9PT0gMDtcbn07XG5cbmNvbnN0IGhhbmRsZUxhc3REaWVMb3N0ID0gcGxheWVyID0+e1xuICAgIGNvbnNvbGUubG9nKGBIYW5kbGluZyBsYXN0IGRpY2Ugb2YgJHtwbGF5ZXIubmFtZX1gKTtcbiAgICBsZXQgaW5kZXggPSB0YWJsZS5pbmRleE9mKHBsYXllcik7XG4gICAgY29uc29sZS5sb2coaW5kZXgpO1xuICAgIGNvbnNvbGUubG9nKHRhYmxlW2luZGV4XSk7XG4gICAgaWYgKHRhYmxlW2luZGV4XS5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW2dhbWVPdmVyXSk7XG4gICAgICAgIGdhbWVPdmVyLmlubmVySFRNTD1cIllPVSBMT1NFXCJcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFt0ZXN0Ml0pO1xuICAgICAgICB0ZXN0Mi5pbm5lckhUTUwgPSBgPGgxIGNsYXNzPVwidGV4dC13YXJuaW5nXCI+JHtwbGF5ZXIubmFtZX0gaGFzIGJlZW4gZWxpbWluYXRlZDwvaDE+YDtcbiAgICAgICAgdGFibGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGFibGUpO1xufTtcblxuY29uc3QgY2hlY2tGb3JXaW5uZXIgPSAoKT0+e1xuICAgIGlmICh0YWJsZS5sZW5ndGggPT09IDEpe1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyNHQU1FIE9WRVIjIyMjIyMjIyMjIycpO1xuICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gXCJZT1UgV0lOXCI7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbZ2FtZU92ZXJdKTtcbiAgICB9XG59O1xuXG4vL0dhbWUgU3RhcnQgRnVuY3Rpb25zXG5sZXQgY2xlYW5Cb2FyZCA9ICgpID0+IGhpZGVFbGVtZW50cyhbc3VibWl0LCBuYW1lSW5wdXQsIHBsYXllcnNJbnB1dCwgYmx1ZmZCdXR0b24sc3BvdE9uQnV0dG9uLHBhc3NCdXR0b24sbmV4dFJvdW5kQnV0dG9uLG5leHRQbGF5ZXJCdXR0b24sZmFjZURpc3BsYXkscGxheWVyT3B0aW9uc0Rpc3BsYXksIGRlY2xhcmVCdXR0b24sIGRlY2xhcmVEaXNwbGF5LCBpbnB1dHMsIHJlc3VsdCwgYmV0RGlzcGxheSwgZ2FtZU92ZXJdKTtcbmxldCBnYW1lID0gKGluaXRpYWxWYWx1ZXMpID0+IHtcbiAgICBzdGFydEdhbWUoaW5pdGlhbFZhbHVlcyk7XG4gICAgc3RhcnROZXh0Um91bmQoKTtcbiAgICBmaXJzdFBsYXllcigpO1xufTtcbmNsZWFuQm9hcmQoKTtcbmV2ZW50TGlzdGVuZXJzKCk7XG5cbiIsIi8vRElDRSBJTUFHRVNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmNvbnN0IGRpZTEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMS5zcmM9XCJpbWFnZXMvZGllMS5wbmdcIjtcblxuY29uc3QgZGllMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWUyLnNyYz1cImltYWdlcy9kaWUyLnBuZ1wiO1xuXG5jb25zdCBkaWUzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTMuc3JjPVwiaW1hZ2VzL2RpZTMucG5nXCI7XG5cbmNvbnN0IGRpZTQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNC5zcmM9XCJpbWFnZXMvZGllNC5wbmdcIjtcblxuY29uc3QgZGllNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU1LnNyYz1cImltYWdlcy9kaWU1LnBuZ1wiO1xuXG5jb25zdCBkaWU2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTYuc3JjPVwiaW1hZ2VzL2RpZTYucG5nXCI7XG5cbmNvbnN0IGRpY2VJbWFnZXMgPSBbZGllMSwgZGllMiwgZGllMywgZGllNCwgZGllNSwgZGllNl07XG5cbi8vR2VuZXJpYyBEaXNwbGF5IEZ1bmN0aW9uc1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jb25zdCBkaXNwbGF5RWxlbWVudHMgPSAoYXJyYXkpPT4ge1xuICAgIGZvciAobGV0IGVsZW1lbnQgPSAwOyBlbGVtZW50IDwgYXJyYXkubGVuZ3RoOyBlbGVtZW50Kyspe1xuICAgICAgICBhcnJheVtlbGVtZW50XS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzt9XG59O1xuXG5jb25zdCBoaWRlRWxlbWVudHMgPSAoYXJyYXkpPT4ge1xuICAgIGZvciAobGV0IGVsZW1lbnQgPSAwOyBlbGVtZW50IDwgYXJyYXkubGVuZ3RoOyBlbGVtZW50Kyspe1xuICAgICAgICBhcnJheVtlbGVtZW50XS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbn07XG5cbmNvbnN0IGRpc3BsYXlBbmRIaWRlID0gKGFycmF5QWRkLCBhcnJheURlbGV0ZSk9PntcbiAgICBkaXNwbGF5RWxlbWVudHMoYXJyYXlBZGQpO1xuICAgIGhpZGVFbGVtZW50cyhhcnJheURlbGV0ZSk7XG59O1xuXG4vL0RpY2UgSW1hZ2UgRnVuY3Rpb25zXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IGNvbnZlcnRUb0RpY2VJbWFnZXMgPSBoYW5kID0+e1xuICAgIGxldCBpbWdIYW5kID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgbGV0IGZhY2UgPSBoYW5kW2ldO1xuICAgICAgICBsZXQgZGljZUltYWdlID0gZGljZUltYWdlc1tmYWNlLTFdLmNsb25lTm9kZSgpO1xuICAgICAgICBpbWdIYW5kLnB1c2goZGljZUltYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIGltZ0hhbmQ7XG59O1xuXG5jb25zdCBkaXNwbGF5RGljZUltYWdlcyA9IChwYXJlbnROb2RlLCBoYW5kSW1hZ2VzKSA9PntcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRJbWFnZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGhhbmRJbWFnZXNbaV0pO1xuICAgIH1cbn07XG5cbmNvbnN0IGNsZWFySW1hZ2VzID0gcGFyZW50Tm9kZSA9PntcbiAgICB3aGlsZSAocGFyZW50Tm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbiAgICB9XG59O1xuXG5cblxuY29uc3QgZGlzcGxheVBsYXllcnMgPSAoZWxlbWVudCwgdGFibGUpPT57XG4gICAgbGV0IGh0bWwgPSBgPGgzPlBMYXllcnM8L2gzPmA7XG4gICAgZm9yIChsZXQgaSA9MDsgaTx0YWJsZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGh0bWwgKz0gYCR7dGFibGVbaV0ubmFtZX0gLSBEaWNlIExlZnQ6ICR7dGFibGVbaV0uaGFuZC5sZW5ndGh9IDxicj5gXG4gICAgfVxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcbn07XG5cbmNvbnN0IGRpc3BsYXlMYXN0QmV0ID0gKGxhc3RCZXQsIGVsZW1lbnQpPT4ge1xuICAgIGlmIChsYXN0QmV0WzBdICE9PSAwKSB7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gYDxoMz5MYXN0IEJldDogJHtsYXN0QmV0WzFdfSA8L2gzPmA7XG4gICAgICAgIGRpc3BsYXlEaWNlSW1hZ2VzKGVsZW1lbnQsIGNvbnZlcnRUb0RpY2VJbWFnZXMoW2xhc3RCZXRbMF1dKSlcbiAgICB9XG59O1xuXG5jb25zdCBkaXNwbGF5Um91bmQgPSAocmVzdWx0KSA9PiB7XG4gICAgaGlkZUVsZW1lbnRzKFtyZXN1bHRdKTtcbn07XG5cbmNvbnN0IGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMgPSAoY2hhbGxlbmdlLCBkaXNwbGF5LCBjaGFsbGVuZ2VyKSA9PntcbiAgICBpZiAoY2hhbGxlbmdlKXtcbiAgICAgICAgZGlzcGxheS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj5DSEFMTEVOR0VEIEJZICR7Y2hhbGxlbmdlci5uYW1lfTwvZGl2PmA7XG4gICAgfWVsc2V7XG4gICAgICAgIGRpc3BsYXkuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+Tm8gb25lIGNoYWxsZW5nZXM8L2Rpdj5gO1xuICAgIH1cbn07XG5cblxuXG4vLyBFWFBPUlRTXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkaXNwbGF5RWxlbWVudHMgOiBkaXNwbGF5RWxlbWVudHMsXG4gICAgaGlkZUVsZW1lbnRzIDogaGlkZUVsZW1lbnRzLFxuICAgIGRpc3BsYXlBbmRIaWRlIDogZGlzcGxheUFuZEhpZGUsXG4gICAgY29udmVydFRvRGljZUltYWdlcyA6IGNvbnZlcnRUb0RpY2VJbWFnZXMsXG4gICAgY2xlYXJJbWFnZXMgOiBjbGVhckltYWdlcyxcbiAgICBkaXNwbGF5RGljZUltYWdlczogZGlzcGxheURpY2VJbWFnZXMsXG4gICAgZGlzcGxheVBsYXllcnMgOiBkaXNwbGF5UGxheWVycyxcbiAgICBkaXNwbGF5TGFzdEJldCA6IGRpc3BsYXlMYXN0QmV0LFxuICAgIGRpc3BsYXlSb3VuZCA6IGRpc3BsYXlSb3VuZCxcbiAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzIDogZGlzcGxheUNoYWxsZW5nZVN0YXR1cyxcblxufTtcblxuXG5cbiJdfQ==
