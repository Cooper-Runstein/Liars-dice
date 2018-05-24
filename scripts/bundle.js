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
        displayChallengeStatus(true);
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
                 displayChallengeStatus(true);
                 determineChallengeResult();
             }else{
                displayChallengeStatus(false);
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

//generic functions





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

const displayChallengeStatus = (challenge) =>{
    if (challenge){
        faceDisplay.innerHTML = `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`;
    }else{
        faceDisplay.innerHTML = `<div class="text-warning display-4">No one challenges</div>`;
    }
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




},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9kaXNwbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzloQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIyMjIyMjIyMjIyMgSU1QT1JUUyAjIyMjIyMjIyMjXG4vLyMjIyMjI0RJU1BMQVkjIyMjIyMjIyNcbmNvbnN0IGRpc3BsYXkgPSByZXF1aXJlKCcuL2Rpc3BsYXkuanMnKTtcbmNvbnN0IHtkaXNwbGF5RWxlbWVudHN9ID0gZGlzcGxheTtcbmNvbnN0IHtoaWRlRWxlbWVudHN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5QW5kSGlkZX0gPSBkaXNwbGF5O1xuY29uc3Qge2NvbnZlcnRUb0RpY2VJbWFnZXN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5RGljZUltYWdlc30gPSBkaXNwbGF5O1xuY29uc3Qge2NsZWFySW1hZ2VzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheVBsYXllcnN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5TGFzdEJldH0gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlSb3VuZH0gPSBkaXNwbGF5O1xuXG5cbi8vIyMjIyMjIyMjIyNEb2N1bWVudCBidXR0b25zIGFuZCBkaXNwbGF5cyMjIyMjIyMjIyMjIyMjXG4vL2Rpc3BsYXlzXG5sZXQgY3VycmVudEhhbmREaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjdXJyZW50SGFuZFwiKTtcbmxldCBjdXJyZW50UGxheWVyRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyRGlzcGxheVwiKTtcbmxldCBwbGF5ZXJPcHRpb25zRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyT3B0aW9uc1wiKTtcbmxldCB0ZXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXN0XCIpO1xubGV0IHRlc3QyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXN0MlwiKTtcbmxldCBkZWNsYXJlRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZURpc3BsYXlcIik7XG5sZXQgZmFjZURpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZhY2VEaXNwbGF5XCIpO1xubGV0IHJlc3VsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdWx0XCIpO1xubGV0IGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5wdXRzXCIpO1xubGV0IGJldERpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JldERpc3BsYXlcIik7XG5sZXQgZ2FtZU92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVPdmVyXCIpO1xuY29uc3QgYXRUYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyc1wiKTtcblxuLy9CdXR0b25zXG5jb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b25cIik7XG5jb25zdCBuZXh0UGxheWVyQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXh0UGxheWVyXCIpO1xuY29uc3QgYmx1ZmZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JsdWZmXCIpO1xuY29uc3Qgc3BvdE9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzcG90T25cIik7XG5jb25zdCBkZWNsYXJlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWNsYXJlXCIpO1xuY29uc3QgbmV4dFJvdW5kQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXh0Um91bmRcIik7XG5jb25zdCBmYWNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFjZScpO1xuY29uc3QgY291bnRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudCcpO1xuY29uc3QgcGFzc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzJyk7XG5jb25zdCBuYW1lSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0TmFtZScpO1xuY29uc3Qgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG5jb25zdCBwbGF5ZXJzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdldFBsYXllcnNcIik7XG5cbi8vSW1hZ2VzXG5cbi8vQnV0dG9uIExpc3RlbmVyc1xuY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSAoKT0+IHtcbiAgICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW3N1Ym1pdCwgcGxheWVyc0lucHV0LCBuYW1lSW5wdXRdLCBbc3RhcnRCdXR0b25dKTtcbiAgICB9KTtcblxuICAgIHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XG4gICAgICAgIGxldCBnYW1lSW5pdGlhbFZhbHVlcyA9IGdldEdhbWVTZXR0aW5ncygpO1xuICAgICAgICBpZihnYW1lSW5pdGlhbFZhbHVlcyAhPT0gZmFsc2Upe1xuICAgICAgICAgICAgZ2FtZShnYW1lSW5pdGlhbFZhbHVlcyk7fWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhbHNlXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBibHVmZkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KHRydWUpO1xuICAgICAgICBlbmRSb3VuZCgpO1xuICAgIH0pO1xuXG4gICAgbmV4dFBsYXllckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgIGNsZWFySW1hZ2VzKGN1cnJlbnRIYW5kRGlzcGxheSk7XG4gICAgICAgIHJlYWR5TmV4dFBsYXllcigpO1xuICAgICAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICB9KTtcblxuICAgIG5leHRSb3VuZEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtuZXh0Um91bmRCdXR0b24sIHRlc3QsIHRlc3QyXSk7XG4gICAgICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICAgICAgZGlzcGxheVJvdW5kKHJlc3VsdCk7XG4gICAgICAgIHN0YXJ0TmV4dFJvdW5kKCk7XG4gICAgICAgIGZpcnN0UGxheWVyKCk7XG4gICAgfSk7XG5cbiAgICBkZWNsYXJlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZihwcm9jZXNzQmV0VmFsaWRpdHkoZmFjZUlucHV0LnZhbHVlLCBjb3VudElucHV0LnZhbHVlKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWNsYXJlYnV0dG9uIHZhbGlkYXRlZFwiKTtcbiAgICAgICAgICAgIGxldCBjaGFsbGVuZ2VycyA9IGdldENoYWxsZW5nZXJzKGZhY2VJbnB1dC52YWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZWQgPSB0YWJsZVswXTtcbiAgICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KCk7XG4gICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgICAgICB9XG4gICAgIH1cbiAgICB9KTtcblxuICAgIHBhc3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbbmV4dFBsYXllckJ1dHRvbl0sIFtwYXNzQnV0dG9uLCBibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzcG90T25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTcG90T24gY2FsbGVkJyk7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGxldCBsb3NlcjtcbiAgICAgICAgaWYoY2hlY2tTcG90T24oKSl7XG4gICAgICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3MgPSBcInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj4gU3BvdCBPbiBUcnVlIC0+ICR7Y2hhbGxlbmdlZC5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gO1xuICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZWQ7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gRmFsc2UtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgICAgIGxvc2VyID0gY2hhbGxlbmdlcjtcbiAgICAgICAgfVxuICAgICAgICByZW1vdmVEaWUobG9zZXIpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChsb3Nlcik7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcmVzdWx0LCBuZXh0Um91bmRCdXR0b25dKTtcbiAgICAgICAgZW5kUm91bmQoKTtcbiAgICB9KTtcblxufTtcblxubGV0IG5hbWVzID0gW1xuICAgIFwiU2hpcmxlZW5cIiwgXCJLYXJhXCIsIFwiQ2xldmVsYW5kXCIsXCJNZXJyaVwiLCBcIkNvbmNlcHRpb25cIiwgXCJIYWxleVwiLCBcIkZsb3JhbmNlXCIsIFwiRG9yaWVcIiwgXCJMdWVsbGFcIiwgXCJWZXJuaWFcIixcbiAgICBcIkZyZWVtYW5cIiwgXCJLYXRoYXJpbmFcIiwgXCJDaGFybWFpblwiLCBcIkdyYWhhbVwiLCBcIkRhcm5lbGxcIiwgXCJCZXJuZXR0YVwiLCBcIkluZWxsXCIsIFwiUGFnZVwiLCBcIkdhcm5ldHRcIiwgXCJBbm5hbGlzYVwiLFxuICAgIFwiQnJhbnRcIiwgXCJWYWxkYVwiLCBcIlZpa2lcIiwgXCJBc3VuY2lvblwiLCBcIk1vaXJhXCIsIFwiS2F5Y2VlXCIsIFwiUmljaGVsbGVcIiwgXCJFbGljaWFcIiwgXCJFbmVpZGFcIiwgXCJFdmVseW5uXCJcbl07XG5cbi8vT0JKRUNUU1xuY2xhc3MgUGxheWVye1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpXG4gICAge1xuICAgICAgICB0aGlzLnBsYXllciA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IGdldFJhbmRvbU5hbWUoKTtcbiAgICAgICAgdGhpcy5oYW5kID0gWzAsMCwwLDBdO1xuICAgICAgICB0aGlzLnJvbGwgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmQgPSB0aGlzLmhhbmQubWFwKFxuICAgICAgICAgICAgICAgICgpID0+IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KSArIDEpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7dGhpcy5uYW1lfSBoYXMgcm9sbGVkYCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkVG9UYWJsZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRhYmxlLnB1c2godGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkT2NjdXJyZW5jZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaGFuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGRpY2VPblRhYmxlSW5kZXhlZEFycmF5W3RoaXMuaGFuZFtpXSAtIDFdICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBudW1iZXJPZkRpZSArPSB0aGlzLmhhbmQubGVuZ3RoO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJldHVyblRydWVJZkFJQ2hhbGxlbmdlcyA9IChmYWNlLCBwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGxldCBwbGF5ZXJOdW0gPSBnZXRGYWNlQ291bnQodGhpcywgZmFjZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgZmFjZTogJHtmYWNlfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHBsYXllck51bWJlcm9mRmFjZTogJHtwbGF5ZXJOdW19YCk7XG4gICAgICAgICAgICBsZXQgcGN0ID0gZGllUmF0aW8ocGxheWVyTnVtKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGByZXR1cm4gcmF0aW86ICR7cGN0fWApO1xuICAgICAgICAgICAgaWYgKHBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICAgICAgcGN0ICs9ICgxLzEyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwY3QgPD0gKDEgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChwY3QgPD0gKDIgLyAxMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC4yXG4gICAgICAgICAgICB9ZWxzZSBpZiAocGN0IDw9ICg0IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC4zXG4gICAgICAgICAgICB9ZWxzZSBpZihwY3QgPD0gKDUgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjVcbiAgICAgICAgICAgIH1lbHNlIGlmKHBjdCA8PSAoNiAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuN1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbn19XG5cbmxldCBnZXRGYWNlQ291bnQgPSAocGxheWVyLCBmYWNlKT0+e1xuICAgIGxldCBhcnIgPSBjb3VudEZhY2VzKHBsYXllci5oYW5kKTtcbiAgICBjb25zb2xlLmxvZyhwbGF5ZXIubmFtZSArIGFycik7XG4gICAgcmV0dXJuIGFycltmYWNlLTFdO1xufTtcblxubGV0IGRpZVJhdGlvID0gKHBsYXllck51bSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTlVtYmVyIGRpZSBvbiB0YWJsZVwiICsgbnVtYmVyT2ZEaWUpO1xuICAgIGNvbnNvbGUubG9nKFwiQkZPIGFyclwiICsgYmV0Q291bnQpO1xuICAgIHJldHVybiAoYmV0Q291bnQtcGxheWVyTnVtKS9udW1iZXJPZkRpZTtcbn07XG5cbi8vTWFpbiBWYXJpYWJsZXNcbmxldCB0YWJsZSA9IFtdO1xubGV0IFBsYXllck51bWJlcjtcbmxldCBjdXJyZW50SGFuZDtcbmxldCBjdXJyZW50UGxheWVyO1xubGV0IGxhc3RCZXQgPSBbMCwgMF07XG5sZXQgYmV0Q291bnQgPSAwO1xubGV0IGRpY2VPblRhYmxlSW5kZXhlZEFycmF5ID0gWzAsMCwwLDAsMCwwXTtcbmxldCBudW1iZXJPZkRpZSA9IDA7XG5sZXQgY2hhbGxlbmdlcjtcbmxldCBjaGFsbGVuZ2VkO1xuXG4vL2dlbmVyaWMgZnVuY3Rpb25zXG5cblxuXG5cblxuLy8jIyMjIyMjIyMjIyMjR2FtZSBGdW5jdGlvbnMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IHN0YXJ0R2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgY3JlYXRlSHVtYW5QbGF5ZXIoaW5pdGlhbFZhbHVlcyk7XG4gICAgY3JlYXRlQWlQbGF5ZXJzKGluaXRpYWxWYWx1ZXNbMV0pO1xuICAgIGlmICh0YWJsZVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhYmxlWzBdLnBsYXllciA9IHRydWU7fVxufTtcblxuY29uc3QgY3JlYXRlSHVtYW5QbGF5ZXIgPSAoaW5pdGlhbFZhbHVlcyk9PntcbiAgICBsZXQgaHVtYW4gPSBuZXcgUGxheWVyKGluaXRpYWxWYWx1ZXNbMF0pO1xuICAgIGh1bWFuLmFkZFRvVGFibGUodGFibGUpO1xufTtcblxuY29uc3QgZ2V0R2FtZVNldHRpbmdzID0gKCk9PntcbiAgICBsZXQgbmFtZSA9IG5hbWVJbnB1dC52YWx1ZTtcbiAgICBpZiAoMTAgPiBwbGF5ZXJzSW5wdXQudmFsdWUgPiAwKXtcbiAgICAgICAgbGV0IG51bVBsYXllcnMgPSBwbGF5ZXJzSW5wdXQudmFsdWU7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbc3VibWl0LCBwbGF5ZXJzSW5wdXQsIG5hbWVJbnB1dF0pO1xuICAgICAgICByZXR1cm4gKFtuYW1lLCBudW1QbGF5ZXJzXSk7XG4gICAgfXJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJhbmRvbU5hbWUgPSAoKT0+IHtcbiAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihuYW1lcy5sZW5ndGgpKTtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpbmRleF07XG4gICAgICAgIG5hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xufTtcblxuY29uc3QgY3JlYXRlQWlQbGF5ZXJzID0gKG51bSk9PntcbiAgICBmb3IgKGxldCBpID0wOyBpIDxudW07IGkrKyl7XG4gICAgICAgIGxldCB4ID0gbmV3IFBsYXllcigpO1xuICAgICAgICB4LmFkZFRvVGFibGUoKTtcbiAgICB9XG59O1xuXG4vL1BsYXllciBzZXQgdXBcbmNvbnN0IHNldFVwTmV4dFBsYXllciA9ICgpID0+IHtcbiAgIGdldE5leHRQbGF5ZXIoKTtcbiAgIGRpc3BsYXlFbGVtZW50cyhbY3VycmVudFBsYXllckRpc3BsYXksIGN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxheWVyID09PSB0cnVlKSB7XG4gICAgICBzZXRVcEh1bWFuVHVybigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgc2V0VXBBaVR1cm4oKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRVcEh1bWFuVHVybiA9ICgpPT57XG4gICAgdGVzdDIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgY3VycmVudEhhbmREaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+IFlvdXIgSGFuZCBpczogPC9oMT5gO1xuICAgIGN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9PC9oMT5gO1xuICAgIGRpc3BsYXlMYXN0QmV0KGxhc3RCZXQsIHRlc3QpO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKGN1cnJlbnRIYW5kRGlzcGxheSwgY29udmVydFRvRGljZUltYWdlcyhjdXJyZW50SGFuZCkpO1xuICAgIGRpc3BsYXlBbmRIaWRlKFtkZWNsYXJlRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgaW5wdXRzXSwgW3Nwb3RPbkJ1dHRvbiwgYmx1ZmZCdXR0b24sIGJldERpc3BsYXksIGZhY2VEaXNwbGF5XSk7XG59O1xuXG5cbmNvbnN0IHNldFVwQWlUdXJuID0gKCk9PntcbiAgICBkaXNwbGF5QW5kSGlkZShbc3BvdE9uQnV0dG9uLCBibHVmZkJ1dHRvbiwgcGFzc0J1dHRvbiwgcmVzdWx0LCB0ZXN0XSwgW2N1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgIHJlc3VsdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9IGlzIHBsYXlpbmc8L2gxPmA7XG4gICAgdGVzdC5pbm5lckhUTUwgPSBgWW91ciBoYW5kIGlzOmA7XG4gICAgZGlzcGxheURpY2VJbWFnZXModGVzdCwgY29udmVydFRvRGljZUltYWdlcyh0YWJsZVswXS5oYW5kKSk7XG4gICAgbGFzdEJldCA9IGFpUGxheXMoKTtcbiAgICBydW5BaUFnYWluc3RBaSgpO1xufTtcblxuY29uc3QgcnVuQWlBZ2FpbnN0QWkgPSAoKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IGdldENoYWxsZW5nZXJzKGxhc3RCZXRbMF0sIGZhbHNlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsbGVuZ2Vycyk7XG4gICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uLCBwYXNzQnV0dG9uXSk7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSk7XG4gICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCgpO1xuICAgIH1lbHNle1xuICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKGZhbHNlKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXROZXh0UGxheWVyID0gKCk9PntcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBjdXJyZW50SGFuZCA9IGN1cnJlbnRQbGF5ZXIuaGFuZDtcbn07XG5cbmNvbnN0IGZpcnN0UGxheWVyID0gKCkgPT4ge1xuICAgIHNldFVwTmV4dFBsYXllcigpO1xuICAgIFBsYXllck51bWJlciArPSAxO1xuICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xufTtcblxuY29uc3QgcmVhZHlOZXh0UGxheWVyID0gKCkgPT4ge1xuICAgIHNldFVwTmV4dFBsYXllcigpO1xuICAgIFBsYXllck51bWJlciArPSAxO1xufTtcblxuY29uc3QgcmV0dXJuTmV3UGxheWVyTnVtYmVyID0gKCkgPT4ge1xuICAgIGlmIChQbGF5ZXJOdW1iZXIgPj0gdGFibGUubGVuZ3RoIHx8IFBsYXllck51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFBsYXllck51bWJlciA9IDA7XG4gICAgfSBlbHNlIGlmIChQbGF5ZXJOdW1iZXIgPCAwKSB7XG4gICAgICAgIFBsYXllck51bWJlciA9IHRhYmxlLmxlbmd0aCAtIDE7XG4gICAgfVxufTtcblxuLy9ORVcgUk9VTkRcbmNvbnN0IHN0YXJ0TmV4dFJvdW5kID0gKCkgPT4ge1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGFibGUubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgdGFibGVbeF0ucm9sbCgpO1xuICAgICAgICB0YWJsZVt4XS5hZGRPY2N1cnJlbmNlcygpO1xuICAgIH1cbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBkaXNwbGF5UGxheWVycyhhdFRhYmxlLCB0YWJsZSk7XG4gICAgY29uc29sZS5sb2coYHN0YXJ0TmV4dFJvdW5kIGZ1bmN0aW9uIGV4aXRlZGApO1xuXG59O1xuXG5cbmNvbnN0IGVuZFJvdW5kID0gKCkgPT4ge1xuICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICB0ZXN0LmlubmVySFRNTCA9IFwiUk9VTkQgT1ZFUlwiO1xuICAgIFBsYXllck51bWJlciAtPSAxO1xufTtcblxuY29uc3QgcmVzZXRSb3VuZFZhcmlhYmxlcyA9ICgpID0+IHtcbiAgICBsYXN0QmV0ID0gWzAsMF07XG4gICAgYmV0Q291bnQgPSAwO1xuICAgIG51bWJlck9mRGllID0gMDtcbiAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheT1bMCwwLDAsMCwwLDBdO1xuICAgIGhpZGVFbGVtZW50cyhbcGFzc0J1dHRvbiwgYmx1ZmZCdXR0b24sIHNwb3RPbkJ1dHRvbiwgbmV4dFBsYXllckJ1dHRvbl0pO1xufTtcblxuXG4vL0dBTUUgUExBWSBGVU5DVElPTlNcbmNvbnN0IGdldEJldFRydXRoID0gKCkgPT4ge1xuICAgIGxldCBmYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgY291bnQgPSBsYXN0QmV0WzFdO1xuICAgIGNvbnNvbGUubG9nKGRpY2VPblRhYmxlSW5kZXhlZEFycmF5KTtcbiAgICByZXR1cm4gZGljZU9uVGFibGVJbmRleGVkQXJyYXlbZmFjZSAtIDFdID49IGNvdW50O1xufTtcblxuY29uc3QgcHJvY2Vzc0JldFZhbGlkaXR5ID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgbGV0IGJldCA9IGdldEJldElmVmFsaWQoZmFjZSwgY291bnQpO1xuICAgIGlmIChiZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIGxhc3RCZXQgPSBiZXQ7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtmYWNlRGlzcGxheV0sIFtkZWNsYXJlRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgaW5wdXRzXSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRlc3QyLmlubmVySFRNTCA9IGA8cCBjbGFzcz1cImRpc3BsYXktNSB0ZXh0LWluZm9cIj5Ob3QgVmFsaWQgSW5wdXQ8L3A+YDtcbiAgICB9XG59O1xuXG5cbmNvbnN0IGdldEJldElmVmFsaWQgPSAoZmFjZSwgY291bnQpID0+IHtcbiAgICBmYWNlID0gcGFyc2VJbnQoZmFjZSk7XG4gICAgY291bnQgPSBwYXJzZUludChjb3VudCk7XG4gICAgbGV0IGxhc3RGYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgbGFzdENvdW50ID0gbGFzdEJldFsxXTtcbiAgICBjb25zb2xlLmxvZyhgbGFzdEZhY2UgPSAke2xhc3RCZXRbMF19LCBsYXN0Q291bnQgPSAke2xhc3RCZXRbMV19IGZhY2U9JHtmYWNlfSwgY291bnQ9JHtjb3VudH1gKTtcbiAgICBpZiAoXG4gICAgICAgICggICAoKGZhY2UgPiBsYXN0RmFjZSkgJiYgKGNvdW50ID09PSBsYXN0Q291bnQpKSAmJlxuICAgICAgICAgICAgKChjb3VudCA+IDApICYmICg3ID4gZmFjZSA+IDApKVxuICAgICAgICApXG5cbiAgICAgICAgfHxcblxuICAgICAgICAoKGNvdW50ID4gbGFzdENvdW50KSAmJiAoKGNvdW50ID4gMCkgJiYgKDcgPiBmYWNlICYmIGZhY2UgPiAwKSkpXG4gICAgKSB7XG4gICAgICAgIGJldENvdW50ID0gY291bnQ7XG4gICAgICAgIHJldHVybiBbZmFjZSwgY291bnRdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBnZXRDaGFsbGVuZ2VycyA9IChmYWNlLCBwbGF5ZXIpPT57XG4gICAgbGV0IGNoYWxsZW5nZXJzID0gW107XG4gICAgZm9yIChsZXQgaT0xOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspe1xuICAgICAgICBpZih0YWJsZVtpXS5yZXR1cm5UcnVlSWZBSUNoYWxsZW5nZXMoZmFjZSwgcGxheWVyKSl7XG4gICAgICAgICAgICBpZiAodGFibGVbaV0gIT09IGN1cnJlbnRQbGF5ZXIpe1xuICAgICAgICAgICAgY2hhbGxlbmdlcnMucHVzaCh0YWJsZVtpXSl9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coYFBvc3NpYmxlIENoYWxsZW5nZXJzOiAke2NoYWxsZW5nZXJzfWApO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gLjMpe1xuICAgIHJldHVybiBjaGFsbGVuZ2VycztcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG59O1xuXG5jb25zdCBnZXRPcHBvbmVudCA9IChjaGFsbGVuZ2Vycyk9PntcbiAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLmZsb29yKGNoYWxsZW5nZXJzLmxlbmd0aCkpO1xuXG4gICAgY29uc29sZS5sb2coY2hhbGxlbmdlcnNbaW5kZXhdKTtcbiAgICByZXR1cm4gY2hhbGxlbmdlcnNbaW5kZXhdXG59O1xuXG5jb25zdCBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzID0gKGNoYWxsZW5nZSkgPT57XG4gICAgaWYgKGNoYWxsZW5nZSl7XG4gICAgICAgIGZhY2VEaXNwbGF5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPkNIQUxMRU5HRUQgQlkgJHtjaGFsbGVuZ2VyLm5hbWV9PC9kaXY+YDtcbiAgICB9ZWxzZXtcbiAgICAgICAgZmFjZURpc3BsYXkuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+Tm8gb25lIGNoYWxsZW5nZXM8L2Rpdj5gO1xuICAgIH1cbn07XG5cbmNvbnN0IGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCA9ICgpID0+e1xuICAgIGNvbnNvbGUubG9nKFwiZGV0ZXJtaW5pbmcgY2hhbGxlbmdlc1wiKTtcbiAgICBkaXNwbGF5QW5kSGlkZShbbmV4dFJvdW5kQnV0dG9uLCByZXN1bHRdLCBbbmV4dFBsYXllckJ1dHRvbl0pO1xuICAgIGhhbmRsZUNoYWxsZW5nZUNoZWNrKGdldEJldFRydXRoKCkpO1xuXG59O1xuXG5jb25zdCBoYW5kbGVDaGFsbGVuZ2VDaGVjayA9IChiZXRCb29sZWFuKT0+e1xuICAgIGNvbnNvbGUubG9nKFwiaGFuZGxlIGNoYWxsZW5nZSBmdW5jdGlvbiBjYWxsZWRcIik7XG4gICAgaWYoYmV0Qm9vbGVhbil7XG4gICAgICAgIGxldCBjb2xvciA9IGdldE1lc3NhZ2VDb2xvcihjaGFsbGVuZ2VyLGNoYWxsZW5nZWQpO1xuICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3MgPSBcIiR7Y29sb3J9IGRpc3BsYXktNFwiPiBDaGFsbGVuZ2UgRmFpbGVkIC0+ICR7Y2hhbGxlbmdlci5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gO1xuICAgICAgICByZW1vdmVEaWUoY2hhbGxlbmdlcik7XG4gICAgICAgIGNoZWNrSWZFbGltaW5hdGVkKGNoYWxsZW5nZXIpO1xufWVsc2V7XG4gICAgICAgIGxldCBjb2xvciA9IGdldE1lc3NhZ2VDb2xvcihjaGFsbGVuZ2VkLCBjaGFsbGVuZ2VyKTtcbiAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCIke2NvbG9yfSBkaXNwbGF5LTRcIj4gQ2hhbGxlbmdlIFN1Y2NlZWRlZCAtPiAke2NoYWxsZW5nZWQubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgcmVtb3ZlRGllKGNoYWxsZW5nZWQpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChjaGFsbGVuZ2VkKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRNZXNzYWdlQ29sb3IgPSAobG9zZXIsIHdpbm5lcikgPT57XG4gICAgaWYgKGxvc2VyLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIHJldHVybiBcInRleHQtZGFuZ2VyXCI7XG4gICAgfWVsc2UgaWYod2lubmVyLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIHJldHVybiBcInRleHQtc3VjY2Vzc1wiO1xuICAgIH1yZXR1cm4gXCJcIlxuXG59O1xuXG5jb25zdCBjaGVja1Nwb3RPbiA9ICgpID0+e1xuICAgIHJldHVybiAoZGljZU9uVGFibGVJbmRleGVkQXJyYXlbbGFzdEJldFswXSAtMV0gPT09IGxhc3RCZXRbMV0pXG59O1xuXG5jb25zdCBjaGVja0lmRWxpbWluYXRlZCA9IChiZXRMb3Nlcik9PntcbiAgICBpZiAocmV0dXJuSWZMYXN0RGllKGJldExvc2VyKSl7XG4gICAgICAgIGhhbmRsZUxhc3REaWVMb3N0KGJldExvc2VyKTtcbiAgICAgICAgY2hlY2tGb3JXaW5uZXIoKTtcbiAgICB9XG59O1xuXG5jb25zdCByZW1vdmVEaWUgPSAocGxheWVyKSA9PntcbiAgICBwbGF5ZXIuaGFuZCAgPSBwbGF5ZXIuaGFuZC5zcGxpY2UoMSk7XG59O1xuXG4vL0NvbXB1dGVyIGJldHNcbmNvbnN0IGFpUGxheXMgPSAoKT0+IHtcbiAgICBsZXQgbmV3QmV0ID0gcGxheWVyQmV0KCk7XG4gICAgYmV0Q291bnQgPSBuZXdCZXRbMV07XG4gICAgZGlzcGxheUVsZW1lbnRzKFtiZXREaXNwbGF5XSk7XG4gICAgYmV0RGlzcGxheS5pbm5lckhUTUwgPSBgPHAgY2xhc3M9XCJkaXNwbGF5LTRcIj4ke2N1cnJlbnRQbGF5ZXIubmFtZX0gYmV0cyB0aGVyZSBhcmUgPGJyPiAke25ld0JldFsxXX0gPHNwYW4gaWQ9XCJkaWNlXCI+IDwvc3Bhbj5zIG9uIHRoZSB0YWJsZTwvcD5gO1xuICAgIGxldCBkaWVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaWNlXCIpO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKGRpZURpc3BsYXksIGNvbnZlcnRUb0RpY2VJbWFnZXMoW25ld0JldFswXV0pKTtcbiAgICByZXR1cm4gbmV3QmV0O1xufTtcblxuY29uc3QgY291bnRGYWNlcyA9IChoYW5kKSA9PntcbiAgICBsZXQgY3VycmVudEhhbmRJbnRzID0gWzAsIDAsIDAsIDAsIDAsIDBdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjdXJyZW50SGFuZEludHNbaGFuZFtpXSAtIDFdICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50SGFuZEludHM7XG59O1xuY29uc3QgcGxheWVyQmV0ID0gKCkgPT4ge1xuICAgIGxldCBjdXJyZW50SGFuZEludHMgPSBjb3VudEZhY2VzKGN1cnJlbnRIYW5kKTtcbiAgICBsZXQgbGFyZ2VzdENvdW50ID0gTWF0aC5tYXgoLi4uY3VycmVudEhhbmRJbnRzKTtcbiAgICBsZXQgYmVzdEhhbmQgPSBbY3VycmVudEhhbmRJbnRzLmluZGV4T2YobGFyZ2VzdENvdW50KSsxLCBsYXJnZXN0Q291bnRdO1xuICAgIHJldHVybiBhaUJsdWZmKGJlc3RIYW5kKTtcbn07XG5cbmNvbnN0IGFpQmx1ZmYgPSAoYmVzdEhhbmQpPT57XG4gICAgd2hpbGUgKGFpQ2hlY2tDdXJyZW50SGFuZFZhbGlkaXR5KGJlc3RIYW5kKSAhPT0gdHJ1ZSl7XG4gICAgICAgIGJlc3RIYW5kWzFdICs9IDE7XG4gICAgfVxuICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgLjMpe1xuICAgICAgICBiZXN0SGFuZFsxXSArPSAxO1xuICAgICAgICByZXR1cm4gYmVzdEhhbmQ7XG4gICAgfWVsc2V7XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgLjEpe1xuICAgICAgICAgICAgYmVzdEhhbmRbMV0gKz0gMjtcbiAgICAgICAgICAgIHJldHVybiBiZXN0SGFuZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmVzdEhhbmRcbn07XG5cbmNvbnN0IGFpQ2hlY2tDdXJyZW50SGFuZFZhbGlkaXR5ID0gaGFuZCA9PiB7XG4gICAgcmV0dXJuICgoaGFuZFswXSA+IGxhc3RCZXRbMF0gICYmIGhhbmRbMV0gPj0gbGFzdEJldFsxXSkgfHwgaGFuZFsxXSA+IGxhc3RCZXRbMV0pXG59O1xuXG5jb25zdCByZXR1cm5JZkxhc3REaWUgPSBwbGF5ZXIgPT4ge1xuICAgIHJldHVybiBwbGF5ZXIuaGFuZC5sZW5ndGggPT09IDA7XG59O1xuXG5jb25zdCBoYW5kbGVMYXN0RGllTG9zdCA9IHBsYXllciA9PntcbiAgICBjb25zb2xlLmxvZyhgSGFuZGxpbmcgbGFzdCBkaWNlIG9mICR7cGxheWVyLm5hbWV9YCk7XG4gICAgbGV0IGluZGV4ID0gdGFibGUuaW5kZXhPZihwbGF5ZXIpO1xuICAgIGNvbnNvbGUubG9nKGluZGV4KTtcbiAgICBjb25zb2xlLmxvZyh0YWJsZVtpbmRleF0pO1xuICAgIGlmICh0YWJsZVtpbmRleF0ucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtnYW1lT3Zlcl0pO1xuICAgICAgICBnYW1lT3Zlci5pbm5lckhUTUw9XCJZT1UgTE9TRVwiXG4gICAgfWVsc2V7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbdGVzdDJdKTtcbiAgICAgICAgdGVzdDIuaW5uZXJIVE1MID0gYDxoMSBjbGFzcz1cInRleHQtd2FybmluZ1wiPiR7cGxheWVyLm5hbWV9IGhhcyBiZWVuIGVsaW1pbmF0ZWQ8L2gxPmA7XG4gICAgICAgIHRhYmxlLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRhYmxlKTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yV2lubmVyID0gKCk9PntcbiAgICBpZiAodGFibGUubGVuZ3RoID09PSAxKXtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjR0FNRSBPVkVSIyMjIyMjIyMjIyMnKTtcbiAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IFwiWU9VIFdJTlwiO1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW2dhbWVPdmVyXSk7XG4gICAgfVxufTtcblxuLy9HYW1lIFN0YXJ0IEZ1bmN0aW9uc1xubGV0IGNsZWFuQm9hcmQgPSAoKSA9PiBoaWRlRWxlbWVudHMoW3N1Ym1pdCwgbmFtZUlucHV0LCBwbGF5ZXJzSW5wdXQsIGJsdWZmQnV0dG9uLHNwb3RPbkJ1dHRvbixwYXNzQnV0dG9uLG5leHRSb3VuZEJ1dHRvbixuZXh0UGxheWVyQnV0dG9uLGZhY2VEaXNwbGF5LHBsYXllck9wdGlvbnNEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBkZWNsYXJlRGlzcGxheSwgaW5wdXRzLCByZXN1bHQsIGJldERpc3BsYXksIGdhbWVPdmVyXSk7XG5sZXQgZ2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgc3RhcnRHYW1lKGluaXRpYWxWYWx1ZXMpO1xuICAgIHN0YXJ0TmV4dFJvdW5kKCk7XG4gICAgZmlyc3RQbGF5ZXIoKTtcbn07XG5jbGVhbkJvYXJkKCk7XG5ldmVudExpc3RlbmVycygpO1xuXG4iLCIvL0RJQ0UgSU1BR0VTXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5jb25zdCBkaWUxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTEuc3JjPVwiaW1hZ2VzL2RpZTEucG5nXCI7XG5cbmNvbnN0IGRpZTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMi5zcmM9XCJpbWFnZXMvZGllMi5wbmdcIjtcblxuY29uc3QgZGllMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWUzLnNyYz1cImltYWdlcy9kaWUzLnBuZ1wiO1xuXG5jb25zdCBkaWU0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTQuc3JjPVwiaW1hZ2VzL2RpZTQucG5nXCI7XG5cbmNvbnN0IGRpZTUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNS5zcmM9XCJpbWFnZXMvZGllNS5wbmdcIjtcblxuY29uc3QgZGllNiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU2LnNyYz1cImltYWdlcy9kaWU2LnBuZ1wiO1xuXG5jb25zdCBkaWNlSW1hZ2VzID0gW2RpZTEsIGRpZTIsIGRpZTMsIGRpZTQsIGRpZTUsIGRpZTZdO1xuXG4vL0dlbmVyaWMgRGlzcGxheSBGdW5jdGlvbnNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY29uc3QgZGlzcGxheUVsZW1lbnRzID0gKGFycmF5KT0+IHtcbiAgICBmb3IgKGxldCBlbGVtZW50ID0gMDsgZWxlbWVudCA8IGFycmF5Lmxlbmd0aDsgZWxlbWVudCsrKXtcbiAgICAgICAgYXJyYXlbZWxlbWVudF0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7fVxufTtcblxuY29uc3QgaGlkZUVsZW1lbnRzID0gKGFycmF5KT0+IHtcbiAgICBmb3IgKGxldCBlbGVtZW50ID0gMDsgZWxlbWVudCA8IGFycmF5Lmxlbmd0aDsgZWxlbWVudCsrKXtcbiAgICAgICAgYXJyYXlbZWxlbWVudF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG59O1xuXG5jb25zdCBkaXNwbGF5QW5kSGlkZSA9IChhcnJheUFkZCwgYXJyYXlEZWxldGUpPT57XG4gICAgZGlzcGxheUVsZW1lbnRzKGFycmF5QWRkKTtcbiAgICBoaWRlRWxlbWVudHMoYXJyYXlEZWxldGUpO1xufTtcblxuLy9EaWNlIEltYWdlIEZ1bmN0aW9uc1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jb25zdCBjb252ZXJ0VG9EaWNlSW1hZ2VzID0gaGFuZCA9PntcbiAgICBsZXQgaW1nSGFuZCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZC5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGxldCBmYWNlID0gaGFuZFtpXTtcbiAgICAgICAgbGV0IGRpY2VJbWFnZSA9IGRpY2VJbWFnZXNbZmFjZS0xXS5jbG9uZU5vZGUoKTtcbiAgICAgICAgaW1nSGFuZC5wdXNoKGRpY2VJbWFnZSk7XG4gICAgfVxuICAgIHJldHVybiBpbWdIYW5kO1xufTtcblxuY29uc3QgZGlzcGxheURpY2VJbWFnZXMgPSAocGFyZW50Tm9kZSwgaGFuZEltYWdlcykgPT57XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kSW1hZ2VzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChoYW5kSW1hZ2VzW2ldKTtcbiAgICB9XG59O1xuXG5jb25zdCBjbGVhckltYWdlcyA9IHBhcmVudE5vZGUgPT57XG4gICAgd2hpbGUgKHBhcmVudE5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxuXG5cbmNvbnN0IGRpc3BsYXlQbGF5ZXJzID0gKGVsZW1lbnQsIHRhYmxlKT0+e1xuICAgIGxldCBodG1sID0gYDxoMz5QTGF5ZXJzPC9oMz5gO1xuICAgIGZvciAobGV0IGkgPTA7IGk8dGFibGUubGVuZ3RoOyBpKyspe1xuICAgICAgICBodG1sICs9IGAke3RhYmxlW2ldLm5hbWV9IC0gRGljZSBMZWZ0OiAke3RhYmxlW2ldLmhhbmQubGVuZ3RofSA8YnI+YFxuICAgIH1cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5jb25zdCBkaXNwbGF5TGFzdEJldCA9IChsYXN0QmV0LCBlbGVtZW50KT0+IHtcbiAgICBpZiAobGFzdEJldFswXSAhPT0gMCkge1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGA8aDM+TGFzdCBCZXQ6ICR7bGFzdEJldFsxXX0gPC9oMz5gO1xuICAgICAgICBkaXNwbGF5RGljZUltYWdlcyhlbGVtZW50LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKFtsYXN0QmV0WzBdXSkpXG4gICAgfVxufTtcblxuY29uc3QgZGlzcGxheVJvdW5kID0gKHJlc3VsdCkgPT4ge1xuICAgIGhpZGVFbGVtZW50cyhbcmVzdWx0XSk7XG59O1xuXG5cblxuLy8gRVhQT1JUU1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZGlzcGxheUVsZW1lbnRzIDogZGlzcGxheUVsZW1lbnRzLFxuICAgIGhpZGVFbGVtZW50cyA6IGhpZGVFbGVtZW50cyxcbiAgICBkaXNwbGF5QW5kSGlkZSA6IGRpc3BsYXlBbmRIaWRlLFxuICAgIGNvbnZlcnRUb0RpY2VJbWFnZXMgOiBjb252ZXJ0VG9EaWNlSW1hZ2VzLFxuICAgIGNsZWFySW1hZ2VzIDogY2xlYXJJbWFnZXMsXG4gICAgZGlzcGxheURpY2VJbWFnZXM6IGRpc3BsYXlEaWNlSW1hZ2VzLFxuICAgIGRpc3BsYXlQbGF5ZXJzIDogZGlzcGxheVBsYXllcnMsXG4gICAgZGlzcGxheUxhc3RCZXQgOiBkaXNwbGF5TGFzdEJldCxcbiAgICBkaXNwbGF5Um91bmQgOiBkaXNwbGF5Um91bmQsXG5cbn07XG5cblxuXG4iXX0=
