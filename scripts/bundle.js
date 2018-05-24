(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//########### IMPORTS ##########
const display = require('./display.js');
const {displayElements} = display;
const {hideElements} = display;
const {displayAndHide} = display;
const {convertToDiceImages} = display;
const {displayDiceImages} = display;
const {clearImages} = display;


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
        displayRound();
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
    displayLastBet();
    displayDiceImages(currentHandDisplay, convertToDiceImages(currentHand));
    displayAndHide([declareDisplay, declareButton, inputs], [spotOnButton, bluffButton, betDisplay, faceDisplay]);
};

const displayLastBet = ()=> {
    if (lastBet[0] !== 0) {
        test.innerHTML = `<h3>Last Bet: ${lastBet[1]} </h3>`;
        displayDiceImages(test, convertToDiceImages([lastBet[0]]))
    }
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
    displayPlayers();
    console.log(`startNextRound function exited`);

};

const displayPlayers = ()=>{
    let html = `<h3>PLayers</h3>`;
    for (let i =0; i<table.length; i++){
        html += `${table[i].name} - Dice Left: ${table[i].hand.length} <br>`
    }
    atTable.innerHTML = html;
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

const displayRound = () => {
    hideElements([result]);
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









// EXPORTS
//####################
module.exports = {
    displayElements : displayElements,
    hideElements : hideElements,
    displayAndHide : displayAndHide,
    convertToDiceImages : convertToDiceImages,
    clearImages : clearImages,
    displayDiceImages: displayDiceImages

};




},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9kaXNwbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIyMjIyMjIyMjIyMgSU1QT1JUUyAjIyMjIyMjIyMjXG5jb25zdCBkaXNwbGF5ID0gcmVxdWlyZSgnLi9kaXNwbGF5LmpzJyk7XG5jb25zdCB7ZGlzcGxheUVsZW1lbnRzfSA9IGRpc3BsYXk7XG5jb25zdCB7aGlkZUVsZW1lbnRzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheUFuZEhpZGV9ID0gZGlzcGxheTtcbmNvbnN0IHtjb252ZXJ0VG9EaWNlSW1hZ2VzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheURpY2VJbWFnZXN9ID0gZGlzcGxheTtcbmNvbnN0IHtjbGVhckltYWdlc30gPSBkaXNwbGF5O1xuXG5cbi8vIyMjIyMjIyMjIyNEb2N1bWVudCBidXR0b25zIGFuZCBkaXNwbGF5cyMjIyMjIyMjIyMjIyMjXG4vL2Rpc3BsYXlzXG5sZXQgY3VycmVudEhhbmREaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjdXJyZW50SGFuZFwiKTtcbmxldCBjdXJyZW50UGxheWVyRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyRGlzcGxheVwiKTtcbmxldCBwbGF5ZXJPcHRpb25zRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyT3B0aW9uc1wiKTtcbmxldCB0ZXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXN0XCIpO1xubGV0IHRlc3QyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXN0MlwiKTtcbmxldCBkZWNsYXJlRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZURpc3BsYXlcIik7XG5sZXQgZmFjZURpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZhY2VEaXNwbGF5XCIpO1xubGV0IHJlc3VsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdWx0XCIpO1xubGV0IGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5wdXRzXCIpO1xubGV0IGJldERpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JldERpc3BsYXlcIik7XG5sZXQgZ2FtZU92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVPdmVyXCIpO1xuY29uc3QgYXRUYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyc1wiKTtcblxuLy9CdXR0b25zXG5jb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b25cIik7XG5jb25zdCBuZXh0UGxheWVyQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXh0UGxheWVyXCIpO1xuY29uc3QgYmx1ZmZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2JsdWZmXCIpO1xuY29uc3Qgc3BvdE9uQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzcG90T25cIik7XG5jb25zdCBkZWNsYXJlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWNsYXJlXCIpO1xuY29uc3QgbmV4dFJvdW5kQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXh0Um91bmRcIik7XG5jb25zdCBmYWNlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFjZScpO1xuY29uc3QgY291bnRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudCcpO1xuY29uc3QgcGFzc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzJyk7XG5jb25zdCBuYW1lSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0TmFtZScpO1xuY29uc3Qgc3VibWl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRcIik7XG5jb25zdCBwbGF5ZXJzSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdldFBsYXllcnNcIik7XG5cbi8vSW1hZ2VzXG5cbi8vQnV0dG9uIExpc3RlbmVyc1xuY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSAoKT0+IHtcbiAgICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW3N1Ym1pdCwgcGxheWVyc0lucHV0LCBuYW1lSW5wdXRdLCBbc3RhcnRCdXR0b25dKTtcbiAgICB9KTtcblxuICAgIHN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XG4gICAgICAgIGxldCBnYW1lSW5pdGlhbFZhbHVlcyA9IGdldEdhbWVTZXR0aW5ncygpO1xuICAgICAgICBpZihnYW1lSW5pdGlhbFZhbHVlcyAhPT0gZmFsc2Upe1xuICAgICAgICAgICAgZ2FtZShnYW1lSW5pdGlhbFZhbHVlcyk7fWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhbHNlXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBibHVmZkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KHRydWUpO1xuICAgICAgICBlbmRSb3VuZCgpO1xuICAgIH0pO1xuXG4gICAgbmV4dFBsYXllckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgIGNsZWFySW1hZ2VzKGN1cnJlbnRIYW5kRGlzcGxheSk7XG4gICAgICAgIHJlYWR5TmV4dFBsYXllcigpO1xuICAgICAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICB9KTtcblxuICAgIG5leHRSb3VuZEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtuZXh0Um91bmRCdXR0b24sIHRlc3QsIHRlc3QyXSk7XG4gICAgICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICAgICAgZGlzcGxheVJvdW5kKCk7XG4gICAgICAgIHN0YXJ0TmV4dFJvdW5kKCk7XG4gICAgICAgIGZpcnN0UGxheWVyKCk7XG4gICAgfSk7XG5cbiAgICBkZWNsYXJlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZihwcm9jZXNzQmV0VmFsaWRpdHkoZmFjZUlucHV0LnZhbHVlLCBjb3VudElucHV0LnZhbHVlKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWNsYXJlYnV0dG9uIHZhbGlkYXRlZFwiKTtcbiAgICAgICAgICAgIGxldCBjaGFsbGVuZ2VycyA9IGdldENoYWxsZW5nZXJzKGZhY2VJbnB1dC52YWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZWQgPSB0YWJsZVswXTtcbiAgICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgZGV0ZXJtaW5lQ2hhbGxlbmdlUmVzdWx0KCk7XG4gICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgICAgICB9XG4gICAgIH1cbiAgICB9KTtcblxuICAgIHBhc3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbbmV4dFBsYXllckJ1dHRvbl0sIFtwYXNzQnV0dG9uLCBibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzcG90T25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTcG90T24gY2FsbGVkJyk7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGxldCBsb3NlcjtcbiAgICAgICAgaWYoY2hlY2tTcG90T24oKSl7XG4gICAgICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3MgPSBcInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj4gU3BvdCBPbiBUcnVlIC0+ICR7Y2hhbGxlbmdlZC5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gO1xuICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZWQ7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gRmFsc2UtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgICAgIGxvc2VyID0gY2hhbGxlbmdlcjtcbiAgICAgICAgfVxuICAgICAgICByZW1vdmVEaWUobG9zZXIpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChsb3Nlcik7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbcmVzdWx0LCBuZXh0Um91bmRCdXR0b25dKTtcbiAgICAgICAgZW5kUm91bmQoKTtcbiAgICB9KTtcblxufTtcblxubGV0IG5hbWVzID0gW1xuICAgIFwiU2hpcmxlZW5cIiwgXCJLYXJhXCIsIFwiQ2xldmVsYW5kXCIsXCJNZXJyaVwiLCBcIkNvbmNlcHRpb25cIiwgXCJIYWxleVwiLCBcIkZsb3JhbmNlXCIsIFwiRG9yaWVcIiwgXCJMdWVsbGFcIiwgXCJWZXJuaWFcIixcbiAgICBcIkZyZWVtYW5cIiwgXCJLYXRoYXJpbmFcIiwgXCJDaGFybWFpblwiLCBcIkdyYWhhbVwiLCBcIkRhcm5lbGxcIiwgXCJCZXJuZXR0YVwiLCBcIkluZWxsXCIsIFwiUGFnZVwiLCBcIkdhcm5ldHRcIiwgXCJBbm5hbGlzYVwiLFxuICAgIFwiQnJhbnRcIiwgXCJWYWxkYVwiLCBcIlZpa2lcIiwgXCJBc3VuY2lvblwiLCBcIk1vaXJhXCIsIFwiS2F5Y2VlXCIsIFwiUmljaGVsbGVcIiwgXCJFbGljaWFcIiwgXCJFbmVpZGFcIiwgXCJFdmVseW5uXCJcbl07XG5cbi8vT0JKRUNUU1xuY2xhc3MgUGxheWVye1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpXG4gICAge1xuICAgICAgICB0aGlzLnBsYXllciA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IGdldFJhbmRvbU5hbWUoKTtcbiAgICAgICAgdGhpcy5oYW5kID0gWzAsMCwwLDBdO1xuICAgICAgICB0aGlzLnJvbGwgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmQgPSB0aGlzLmhhbmQubWFwKFxuICAgICAgICAgICAgICAgICgpID0+IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KSArIDEpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7dGhpcy5uYW1lfSBoYXMgcm9sbGVkYCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkVG9UYWJsZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRhYmxlLnB1c2godGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkT2NjdXJyZW5jZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaGFuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGRpY2VPblRhYmxlSW5kZXhlZEFycmF5W3RoaXMuaGFuZFtpXSAtIDFdICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBudW1iZXJPZkRpZSArPSB0aGlzLmhhbmQubGVuZ3RoO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJldHVyblRydWVJZkFJQ2hhbGxlbmdlcyA9IChmYWNlLCBwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGxldCBwbGF5ZXJOdW0gPSBnZXRGYWNlQ291bnQodGhpcywgZmFjZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgZmFjZTogJHtmYWNlfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHBsYXllck51bWJlcm9mRmFjZTogJHtwbGF5ZXJOdW19YCk7XG4gICAgICAgICAgICBsZXQgcGN0ID0gZGllUmF0aW8ocGxheWVyTnVtKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGByZXR1cm4gcmF0aW86ICR7cGN0fWApO1xuICAgICAgICAgICAgaWYgKHBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICAgICAgcGN0ICs9ICgxLzEyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwY3QgPD0gKDEgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChwY3QgPD0gKDIgLyAxMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC4yXG4gICAgICAgICAgICB9ZWxzZSBpZiAocGN0IDw9ICg0IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC4zXG4gICAgICAgICAgICB9ZWxzZSBpZihwY3QgPD0gKDUgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjVcbiAgICAgICAgICAgIH1lbHNlIGlmKHBjdCA8PSAoNiAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuN1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbn19XG5cbmxldCBnZXRGYWNlQ291bnQgPSAocGxheWVyLCBmYWNlKT0+e1xuICAgIGxldCBhcnIgPSBjb3VudEZhY2VzKHBsYXllci5oYW5kKTtcbiAgICBjb25zb2xlLmxvZyhwbGF5ZXIubmFtZSArIGFycik7XG4gICAgcmV0dXJuIGFycltmYWNlLTFdO1xufTtcblxubGV0IGRpZVJhdGlvID0gKHBsYXllck51bSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTlVtYmVyIGRpZSBvbiB0YWJsZVwiICsgbnVtYmVyT2ZEaWUpO1xuICAgIGNvbnNvbGUubG9nKFwiQkZPIGFyclwiICsgYmV0Q291bnQpO1xuICAgIHJldHVybiAoYmV0Q291bnQtcGxheWVyTnVtKS9udW1iZXJPZkRpZTtcbn07XG5cbi8vTWFpbiBWYXJpYWJsZXNcbmxldCB0YWJsZSA9IFtdO1xubGV0IFBsYXllck51bWJlcjtcbmxldCBjdXJyZW50SGFuZDtcbmxldCBjdXJyZW50UGxheWVyO1xubGV0IGxhc3RCZXQgPSBbMCwgMF07XG5sZXQgYmV0Q291bnQgPSAwO1xubGV0IGRpY2VPblRhYmxlSW5kZXhlZEFycmF5ID0gWzAsMCwwLDAsMCwwXTtcbmxldCBudW1iZXJPZkRpZSA9IDA7XG5sZXQgY2hhbGxlbmdlcjtcbmxldCBjaGFsbGVuZ2VkO1xuXG4vL2dlbmVyaWMgZnVuY3Rpb25zXG5cblxuXG5cblxuLy8jIyMjIyMjIyMjIyMjR2FtZSBGdW5jdGlvbnMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IHN0YXJ0R2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgY3JlYXRlSHVtYW5QbGF5ZXIoaW5pdGlhbFZhbHVlcyk7XG4gICAgY3JlYXRlQWlQbGF5ZXJzKGluaXRpYWxWYWx1ZXNbMV0pO1xuICAgIGlmICh0YWJsZVswXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhYmxlWzBdLnBsYXllciA9IHRydWU7fVxufTtcblxuY29uc3QgY3JlYXRlSHVtYW5QbGF5ZXIgPSAoaW5pdGlhbFZhbHVlcyk9PntcbiAgICBsZXQgaHVtYW4gPSBuZXcgUGxheWVyKGluaXRpYWxWYWx1ZXNbMF0pO1xuICAgIGh1bWFuLmFkZFRvVGFibGUodGFibGUpO1xufTtcblxuY29uc3QgZ2V0R2FtZVNldHRpbmdzID0gKCk9PntcbiAgICBsZXQgbmFtZSA9IG5hbWVJbnB1dC52YWx1ZTtcbiAgICBpZiAoMTAgPiBwbGF5ZXJzSW5wdXQudmFsdWUgPiAwKXtcbiAgICAgICAgbGV0IG51bVBsYXllcnMgPSBwbGF5ZXJzSW5wdXQudmFsdWU7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbc3VibWl0LCBwbGF5ZXJzSW5wdXQsIG5hbWVJbnB1dF0pO1xuICAgICAgICByZXR1cm4gKFtuYW1lLCBudW1QbGF5ZXJzXSk7XG4gICAgfXJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJhbmRvbU5hbWUgPSAoKT0+IHtcbiAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihuYW1lcy5sZW5ndGgpKTtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpbmRleF07XG4gICAgICAgIG5hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xufTtcblxuY29uc3QgY3JlYXRlQWlQbGF5ZXJzID0gKG51bSk9PntcbiAgICBmb3IgKGxldCBpID0wOyBpIDxudW07IGkrKyl7XG4gICAgICAgIGxldCB4ID0gbmV3IFBsYXllcigpO1xuICAgICAgICB4LmFkZFRvVGFibGUoKTtcbiAgICB9XG59O1xuXG4vL1BsYXllciBzZXQgdXBcbmNvbnN0IHNldFVwTmV4dFBsYXllciA9ICgpID0+IHtcbiAgIGdldE5leHRQbGF5ZXIoKTtcbiAgIGRpc3BsYXlFbGVtZW50cyhbY3VycmVudFBsYXllckRpc3BsYXksIGN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxheWVyID09PSB0cnVlKSB7XG4gICAgICBzZXRVcEh1bWFuVHVybigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgc2V0VXBBaVR1cm4oKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRVcEh1bWFuVHVybiA9ICgpPT57XG4gICAgdGVzdDIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgY3VycmVudEhhbmREaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+IFlvdXIgSGFuZCBpczogPC9oMT5gO1xuICAgIGN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9PC9oMT5gO1xuICAgIGRpc3BsYXlMYXN0QmV0KCk7XG4gICAgZGlzcGxheURpY2VJbWFnZXMoY3VycmVudEhhbmREaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKGN1cnJlbnRIYW5kKSk7XG4gICAgZGlzcGxheUFuZEhpZGUoW2RlY2xhcmVEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBpbnB1dHNdLCBbc3BvdE9uQnV0dG9uLCBibHVmZkJ1dHRvbiwgYmV0RGlzcGxheSwgZmFjZURpc3BsYXldKTtcbn07XG5cbmNvbnN0IGRpc3BsYXlMYXN0QmV0ID0gKCk9PiB7XG4gICAgaWYgKGxhc3RCZXRbMF0gIT09IDApIHtcbiAgICAgICAgdGVzdC5pbm5lckhUTUwgPSBgPGgzPkxhc3QgQmV0OiAke2xhc3RCZXRbMV19IDwvaDM+YDtcbiAgICAgICAgZGlzcGxheURpY2VJbWFnZXModGVzdCwgY29udmVydFRvRGljZUltYWdlcyhbbGFzdEJldFswXV0pKVxuICAgIH1cbn07XG5cbmNvbnN0IHNldFVwQWlUdXJuID0gKCk9PntcbiAgICBkaXNwbGF5QW5kSGlkZShbc3BvdE9uQnV0dG9uLCBibHVmZkJ1dHRvbiwgcGFzc0J1dHRvbiwgcmVzdWx0LCB0ZXN0XSwgW2N1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgIHJlc3VsdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGN1cnJlbnRQbGF5ZXJEaXNwbGF5LmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9IGlzIHBsYXlpbmc8L2gxPmA7XG4gICAgdGVzdC5pbm5lckhUTUwgPSBgWW91ciBoYW5kIGlzOmA7XG4gICAgZGlzcGxheURpY2VJbWFnZXModGVzdCwgY29udmVydFRvRGljZUltYWdlcyh0YWJsZVswXS5oYW5kKSk7XG4gICAgbGFzdEJldCA9IGFpUGxheXMoKTtcbiAgICBydW5BaUFnYWluc3RBaSgpO1xufTtcblxuY29uc3QgcnVuQWlBZ2FpbnN0QWkgPSAoKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IGdldENoYWxsZW5nZXJzKGxhc3RCZXRbMF0sIGZhbHNlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsbGVuZ2Vycyk7XG4gICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uLCBwYXNzQnV0dG9uXSk7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSk7XG4gICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCgpO1xuICAgIH1lbHNle1xuICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKGZhbHNlKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXROZXh0UGxheWVyID0gKCk9PntcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBjdXJyZW50SGFuZCA9IGN1cnJlbnRQbGF5ZXIuaGFuZDtcbn07XG5cbmNvbnN0IGZpcnN0UGxheWVyID0gKCkgPT4ge1xuICAgIHNldFVwTmV4dFBsYXllcigpO1xuICAgIFBsYXllck51bWJlciArPSAxO1xuICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xufTtcblxuY29uc3QgcmVhZHlOZXh0UGxheWVyID0gKCkgPT4ge1xuICAgIHNldFVwTmV4dFBsYXllcigpO1xuICAgIFBsYXllck51bWJlciArPSAxO1xufTtcblxuY29uc3QgcmV0dXJuTmV3UGxheWVyTnVtYmVyID0gKCkgPT4ge1xuICAgIGlmIChQbGF5ZXJOdW1iZXIgPj0gdGFibGUubGVuZ3RoIHx8IFBsYXllck51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFBsYXllck51bWJlciA9IDA7XG4gICAgfSBlbHNlIGlmIChQbGF5ZXJOdW1iZXIgPCAwKSB7XG4gICAgICAgIFBsYXllck51bWJlciA9IHRhYmxlLmxlbmd0aCAtIDE7XG4gICAgfVxufTtcblxuLy9ORVcgUk9VTkRcbmNvbnN0IHN0YXJ0TmV4dFJvdW5kID0gKCkgPT4ge1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGFibGUubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgdGFibGVbeF0ucm9sbCgpO1xuICAgICAgICB0YWJsZVt4XS5hZGRPY2N1cnJlbmNlcygpO1xuICAgIH1cbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBkaXNwbGF5UGxheWVycygpO1xuICAgIGNvbnNvbGUubG9nKGBzdGFydE5leHRSb3VuZCBmdW5jdGlvbiBleGl0ZWRgKTtcblxufTtcblxuY29uc3QgZGlzcGxheVBsYXllcnMgPSAoKT0+e1xuICAgIGxldCBodG1sID0gYDxoMz5QTGF5ZXJzPC9oMz5gO1xuICAgIGZvciAobGV0IGkgPTA7IGk8dGFibGUubGVuZ3RoOyBpKyspe1xuICAgICAgICBodG1sICs9IGAke3RhYmxlW2ldLm5hbWV9IC0gRGljZSBMZWZ0OiAke3RhYmxlW2ldLmhhbmQubGVuZ3RofSA8YnI+YFxuICAgIH1cbiAgICBhdFRhYmxlLmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5jb25zdCBlbmRSb3VuZCA9ICgpID0+IHtcbiAgICByZXNldFJvdW5kVmFyaWFibGVzKCk7XG4gICAgdGVzdC5pbm5lckhUTUwgPSBcIlJPVU5EIE9WRVJcIjtcbiAgICBQbGF5ZXJOdW1iZXIgLT0gMTtcbn07XG5cbmNvbnN0IHJlc2V0Um91bmRWYXJpYWJsZXMgPSAoKSA9PiB7XG4gICAgbGFzdEJldCA9IFswLDBdO1xuICAgIGJldENvdW50ID0gMDtcbiAgICBudW1iZXJPZkRpZSA9IDA7XG4gICAgZGljZU9uVGFibGVJbmRleGVkQXJyYXk9WzAsMCwwLDAsMCwwXTtcbiAgICBoaWRlRWxlbWVudHMoW3Bhc3NCdXR0b24sIGJsdWZmQnV0dG9uLCBzcG90T25CdXR0b24sIG5leHRQbGF5ZXJCdXR0b25dKTtcbn07XG5cbmNvbnN0IGRpc3BsYXlSb3VuZCA9ICgpID0+IHtcbiAgICBoaWRlRWxlbWVudHMoW3Jlc3VsdF0pO1xufTtcblxuLy9HQU1FIFBMQVkgRlVOQ1RJT05TXG5jb25zdCBnZXRCZXRUcnV0aCA9ICgpID0+IHtcbiAgICBsZXQgZmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGNvdW50ID0gbGFzdEJldFsxXTtcbiAgICBjb25zb2xlLmxvZyhkaWNlT25UYWJsZUluZGV4ZWRBcnJheSk7XG4gICAgcmV0dXJuIGRpY2VPblRhYmxlSW5kZXhlZEFycmF5W2ZhY2UgLSAxXSA+PSBjb3VudDtcbn07XG5cbmNvbnN0IHByb2Nlc3NCZXRWYWxpZGl0eSA9IChmYWNlLCBjb3VudCkgPT4ge1xuICAgIGxldCBiZXQgPSBnZXRCZXRJZlZhbGlkKGZhY2UsIGNvdW50KTtcbiAgICBpZiAoYmV0ICE9PSBmYWxzZSkge1xuICAgICAgICBsYXN0QmV0ID0gYmV0O1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbZmFjZURpc3BsYXldLCBbZGVjbGFyZURpc3BsYXksIGRlY2xhcmVCdXR0b24sIGlucHV0c10pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXN0Mi5pbm5lckhUTUwgPSBgPHAgY2xhc3M9XCJkaXNwbGF5LTUgdGV4dC1pbmZvXCI+Tm90IFZhbGlkIElucHV0PC9wPmA7XG4gICAgfVxufTtcblxuXG5jb25zdCBnZXRCZXRJZlZhbGlkID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgZmFjZSA9IHBhcnNlSW50KGZhY2UpO1xuICAgIGNvdW50ID0gcGFyc2VJbnQoY291bnQpO1xuICAgIGxldCBsYXN0RmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGxhc3RDb3VudCA9IGxhc3RCZXRbMV07XG4gICAgY29uc29sZS5sb2coYGxhc3RGYWNlID0gJHtsYXN0QmV0WzBdfSwgbGFzdENvdW50ID0gJHtsYXN0QmV0WzFdfSBmYWNlPSR7ZmFjZX0sIGNvdW50PSR7Y291bnR9YCk7XG4gICAgaWYgKFxuICAgICAgICAoICAgKChmYWNlID4gbGFzdEZhY2UpICYmIChjb3VudCA9PT0gbGFzdENvdW50KSkgJiZcbiAgICAgICAgICAgICgoY291bnQgPiAwKSAmJiAoNyA+IGZhY2UgPiAwKSlcbiAgICAgICAgKVxuXG4gICAgICAgIHx8XG5cbiAgICAgICAgKChjb3VudCA+IGxhc3RDb3VudCkgJiYgKChjb3VudCA+IDApICYmICg3ID4gZmFjZSAmJiBmYWNlID4gMCkpKVxuICAgICkge1xuICAgICAgICBiZXRDb3VudCA9IGNvdW50O1xuICAgICAgICByZXR1cm4gW2ZhY2UsIGNvdW50XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgZ2V0Q2hhbGxlbmdlcnMgPSAoZmFjZSwgcGxheWVyKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IFtdO1xuICAgIGZvciAobGV0IGk9MTsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYodGFibGVbaV0ucmV0dXJuVHJ1ZUlmQUlDaGFsbGVuZ2VzKGZhY2UsIHBsYXllcikpe1xuICAgICAgICAgICAgaWYgKHRhYmxlW2ldICE9PSBjdXJyZW50UGxheWVyKXtcbiAgICAgICAgICAgIGNoYWxsZW5nZXJzLnB1c2godGFibGVbaV0pfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBQb3NzaWJsZSBDaGFsbGVuZ2VyczogJHtjaGFsbGVuZ2Vyc31gKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IC4zKXtcbiAgICByZXR1cm4gY2hhbGxlbmdlcnM7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtdO1xufTtcblxuY29uc3QgZ2V0T3Bwb25lbnQgPSAoY2hhbGxlbmdlcnMpPT57XG4gICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihjaGFsbGVuZ2Vycy5sZW5ndGgpKTtcblxuICAgIGNvbnNvbGUubG9nKGNoYWxsZW5nZXJzW2luZGV4XSk7XG4gICAgcmV0dXJuIGNoYWxsZW5nZXJzW2luZGV4XVxufTtcblxuY29uc3QgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyA9IChjaGFsbGVuZ2UpID0+e1xuICAgIGlmIChjaGFsbGVuZ2Upe1xuICAgICAgICBmYWNlRGlzcGxheS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj5DSEFMTEVOR0VEIEJZICR7Y2hhbGxlbmdlci5uYW1lfTwvZGl2PmA7XG4gICAgfWVsc2V7XG4gICAgICAgIGZhY2VEaXNwbGF5LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPk5vIG9uZSBjaGFsbGVuZ2VzPC9kaXY+YDtcbiAgICB9XG59O1xuXG5jb25zdCBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQgPSAoKSA9PntcbiAgICBjb25zb2xlLmxvZyhcImRldGVybWluaW5nIGNoYWxsZW5nZXNcIik7XG4gICAgZGlzcGxheUFuZEhpZGUoW25leHRSb3VuZEJ1dHRvbiwgcmVzdWx0XSwgW25leHRQbGF5ZXJCdXR0b25dKTtcbiAgICBoYW5kbGVDaGFsbGVuZ2VDaGVjayhnZXRCZXRUcnV0aCgpKTtcblxufTtcblxuY29uc3QgaGFuZGxlQ2hhbGxlbmdlQ2hlY2sgPSAoYmV0Qm9vbGVhbik9PntcbiAgICBjb25zb2xlLmxvZyhcImhhbmRsZSBjaGFsbGVuZ2UgZnVuY3Rpb24gY2FsbGVkXCIpO1xuICAgIGlmKGJldEJvb2xlYW4pe1xuICAgICAgICBsZXQgY29sb3IgPSBnZXRNZXNzYWdlQ29sb3IoY2hhbGxlbmdlcixjaGFsbGVuZ2VkKTtcbiAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCIke2NvbG9yfSBkaXNwbGF5LTRcIj4gQ2hhbGxlbmdlIEZhaWxlZCAtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgcmVtb3ZlRGllKGNoYWxsZW5nZXIpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChjaGFsbGVuZ2VyKTtcbn1lbHNle1xuICAgICAgICBsZXQgY29sb3IgPSBnZXRNZXNzYWdlQ29sb3IoY2hhbGxlbmdlZCwgY2hhbGxlbmdlcik7XG4gICAgICAgIHJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwiJHtjb2xvcn0gZGlzcGxheS00XCI+IENoYWxsZW5nZSBTdWNjZWVkZWQgLT4gJHtjaGFsbGVuZ2VkLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgIHJlbW92ZURpZShjaGFsbGVuZ2VkKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQoY2hhbGxlbmdlZCk7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0TWVzc2FnZUNvbG9yID0gKGxvc2VyLCB3aW5uZXIpID0+e1xuICAgIGlmIChsb3Nlci5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICByZXR1cm4gXCJ0ZXh0LWRhbmdlclwiO1xuICAgIH1lbHNlIGlmKHdpbm5lci5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICByZXR1cm4gXCJ0ZXh0LXN1Y2Nlc3NcIjtcbiAgICB9cmV0dXJuIFwiXCJcblxufTtcblxuY29uc3QgY2hlY2tTcG90T24gPSAoKSA9PntcbiAgICByZXR1cm4gKGRpY2VPblRhYmxlSW5kZXhlZEFycmF5W2xhc3RCZXRbMF0gLTFdID09PSBsYXN0QmV0WzFdKVxufTtcblxuY29uc3QgY2hlY2tJZkVsaW1pbmF0ZWQgPSAoYmV0TG9zZXIpPT57XG4gICAgaWYgKHJldHVybklmTGFzdERpZShiZXRMb3Nlcikpe1xuICAgICAgICBoYW5kbGVMYXN0RGllTG9zdChiZXRMb3Nlcik7XG4gICAgICAgIGNoZWNrRm9yV2lubmVyKCk7XG4gICAgfVxufTtcblxuY29uc3QgcmVtb3ZlRGllID0gKHBsYXllcikgPT57XG4gICAgcGxheWVyLmhhbmQgID0gcGxheWVyLmhhbmQuc3BsaWNlKDEpO1xufTtcblxuLy9Db21wdXRlciBiZXRzXG5jb25zdCBhaVBsYXlzID0gKCk9PiB7XG4gICAgbGV0IG5ld0JldCA9IHBsYXllckJldCgpO1xuICAgIGJldENvdW50ID0gbmV3QmV0WzFdO1xuICAgIGRpc3BsYXlFbGVtZW50cyhbYmV0RGlzcGxheV0pO1xuICAgIGJldERpc3BsYXkuaW5uZXJIVE1MID0gYDxwIGNsYXNzPVwiZGlzcGxheS00XCI+JHtjdXJyZW50UGxheWVyLm5hbWV9IGJldHMgdGhlcmUgYXJlIDxicj4gJHtuZXdCZXRbMV19IDxzcGFuIGlkPVwiZGljZVwiPiA8L3NwYW4+cyBvbiB0aGUgdGFibGU8L3A+YDtcbiAgICBsZXQgZGllRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGljZVwiKTtcbiAgICBkaXNwbGF5RGljZUltYWdlcyhkaWVEaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKFtuZXdCZXRbMF1dKSk7XG4gICAgcmV0dXJuIG5ld0JldDtcbn07XG5cbmNvbnN0IGNvdW50RmFjZXMgPSAoaGFuZCkgPT57XG4gICAgbGV0IGN1cnJlbnRIYW5kSW50cyA9IFswLCAwLCAwLCAwLCAwLCAwXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3VycmVudEhhbmRJbnRzW2hhbmRbaV0gLSAxXSArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudEhhbmRJbnRzO1xufTtcbmNvbnN0IHBsYXllckJldCA9ICgpID0+IHtcbiAgICBsZXQgY3VycmVudEhhbmRJbnRzID0gY291bnRGYWNlcyhjdXJyZW50SGFuZCk7XG4gICAgbGV0IGxhcmdlc3RDb3VudCA9IE1hdGgubWF4KC4uLmN1cnJlbnRIYW5kSW50cyk7XG4gICAgbGV0IGJlc3RIYW5kID0gW2N1cnJlbnRIYW5kSW50cy5pbmRleE9mKGxhcmdlc3RDb3VudCkrMSwgbGFyZ2VzdENvdW50XTtcbiAgICByZXR1cm4gYWlCbHVmZihiZXN0SGFuZCk7XG59O1xuXG5jb25zdCBhaUJsdWZmID0gKGJlc3RIYW5kKT0+e1xuICAgIHdoaWxlIChhaUNoZWNrQ3VycmVudEhhbmRWYWxpZGl0eShiZXN0SGFuZCkgIT09IHRydWUpe1xuICAgICAgICBiZXN0SGFuZFsxXSArPSAxO1xuICAgIH1cbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IC4zKXtcbiAgICAgICAgYmVzdEhhbmRbMV0gKz0gMTtcbiAgICAgICAgcmV0dXJuIGJlc3RIYW5kO1xuICAgIH1lbHNle1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IC4xKXtcbiAgICAgICAgICAgIGJlc3RIYW5kWzFdICs9IDI7XG4gICAgICAgICAgICByZXR1cm4gYmVzdEhhbmQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3RIYW5kXG59O1xuXG5jb25zdCBhaUNoZWNrQ3VycmVudEhhbmRWYWxpZGl0eSA9IGhhbmQgPT4ge1xuICAgIHJldHVybiAoKGhhbmRbMF0gPiBsYXN0QmV0WzBdICAmJiBoYW5kWzFdID49IGxhc3RCZXRbMV0pIHx8IGhhbmRbMV0gPiBsYXN0QmV0WzFdKVxufTtcblxuY29uc3QgcmV0dXJuSWZMYXN0RGllID0gcGxheWVyID0+IHtcbiAgICByZXR1cm4gcGxheWVyLmhhbmQubGVuZ3RoID09PSAwO1xufTtcblxuY29uc3QgaGFuZGxlTGFzdERpZUxvc3QgPSBwbGF5ZXIgPT57XG4gICAgY29uc29sZS5sb2coYEhhbmRsaW5nIGxhc3QgZGljZSBvZiAke3BsYXllci5uYW1lfWApO1xuICAgIGxldCBpbmRleCA9IHRhYmxlLmluZGV4T2YocGxheWVyKTtcbiAgICBjb25zb2xlLmxvZyhpbmRleCk7XG4gICAgY29uc29sZS5sb2codGFibGVbaW5kZXhdKTtcbiAgICBpZiAodGFibGVbaW5kZXhdLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbZ2FtZU92ZXJdKTtcbiAgICAgICAgZ2FtZU92ZXIuaW5uZXJIVE1MPVwiWU9VIExPU0VcIlxuICAgIH1lbHNle1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgICAgIHRlc3QyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJ0ZXh0LXdhcm5pbmdcIj4ke3BsYXllci5uYW1lfSBoYXMgYmVlbiBlbGltaW5hdGVkPC9oMT5gO1xuICAgICAgICB0YWJsZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0YWJsZSk7XG59O1xuXG5jb25zdCBjaGVja0Zvcldpbm5lciA9ICgpPT57XG4gICAgaWYgKHRhYmxlLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIyMjIyMjI0dBTUUgT1ZFUiMjIyMjIyMjIyMjJyk7XG4gICAgICAgIHJlc3VsdC5pbm5lckhUTUwgPSBcIllPVSBXSU5cIjtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtnYW1lT3Zlcl0pO1xuICAgIH1cbn07XG5cbi8vR2FtZSBTdGFydCBGdW5jdGlvbnNcbmxldCBjbGVhbkJvYXJkID0gKCkgPT4gaGlkZUVsZW1lbnRzKFtzdWJtaXQsIG5hbWVJbnB1dCwgcGxheWVyc0lucHV0LCBibHVmZkJ1dHRvbixzcG90T25CdXR0b24scGFzc0J1dHRvbixuZXh0Um91bmRCdXR0b24sbmV4dFBsYXllckJ1dHRvbixmYWNlRGlzcGxheSxwbGF5ZXJPcHRpb25zRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgZGVjbGFyZURpc3BsYXksIGlucHV0cywgcmVzdWx0LCBiZXREaXNwbGF5LCBnYW1lT3Zlcl0pO1xubGV0IGdhbWUgPSAoaW5pdGlhbFZhbHVlcykgPT4ge1xuICAgIHN0YXJ0R2FtZShpbml0aWFsVmFsdWVzKTtcbiAgICBzdGFydE5leHRSb3VuZCgpO1xuICAgIGZpcnN0UGxheWVyKCk7XG59O1xuY2xlYW5Cb2FyZCgpO1xuZXZlbnRMaXN0ZW5lcnMoKTtcblxuIiwiLy9ESUNFIElNQUdFU1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xuY29uc3QgZGllMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWUxLnNyYz1cImltYWdlcy9kaWUxLnBuZ1wiO1xuXG5jb25zdCBkaWUyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTIuc3JjPVwiaW1hZ2VzL2RpZTIucG5nXCI7XG5cbmNvbnN0IGRpZTMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMy5zcmM9XCJpbWFnZXMvZGllMy5wbmdcIjtcblxuY29uc3QgZGllNCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU0LnNyYz1cImltYWdlcy9kaWU0LnBuZ1wiO1xuXG5jb25zdCBkaWU1ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTUuc3JjPVwiaW1hZ2VzL2RpZTUucG5nXCI7XG5cbmNvbnN0IGRpZTYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNi5zcmM9XCJpbWFnZXMvZGllNi5wbmdcIjtcblxuY29uc3QgZGljZUltYWdlcyA9IFtkaWUxLCBkaWUyLCBkaWUzLCBkaWU0LCBkaWU1LCBkaWU2XTtcblxuLy9HZW5lcmljIERpc3BsYXkgRnVuY3Rpb25zXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IGRpc3BsYXlFbGVtZW50cyA9IChhcnJheSk9PiB7XG4gICAgZm9yIChsZXQgZWxlbWVudCA9IDA7IGVsZW1lbnQgPCBhcnJheS5sZW5ndGg7IGVsZW1lbnQrKyl7XG4gICAgICAgIGFycmF5W2VsZW1lbnRdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO31cbn07XG5cbmNvbnN0IGhpZGVFbGVtZW50cyA9IChhcnJheSk9PiB7XG4gICAgZm9yIChsZXQgZWxlbWVudCA9IDA7IGVsZW1lbnQgPCBhcnJheS5sZW5ndGg7IGVsZW1lbnQrKyl7XG4gICAgICAgIGFycmF5W2VsZW1lbnRdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxufTtcblxuY29uc3QgZGlzcGxheUFuZEhpZGUgPSAoYXJyYXlBZGQsIGFycmF5RGVsZXRlKT0+e1xuICAgIGRpc3BsYXlFbGVtZW50cyhhcnJheUFkZCk7XG4gICAgaGlkZUVsZW1lbnRzKGFycmF5RGVsZXRlKTtcbn07XG5cbi8vRGljZSBJbWFnZSBGdW5jdGlvbnNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY29uc3QgY29udmVydFRvRGljZUltYWdlcyA9IGhhbmQgPT57XG4gICAgbGV0IGltZ0hhbmQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmQubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgZmFjZSA9IGhhbmRbaV07XG4gICAgICAgIGxldCBkaWNlSW1hZ2UgPSBkaWNlSW1hZ2VzW2ZhY2UtMV0uY2xvbmVOb2RlKCk7XG4gICAgICAgIGltZ0hhbmQucHVzaChkaWNlSW1hZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gaW1nSGFuZDtcbn07XG5cbmNvbnN0IGRpc3BsYXlEaWNlSW1hZ2VzID0gKHBhcmVudE5vZGUsIGhhbmRJbWFnZXMpID0+e1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZEltYWdlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoaGFuZEltYWdlc1tpXSk7XG4gICAgfVxufTtcblxuY29uc3QgY2xlYXJJbWFnZXMgPSBwYXJlbnROb2RlID0+e1xuICAgIHdoaWxlIChwYXJlbnROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cblxuXG5cblxuXG5cblxuXG4vLyBFWFBPUlRTXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkaXNwbGF5RWxlbWVudHMgOiBkaXNwbGF5RWxlbWVudHMsXG4gICAgaGlkZUVsZW1lbnRzIDogaGlkZUVsZW1lbnRzLFxuICAgIGRpc3BsYXlBbmRIaWRlIDogZGlzcGxheUFuZEhpZGUsXG4gICAgY29udmVydFRvRGljZUltYWdlcyA6IGNvbnZlcnRUb0RpY2VJbWFnZXMsXG4gICAgY2xlYXJJbWFnZXMgOiBjbGVhckltYWdlcyxcbiAgICBkaXNwbGF5RGljZUltYWdlczogZGlzcGxheURpY2VJbWFnZXNcblxufTtcblxuXG5cbiJdfQ==
