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
const {setHTML} = display;

const challenge = require('./challenge.js');
const {getChallengers} = challenge;

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
            let challengers = getChallengers(faceInput.value, true, table);
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
          setHTML(result, `<div class="text-warning display-4"> Spot On True -> ${challenged.name} loses a die </div>`);
           loser = challenged;
        }else{
            setHTML(result, `<div class="text-warning display-4"> Spot On False-> ${challenger.name} loses a die </div>`);
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
            let pct = dieRatio(playerNum); // get numerical probability of bet truthyness
            if (player === true){ //increase challenge chance if human is betting
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

let getFaceCount = (player, face)=>{ //counts individuals instances of a face
    let arr = countFaces(player.hand);
    return arr[face-1];
};

let dieRatio = (playerNum) => { //return prop of truthyness
    return (betCount-playerNum)/numberOfDie;
};

//Main Variables
let table = []; //array to hold players
let PlayerNumber; //current player index counter
let currentHand; //active die hand
let currentPlayer; // active player : table[PlayerNumber]
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
    table[0].player = true;
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
    setHTML(test2,"");
    displayElements([test2]);
    setHTML(currentHandDisplay, `<h1 class="text-align"> Your Hand is: </h1>`);
    setHTML(currentPlayerDisplay, `<h1 class="text-align">${currentPlayer.name}</h1>`);
    displayLastBet(lastBet, test);
    displayDiceImages(currentHandDisplay, convertToDiceImages(currentHand));
    displayAndHide([declareDisplay, declareButton, inputs], [spotOnButton, bluffButton, betDisplay, faceDisplay]);
};


const setUpAiTurn = ()=>{
    displayAndHide([spotOnButton, bluffButton, passButton, result, test], [currentHandDisplay]);
    setHTML(result, "");
    setHTML(currentPlayerDisplay, `<h1 class="text-align">${currentPlayer.name} is playing</h1>`);
    setHTML(test, `Your hand is:`);
    displayDiceImages(test, convertToDiceImages(table[0].hand));
    lastBet = aiPlays();
    runAiAgainstAi();
};

const runAiAgainstAi = ()=>{
    let challengers = getChallengers(lastBet[0], false, table);
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
  table.map(x =>{
    x.roll();
    x.addOccurrences();
  });
    returnNewPlayerNumber();
    currentPlayer = table[PlayerNumber];
    displayPlayers(atTable, table);

};

const endRound = () => {
    resetRoundVariables();
    setHTML(test, "ROUND OVER");
    PlayerNumber -= 1;
};

const resetRoundVariables = () => {
    lastBet = [0,0];
    betCount = 0;
    numberOfDie = 0;
    diceOnTableIndexedArray = [0,0,0,0,0,0];
    hideElements([passButton, bluffButton, spotOnButton, nextPlayerButton]);
};


//GAME PLAY FUNCTIONS
const getBetTruth = () => {
    let face = lastBet[0];
    let count = lastBet[1];
    return diceOnTableIndexedArray[face - 1] >= count;
};

const processBetValidity = (face, count) => {
    let bet = getBetIfValid(face, count);
    if (bet !== false) {
        lastBet = bet;
        displayAndHide([faceDisplay], [declareDisplay, declareButton, inputs]);
        return true;
    } else {
        setHTML(test2, `<p class="display-5 text-info">Not Valid Input</p>`);
    }
};

const getBetIfValid = (face, count) => {
    face = parseInt(face);
    count = parseInt(count);
    let lastFace = lastBet[0];
    let lastCount = lastBet[1];

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
};//return if bet is valid

const getOpponent = (challengers)=>{
    let index = Math.floor(Math.random() * Math.floor(challengers.length));
    return challengers[index]
};

const determineChallengeResult = () =>{
    displayAndHide([nextRoundButton, result], [nextPlayerButton]);
    handleChallengeCheck(getBetTruth());

};

const handleChallengeCheck = (betBoolean)=>{
    console.log("handle challenge function called");
    if(betBoolean){
        let color = getMessageColor(challenger,challenged);
        setHTML(result.innerHTML = `<div class = "${color} display-4"> Challenge Failed -> ${challenger.name} loses a die </div>`);
        removeDie(challenger);
        checkIfEliminated(challenger);
}else{
        let color = getMessageColor(challenged, challenger);
        setHTML(result, `<div class = "${color} display-4"> Challenge Succeeded -> ${challenged.name} loses a die </div>`);
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
    setHTML(betDisplay, `<p class="display-4">${currentPlayer.name} bets there are <br> ${newBet[1]} <span id="dice"> </span>s on the table</p>`);
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
    let index = table.indexOf(player);
    if (table[index].player === true){
        displayElements([gameOver]);
        setHTML(gameOver, "YOU LOSE");
    }else{
        displayElements([test2]);
        setHTML(test2, `<h1 class="text-warning">${player.name} has been eliminated</h1>`);
        table.splice(index, 1);
    }
    console.log(table);
};

const checkForWinner = ()=>{
    if (table.length === 1){
        setHTML(result, "You Win!");
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

},{"./challenge.js":2,"./display.js":3}],2:[function(require,module,exports){
const getChallengers = (face, player, table)=>{
    let challengers = [];
    for (let i=1; i < table.length; i++){
        if(table[i].returnTrueIfAIChallenges(face, player)){
            if (table[i] !== currentPlayer){
                challengers.push(table[i])}
        }
    }

    if (randomTruthValue(.3)){
        return challengers;
    }return [];
};

const randomTruthValue = pct => Math.random() > pct;

module.exports = {
    getChallengers : getChallengers,
};
},{}],3:[function(require,module,exports){
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
    setHTML(element, html);
};

const displayLastBet = (lastBet, element)=> {
    if (lastBet[0] !== 0) {
        setHTML(element, `<h3>Last Bet: ${lastBet[1]} </h3>`);
        displayDiceImages(element, convertToDiceImages([lastBet[0]]))
    }
};

const displayRound = (result) => {
    hideElements([result]);
};

const displayChallengeStatus = (challenge, display, challenger) =>{
    if (challenge){
        setHTML(display, `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`);
    }else{
        setHTML(display, `<div class="text-warning display-4">No one challenges</div>`);
    }
};

const setHTML = (element, html)=>{
    element.innerHTML = html;
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
    setHTML : setHTML,

};




},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9jaGFsbGVuZ2UuanMiLCJzY3JpcHRzL2Rpc3BsYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyMjIyMjIyMjIyMjIElNUE9SVFMgIyMjIyMjIyMjI1xuLy8jIyMjIyNESVNQTEFZIyMjIyMjIyMjXG5jb25zdCBkaXNwbGF5ID0gcmVxdWlyZSgnLi9kaXNwbGF5LmpzJyk7XG5jb25zdCB7ZGlzcGxheUVsZW1lbnRzfSA9IGRpc3BsYXk7XG5jb25zdCB7aGlkZUVsZW1lbnRzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheUFuZEhpZGV9ID0gZGlzcGxheTtcbmNvbnN0IHtjb252ZXJ0VG9EaWNlSW1hZ2VzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheURpY2VJbWFnZXN9ID0gZGlzcGxheTtcbmNvbnN0IHtjbGVhckltYWdlc30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlQbGF5ZXJzfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheUxhc3RCZXR9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5Um91bmR9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzfSA9IGRpc3BsYXk7XG5jb25zdCB7c2V0SFRNTH0gPSBkaXNwbGF5O1xuXG5jb25zdCBjaGFsbGVuZ2UgPSByZXF1aXJlKCcuL2NoYWxsZW5nZS5qcycpO1xuY29uc3Qge2dldENoYWxsZW5nZXJzfSA9IGNoYWxsZW5nZTtcblxuLy8jIyMjIyMjIyMjI0RvY3VtZW50IGJ1dHRvbnMgYW5kIGRpc3BsYXlzIyMjIyMjIyMjIyMjIyNcbi8vZGlzcGxheXNcbmxldCBjdXJyZW50SGFuZERpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2N1cnJlbnRIYW5kXCIpO1xubGV0IGN1cnJlbnRQbGF5ZXJEaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJEaXNwbGF5XCIpO1xubGV0IHBsYXllck9wdGlvbnNEaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJPcHRpb25zXCIpO1xubGV0IHRlc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Rlc3RcIik7XG5sZXQgdGVzdDIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Rlc3QyXCIpO1xubGV0IGRlY2xhcmVEaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWNsYXJlRGlzcGxheVwiKTtcbmxldCBmYWNlRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZmFjZURpc3BsYXlcIik7XG5sZXQgcmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXN1bHRcIik7XG5sZXQgaW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbnB1dHNcIik7XG5sZXQgYmV0RGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYmV0RGlzcGxheVwiKTtcbmxldCBnYW1lT3ZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZU92ZXJcIik7XG5jb25zdCBhdFRhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJzXCIpO1xuXG4vL0J1dHRvbnNcbmNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKTtcbmNvbnN0IG5leHRQbGF5ZXJCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25leHRQbGF5ZXJcIik7XG5jb25zdCBibHVmZkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYmx1ZmZcIik7XG5jb25zdCBzcG90T25CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nwb3RPblwiKTtcbmNvbnN0IGRlY2xhcmVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlY2xhcmVcIik7XG5jb25zdCBuZXh0Um91bmRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25leHRSb3VuZFwiKTtcbmNvbnN0IGZhY2VJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYWNlJyk7XG5jb25zdCBjb3VudElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50Jyk7XG5jb25zdCBwYXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3MnKTtcbmNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnZXROYW1lJyk7XG5jb25zdCBzdWJtaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdFwiKTtcbmNvbnN0IHBsYXllcnNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2V0UGxheWVyc1wiKTtcblxuLy9JbWFnZXNcblxuLy9CdXR0b24gTGlzdGVuZXJzXG5jb25zdCBldmVudExpc3RlbmVycyA9ICgpPT4ge1xuICAgIHN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbc3VibWl0LCBwbGF5ZXJzSW5wdXQsIG5hbWVJbnB1dF0sIFtzdGFydEJ1dHRvbl0pO1xuICAgIH0pO1xuXG4gICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PntcbiAgICAgICAgbGV0IGdhbWVJbml0aWFsVmFsdWVzID0gZ2V0R2FtZVNldHRpbmdzKCk7XG4gICAgICAgIGlmKGdhbWVJbml0aWFsVmFsdWVzICE9PSBmYWxzZSl7XG4gICAgICAgICAgICBnYW1lKGdhbWVJbml0aWFsVmFsdWVzKTt9ZWxzZXtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYmx1ZmZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQodHJ1ZSk7XG4gICAgICAgIGVuZFJvdW5kKCk7XG4gICAgfSk7XG5cbiAgICBuZXh0UGxheWVyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoaWRlRWxlbWVudHMoW25leHRQbGF5ZXJCdXR0b25dKTtcbiAgICAgICAgY2xlYXJJbWFnZXMoY3VycmVudEhhbmREaXNwbGF5KTtcbiAgICAgICAgcmVhZHlOZXh0UGxheWVyKCk7XG4gICAgICAgIHJldHVybk5ld1BsYXllck51bWJlcigpO1xuICAgIH0pO1xuXG4gICAgbmV4dFJvdW5kQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoaWRlRWxlbWVudHMoW25leHRSb3VuZEJ1dHRvbiwgdGVzdCwgdGVzdDJdKTtcbiAgICAgICAgcmVzZXRSb3VuZFZhcmlhYmxlcygpO1xuICAgICAgICBkaXNwbGF5Um91bmQocmVzdWx0KTtcbiAgICAgICAgc3RhcnROZXh0Um91bmQoKTtcbiAgICAgICAgZmlyc3RQbGF5ZXIoKTtcbiAgICB9KTtcblxuICAgIGRlY2xhcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmKHByb2Nlc3NCZXRWYWxpZGl0eShmYWNlSW5wdXQudmFsdWUsIGNvdW50SW5wdXQudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlY2xhcmVidXR0b24gdmFsaWRhdGVkXCIpO1xuICAgICAgICAgICAgbGV0IGNoYWxsZW5nZXJzID0gZ2V0Q2hhbGxlbmdlcnMoZmFjZUlucHV0LnZhbHVlLCB0cnVlLCB0YWJsZSk7XG4gICAgICAgICAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgICAgICAgICAgIGNoYWxsZW5nZWQgPSB0YWJsZVswXTtcbiAgICAgICAgICAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgICAgICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCgpO1xuICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMoZmFsc2UsIGZhY2VEaXNwbGF5LCBjaGFsbGVuZ2VyKTtcbiAgICAgICAgICAgICAgICBkaXNwbGF5RWxlbWVudHMoW25leHRQbGF5ZXJCdXR0b25dKTtcbiAgICAgICAgICAgIH1cbiAgICAgfVxuICAgIH0pO1xuXG4gICAgcGFzc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtuZXh0UGxheWVyQnV0dG9uXSwgW3Bhc3NCdXR0b24sIGJsdWZmQnV0dG9uLCBzcG90T25CdXR0b25dKTtcbiAgICB9KTtcblxuICAgIHNwb3RPbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Nwb3RPbiBjYWxsZWQnKTtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgbGV0IGxvc2VyO1xuICAgICAgICBpZihjaGVja1Nwb3RPbigpKXtcbiAgICAgICAgICBzZXRIVE1MKHJlc3VsdCwgYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gVHJ1ZSAtPiAke2NoYWxsZW5nZWQubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YCk7XG4gICAgICAgICAgIGxvc2VyID0gY2hhbGxlbmdlZDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBzZXRIVE1MKHJlc3VsdCwgYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+IFNwb3QgT24gRmFsc2UtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YCk7XG4gICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlRGllKGxvc2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQobG9zZXIpO1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3Jlc3VsdCwgbmV4dFJvdW5kQnV0dG9uXSk7XG4gICAgICAgIGVuZFJvdW5kKCk7XG4gICAgfSk7XG5cbn07XG5cbmxldCBuYW1lcyA9IFtcbiAgICBcIlNoaXJsZWVuXCIsIFwiS2FyYVwiLCBcIkNsZXZlbGFuZFwiLFwiTWVycmlcIiwgXCJDb25jZXB0aW9uXCIsIFwiSGFsZXlcIiwgXCJGbG9yYW5jZVwiLCBcIkRvcmllXCIsIFwiTHVlbGxhXCIsIFwiVmVybmlhXCIsXG4gICAgXCJGcmVlbWFuXCIsIFwiS2F0aGFyaW5hXCIsIFwiQ2hhcm1haW5cIiwgXCJHcmFoYW1cIiwgXCJEYXJuZWxsXCIsIFwiQmVybmV0dGFcIiwgXCJJbmVsbFwiLCBcIlBhZ2VcIiwgXCJHYXJuZXR0XCIsIFwiQW5uYWxpc2FcIixcbiAgICBcIkJyYW50XCIsIFwiVmFsZGFcIiwgXCJWaWtpXCIsIFwiQXN1bmNpb25cIiwgXCJNb2lyYVwiLCBcIktheWNlZVwiLCBcIlJpY2hlbGxlXCIsIFwiRWxpY2lhXCIsIFwiRW5laWRhXCIsIFwiRXZlbHlublwiXG5dO1xuXG4vL09CSkVDVFNcbmNsYXNzIFBsYXllcntcbiAgICBjb25zdHJ1Y3RvcihuYW1lKVxuICAgIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZSB8fCBnZXRSYW5kb21OYW1lKCk7XG4gICAgICAgIHRoaXMuaGFuZCA9IFswLDAsMCwwXTtcbiAgICAgICAgdGhpcy5yb2xsID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kID0gdGhpcy5oYW5kLm1hcChcbiAgICAgICAgICAgICAgICAoKSA9PiAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNikgKyAxKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMubmFtZX0gaGFzIHJvbGxlZGApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZFRvVGFibGUgPSAoKSA9PiB7XG4gICAgICAgICAgICB0YWJsZS5wdXNoKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZE9jY3VycmVuY2VzID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmhhbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheVt0aGlzLmhhbmRbaV0gLSAxXSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbnVtYmVyT2ZEaWUgKz0gdGhpcy5oYW5kLmxlbmd0aDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZXR1cm5UcnVlSWZBSUNoYWxsZW5nZXMgPSAoZmFjZSwgcGxheWVyKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGxheWVyTnVtID0gZ2V0RmFjZUNvdW50KHRoaXMsIGZhY2UpO1xuICAgICAgICAgICAgbGV0IHBjdCA9IGRpZVJhdGlvKHBsYXllck51bSk7IC8vIGdldCBudW1lcmljYWwgcHJvYmFiaWxpdHkgb2YgYmV0IHRydXRoeW5lc3NcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT09IHRydWUpeyAvL2luY3JlYXNlIGNoYWxsZW5nZSBjaGFuY2UgaWYgaHVtYW4gaXMgYmV0dGluZ1xuICAgICAgICAgICAgICAgIHBjdCArPSAoMS8xMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGN0IDw9ICgxIC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9ZWxzZSBpZiAocGN0IDw9ICgyIC8gMTIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuMlxuICAgICAgICAgICAgfWVsc2UgaWYgKHBjdCA8PSAoNCAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuM1xuICAgICAgICAgICAgfWVsc2UgaWYocGN0IDw9ICg1IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC41XG4gICAgICAgICAgICB9ZWxzZSBpZihwY3QgPD0gKDYgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjdcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG59fVxuXG5sZXQgZ2V0RmFjZUNvdW50ID0gKHBsYXllciwgZmFjZSk9PnsgLy9jb3VudHMgaW5kaXZpZHVhbHMgaW5zdGFuY2VzIG9mIGEgZmFjZVxuICAgIGxldCBhcnIgPSBjb3VudEZhY2VzKHBsYXllci5oYW5kKTtcbiAgICByZXR1cm4gYXJyW2ZhY2UtMV07XG59O1xuXG5sZXQgZGllUmF0aW8gPSAocGxheWVyTnVtKSA9PiB7IC8vcmV0dXJuIHByb3Agb2YgdHJ1dGh5bmVzc1xuICAgIHJldHVybiAoYmV0Q291bnQtcGxheWVyTnVtKS9udW1iZXJPZkRpZTtcbn07XG5cbi8vTWFpbiBWYXJpYWJsZXNcbmxldCB0YWJsZSA9IFtdOyAvL2FycmF5IHRvIGhvbGQgcGxheWVyc1xubGV0IFBsYXllck51bWJlcjsgLy9jdXJyZW50IHBsYXllciBpbmRleCBjb3VudGVyXG5sZXQgY3VycmVudEhhbmQ7IC8vYWN0aXZlIGRpZSBoYW5kXG5sZXQgY3VycmVudFBsYXllcjsgLy8gYWN0aXZlIHBsYXllciA6IHRhYmxlW1BsYXllck51bWJlcl1cbmxldCBsYXN0QmV0ID0gWzAsIDBdO1xubGV0IGJldENvdW50ID0gMDtcbmxldCBkaWNlT25UYWJsZUluZGV4ZWRBcnJheSA9IFswLDAsMCwwLDAsMF07XG5sZXQgbnVtYmVyT2ZEaWUgPSAwO1xubGV0IGNoYWxsZW5nZXI7XG5sZXQgY2hhbGxlbmdlZDtcblxuLy8jIyMjIyMjIyMjIyMjR2FtZSBGdW5jdGlvbnMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IHN0YXJ0R2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgY3JlYXRlSHVtYW5QbGF5ZXIoaW5pdGlhbFZhbHVlcyk7XG4gICAgY3JlYXRlQWlQbGF5ZXJzKGluaXRpYWxWYWx1ZXNbMV0pO1xuICAgIHRhYmxlWzBdLnBsYXllciA9IHRydWU7XG59O1xuXG5jb25zdCBjcmVhdGVIdW1hblBsYXllciA9IChpbml0aWFsVmFsdWVzKT0+e1xuICAgIGxldCBodW1hbiA9IG5ldyBQbGF5ZXIoaW5pdGlhbFZhbHVlc1swXSk7XG4gICAgaHVtYW4uYWRkVG9UYWJsZSh0YWJsZSk7XG59O1xuXG5jb25zdCBnZXRHYW1lU2V0dGluZ3MgPSAoKT0+e1xuICAgIGxldCBuYW1lID0gbmFtZUlucHV0LnZhbHVlO1xuICAgIGlmICgxMCA+IHBsYXllcnNJbnB1dC52YWx1ZSA+IDApe1xuICAgICAgICBsZXQgbnVtUGxheWVycyA9IHBsYXllcnNJbnB1dC52YWx1ZTtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtzdWJtaXQsIHBsYXllcnNJbnB1dCwgbmFtZUlucHV0XSk7XG4gICAgICAgIHJldHVybiAoW25hbWUsIG51bVBsYXllcnNdKTtcbiAgICB9cmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgZ2V0UmFuZG9tTmFtZSA9ICgpPT4ge1xuICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLmZsb29yKG5hbWVzLmxlbmd0aCkpO1xuICAgICAgICBsZXQgbmFtZSA9IG5hbWVzW2luZGV4XTtcbiAgICAgICAgbmFtZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIG5hbWU7XG59O1xuXG5jb25zdCBjcmVhdGVBaVBsYXllcnMgPSAobnVtKT0+e1xuICAgIGZvciAobGV0IGkgPTA7IGkgPG51bTsgaSsrKXtcbiAgICAgICAgbGV0IHggPSBuZXcgUGxheWVyKCk7XG4gICAgICAgIHguYWRkVG9UYWJsZSgpO1xuICAgIH1cbn07XG5cbi8vUGxheWVyIHNldCB1cFxuY29uc3Qgc2V0VXBOZXh0UGxheWVyID0gKCkgPT4ge1xuICAgZ2V0TmV4dFBsYXllcigpO1xuICAgZGlzcGxheUVsZW1lbnRzKFtjdXJyZW50UGxheWVyRGlzcGxheSwgY3VycmVudEhhbmREaXNwbGF5XSk7XG4gICBpZiAoY3VycmVudFBsYXllci5wbGF5ZXIgPT09IHRydWUpIHtcbiAgICAgIHNldFVwSHVtYW5UdXJuKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICBzZXRVcEFpVHVybigpO1xuICAgIH1cbn07XG5cbmNvbnN0IHNldFVwSHVtYW5UdXJuID0gKCk9PntcbiAgICBzZXRIVE1MKHRlc3QyLFwiXCIpO1xuICAgIGRpc3BsYXlFbGVtZW50cyhbdGVzdDJdKTtcbiAgICBzZXRIVE1MKGN1cnJlbnRIYW5kRGlzcGxheSwgYDxoMSBjbGFzcz1cInRleHQtYWxpZ25cIj4gWW91ciBIYW5kIGlzOiA8L2gxPmApO1xuICAgIHNldEhUTUwoY3VycmVudFBsYXllckRpc3BsYXksIGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9PC9oMT5gKTtcbiAgICBkaXNwbGF5TGFzdEJldChsYXN0QmV0LCB0ZXN0KTtcbiAgICBkaXNwbGF5RGljZUltYWdlcyhjdXJyZW50SGFuZERpc3BsYXksIGNvbnZlcnRUb0RpY2VJbWFnZXMoY3VycmVudEhhbmQpKTtcbiAgICBkaXNwbGF5QW5kSGlkZShbZGVjbGFyZURpc3BsYXksIGRlY2xhcmVCdXR0b24sIGlucHV0c10sIFtzcG90T25CdXR0b24sIGJsdWZmQnV0dG9uLCBiZXREaXNwbGF5LCBmYWNlRGlzcGxheV0pO1xufTtcblxuXG5jb25zdCBzZXRVcEFpVHVybiA9ICgpPT57XG4gICAgZGlzcGxheUFuZEhpZGUoW3Nwb3RPbkJ1dHRvbiwgYmx1ZmZCdXR0b24sIHBhc3NCdXR0b24sIHJlc3VsdCwgdGVzdF0sIFtjdXJyZW50SGFuZERpc3BsYXldKTtcbiAgICBzZXRIVE1MKHJlc3VsdCwgXCJcIik7XG4gICAgc2V0SFRNTChjdXJyZW50UGxheWVyRGlzcGxheSwgYDxoMSBjbGFzcz1cInRleHQtYWxpZ25cIj4ke2N1cnJlbnRQbGF5ZXIubmFtZX0gaXMgcGxheWluZzwvaDE+YCk7XG4gICAgc2V0SFRNTCh0ZXN0LCBgWW91ciBoYW5kIGlzOmApO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKHRlc3QsIGNvbnZlcnRUb0RpY2VJbWFnZXModGFibGVbMF0uaGFuZCkpO1xuICAgIGxhc3RCZXQgPSBhaVBsYXlzKCk7XG4gICAgcnVuQWlBZ2FpbnN0QWkoKTtcbn07XG5cbmNvbnN0IHJ1bkFpQWdhaW5zdEFpID0gKCk9PntcbiAgICBsZXQgY2hhbGxlbmdlcnMgPSBnZXRDaGFsbGVuZ2VycyhsYXN0QmV0WzBdLCBmYWxzZSwgdGFibGUpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxsZW5nZXJzKTtcbiAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgIGNoYWxsZW5nZWQgPSBjdXJyZW50UGxheWVyO1xuICAgICAgICBoaWRlRWxlbWVudHMoW2JsdWZmQnV0dG9uLCBzcG90T25CdXR0b24sIHBhc3NCdXR0b25dKTtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCgpO1xuICAgIH1lbHNle1xuICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKGZhbHNlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0TmV4dFBsYXllciA9ICgpPT57XG4gICAgY3VycmVudFBsYXllciA9IHRhYmxlW1BsYXllck51bWJlcl07XG4gICAgY3VycmVudEhhbmQgPSBjdXJyZW50UGxheWVyLmhhbmQ7XG59O1xuXG5jb25zdCBmaXJzdFBsYXllciA9ICgpID0+IHtcbiAgICBzZXRVcE5leHRQbGF5ZXIoKTtcbiAgICBQbGF5ZXJOdW1iZXIgKz0gMTtcbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbn07XG5cbmNvbnN0IHJlYWR5TmV4dFBsYXllciA9ICgpID0+IHtcbiAgICBzZXRVcE5leHRQbGF5ZXIoKTtcbiAgICBQbGF5ZXJOdW1iZXIgKz0gMTtcbn07XG5cbmNvbnN0IHJldHVybk5ld1BsYXllck51bWJlciA9ICgpID0+IHtcbiAgICBpZiAoUGxheWVyTnVtYmVyID49IHRhYmxlLmxlbmd0aCB8fCBQbGF5ZXJOdW1iZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBQbGF5ZXJOdW1iZXIgPSAwO1xuICAgIH0gZWxzZSBpZiAoUGxheWVyTnVtYmVyIDwgMCkge1xuICAgICAgICBQbGF5ZXJOdW1iZXIgPSB0YWJsZS5sZW5ndGggLSAxO1xuICAgIH1cbn07XG5cbi8vTkVXIFJPVU5EXG5jb25zdCBzdGFydE5leHRSb3VuZCA9ICgpID0+IHtcbiAgdGFibGUubWFwKHggPT57XG4gICAgeC5yb2xsKCk7XG4gICAgeC5hZGRPY2N1cnJlbmNlcygpO1xuICB9KTtcbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBkaXNwbGF5UGxheWVycyhhdFRhYmxlLCB0YWJsZSk7XG5cbn07XG5cbmNvbnN0IGVuZFJvdW5kID0gKCkgPT4ge1xuICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICBzZXRIVE1MKHRlc3QsIFwiUk9VTkQgT1ZFUlwiKTtcbiAgICBQbGF5ZXJOdW1iZXIgLT0gMTtcbn07XG5cbmNvbnN0IHJlc2V0Um91bmRWYXJpYWJsZXMgPSAoKSA9PiB7XG4gICAgbGFzdEJldCA9IFswLDBdO1xuICAgIGJldENvdW50ID0gMDtcbiAgICBudW1iZXJPZkRpZSA9IDA7XG4gICAgZGljZU9uVGFibGVJbmRleGVkQXJyYXkgPSBbMCwwLDAsMCwwLDBdO1xuICAgIGhpZGVFbGVtZW50cyhbcGFzc0J1dHRvbiwgYmx1ZmZCdXR0b24sIHNwb3RPbkJ1dHRvbiwgbmV4dFBsYXllckJ1dHRvbl0pO1xufTtcblxuXG4vL0dBTUUgUExBWSBGVU5DVElPTlNcbmNvbnN0IGdldEJldFRydXRoID0gKCkgPT4ge1xuICAgIGxldCBmYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgY291bnQgPSBsYXN0QmV0WzFdO1xuICAgIHJldHVybiBkaWNlT25UYWJsZUluZGV4ZWRBcnJheVtmYWNlIC0gMV0gPj0gY291bnQ7XG59O1xuXG5jb25zdCBwcm9jZXNzQmV0VmFsaWRpdHkgPSAoZmFjZSwgY291bnQpID0+IHtcbiAgICBsZXQgYmV0ID0gZ2V0QmV0SWZWYWxpZChmYWNlLCBjb3VudCk7XG4gICAgaWYgKGJldCAhPT0gZmFsc2UpIHtcbiAgICAgICAgbGFzdEJldCA9IGJldDtcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW2ZhY2VEaXNwbGF5XSwgW2RlY2xhcmVEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBpbnB1dHNdKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2V0SFRNTCh0ZXN0MiwgYDxwIGNsYXNzPVwiZGlzcGxheS01IHRleHQtaW5mb1wiPk5vdCBWYWxpZCBJbnB1dDwvcD5gKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRCZXRJZlZhbGlkID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgZmFjZSA9IHBhcnNlSW50KGZhY2UpO1xuICAgIGNvdW50ID0gcGFyc2VJbnQoY291bnQpO1xuICAgIGxldCBsYXN0RmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGxhc3RDb3VudCA9IGxhc3RCZXRbMV07XG5cbiAgICBpZiAoXG4gICAgICAgICggICAoKGZhY2UgPiBsYXN0RmFjZSkgJiYgKGNvdW50ID09PSBsYXN0Q291bnQpKSAmJlxuICAgICAgICAgICAgKChjb3VudCA+IDApICYmICg3ID4gZmFjZSA+IDApKVxuICAgICAgICApXG5cbiAgICAgICAgfHxcblxuICAgICAgICAoKGNvdW50ID4gbGFzdENvdW50KSAmJiAoKGNvdW50ID4gMCkgJiYgKDcgPiBmYWNlICYmIGZhY2UgPiAwKSkpXG4gICAgKSB7XG4gICAgICAgIGJldENvdW50ID0gY291bnQ7XG4gICAgICAgIHJldHVybiBbZmFjZSwgY291bnRdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59Oy8vcmV0dXJuIGlmIGJldCBpcyB2YWxpZFxuXG5jb25zdCBnZXRPcHBvbmVudCA9IChjaGFsbGVuZ2Vycyk9PntcbiAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLmZsb29yKGNoYWxsZW5nZXJzLmxlbmd0aCkpO1xuICAgIHJldHVybiBjaGFsbGVuZ2Vyc1tpbmRleF1cbn07XG5cbmNvbnN0IGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCA9ICgpID0+e1xuICAgIGRpc3BsYXlBbmRIaWRlKFtuZXh0Um91bmRCdXR0b24sIHJlc3VsdF0sIFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgaGFuZGxlQ2hhbGxlbmdlQ2hlY2soZ2V0QmV0VHJ1dGgoKSk7XG5cbn07XG5cbmNvbnN0IGhhbmRsZUNoYWxsZW5nZUNoZWNrID0gKGJldEJvb2xlYW4pPT57XG4gICAgY29uc29sZS5sb2coXCJoYW5kbGUgY2hhbGxlbmdlIGZ1bmN0aW9uIGNhbGxlZFwiKTtcbiAgICBpZihiZXRCb29sZWFuKXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZXIsY2hhbGxlbmdlZCk7XG4gICAgICAgIHNldEhUTUwocmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCIke2NvbG9yfSBkaXNwbGF5LTRcIj4gQ2hhbGxlbmdlIEZhaWxlZCAtPiAke2NoYWxsZW5nZXIubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YCk7XG4gICAgICAgIHJlbW92ZURpZShjaGFsbGVuZ2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQoY2hhbGxlbmdlcik7XG59ZWxzZXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZWQsIGNoYWxsZW5nZXIpO1xuICAgICAgICBzZXRIVE1MKHJlc3VsdCwgYDxkaXYgY2xhc3MgPSBcIiR7Y29sb3J9IGRpc3BsYXktNFwiPiBDaGFsbGVuZ2UgU3VjY2VlZGVkIC0+ICR7Y2hhbGxlbmdlZC5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gKTtcbiAgICAgICAgcmVtb3ZlRGllKGNoYWxsZW5nZWQpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChjaGFsbGVuZ2VkKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRNZXNzYWdlQ29sb3IgPSAobG9zZXIsIHdpbm5lcikgPT57XG4gICAgaWYgKGxvc2VyLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIHJldHVybiBcInRleHQtZGFuZ2VyXCI7XG4gICAgfWVsc2UgaWYod2lubmVyLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIHJldHVybiBcInRleHQtc3VjY2Vzc1wiO1xuICAgIH1yZXR1cm4gXCJcIlxuXG59O1xuXG5jb25zdCBjaGVja1Nwb3RPbiA9ICgpID0+e1xuICAgIHJldHVybiAoZGljZU9uVGFibGVJbmRleGVkQXJyYXlbbGFzdEJldFswXSAtMV0gPT09IGxhc3RCZXRbMV0pXG59O1xuXG5jb25zdCBjaGVja0lmRWxpbWluYXRlZCA9IChiZXRMb3Nlcik9PntcbiAgICBpZiAocmV0dXJuSWZMYXN0RGllKGJldExvc2VyKSl7XG4gICAgICAgIGhhbmRsZUxhc3REaWVMb3N0KGJldExvc2VyKTtcbiAgICAgICAgY2hlY2tGb3JXaW5uZXIoKTtcbiAgICB9XG59O1xuXG5jb25zdCByZW1vdmVEaWUgPSAocGxheWVyKSA9PntcbiAgICBwbGF5ZXIuaGFuZCAgPSBwbGF5ZXIuaGFuZC5zcGxpY2UoMSk7XG59O1xuXG4vL0NvbXB1dGVyIGJldHNcbmNvbnN0IGFpUGxheXMgPSAoKT0+IHtcbiAgICBsZXQgbmV3QmV0ID0gcGxheWVyQmV0KCk7XG4gICAgYmV0Q291bnQgPSBuZXdCZXRbMV07XG4gICAgZGlzcGxheUVsZW1lbnRzKFtiZXREaXNwbGF5XSk7XG4gICAgc2V0SFRNTChiZXREaXNwbGF5LCBgPHAgY2xhc3M9XCJkaXNwbGF5LTRcIj4ke2N1cnJlbnRQbGF5ZXIubmFtZX0gYmV0cyB0aGVyZSBhcmUgPGJyPiAke25ld0JldFsxXX0gPHNwYW4gaWQ9XCJkaWNlXCI+IDwvc3Bhbj5zIG9uIHRoZSB0YWJsZTwvcD5gKTtcbiAgICBsZXQgZGllRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGljZVwiKTtcbiAgICBkaXNwbGF5RGljZUltYWdlcyhkaWVEaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKFtuZXdCZXRbMF1dKSk7XG4gICAgcmV0dXJuIG5ld0JldDtcbn07XG5cbmNvbnN0IGNvdW50RmFjZXMgPSAoaGFuZCkgPT57XG4gICAgbGV0IGN1cnJlbnRIYW5kSW50cyA9IFswLCAwLCAwLCAwLCAwLCAwXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3VycmVudEhhbmRJbnRzW2hhbmRbaV0gLSAxXSArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudEhhbmRJbnRzO1xufTtcbmNvbnN0IHBsYXllckJldCA9ICgpID0+IHtcbiAgICBsZXQgY3VycmVudEhhbmRJbnRzID0gY291bnRGYWNlcyhjdXJyZW50SGFuZCk7XG4gICAgbGV0IGxhcmdlc3RDb3VudCA9IE1hdGgubWF4KC4uLmN1cnJlbnRIYW5kSW50cyk7XG4gICAgbGV0IGJlc3RIYW5kID0gW2N1cnJlbnRIYW5kSW50cy5pbmRleE9mKGxhcmdlc3RDb3VudCkrMSwgbGFyZ2VzdENvdW50XTtcbiAgICByZXR1cm4gYWlCbHVmZihiZXN0SGFuZCk7XG59O1xuXG5jb25zdCBhaUJsdWZmID0gKGJlc3RIYW5kKT0+e1xuICAgIHdoaWxlIChhaUNoZWNrQ3VycmVudEhhbmRWYWxpZGl0eShiZXN0SGFuZCkgIT09IHRydWUpe1xuICAgICAgICBiZXN0SGFuZFsxXSArPSAxO1xuICAgIH1cbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IC4zKXtcbiAgICAgICAgYmVzdEhhbmRbMV0gKz0gMTtcbiAgICAgICAgcmV0dXJuIGJlc3RIYW5kO1xuICAgIH1lbHNle1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IC4xKXtcbiAgICAgICAgICAgIGJlc3RIYW5kWzFdICs9IDI7XG4gICAgICAgICAgICByZXR1cm4gYmVzdEhhbmQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlc3RIYW5kXG59O1xuXG5jb25zdCBhaUNoZWNrQ3VycmVudEhhbmRWYWxpZGl0eSA9IGhhbmQgPT4ge1xuICAgIHJldHVybiAoKGhhbmRbMF0gPiBsYXN0QmV0WzBdICAmJiBoYW5kWzFdID49IGxhc3RCZXRbMV0pIHx8IGhhbmRbMV0gPiBsYXN0QmV0WzFdKVxufTtcblxuY29uc3QgcmV0dXJuSWZMYXN0RGllID0gcGxheWVyID0+IHtcbiAgICByZXR1cm4gcGxheWVyLmhhbmQubGVuZ3RoID09PSAwO1xufTtcblxuY29uc3QgaGFuZGxlTGFzdERpZUxvc3QgPSBwbGF5ZXIgPT57XG4gICAgbGV0IGluZGV4ID0gdGFibGUuaW5kZXhPZihwbGF5ZXIpO1xuICAgIGlmICh0YWJsZVtpbmRleF0ucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtnYW1lT3Zlcl0pO1xuICAgICAgICBzZXRIVE1MKGdhbWVPdmVyLCBcIllPVSBMT1NFXCIpO1xuICAgIH1lbHNle1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgICAgIHNldEhUTUwodGVzdDIsIGA8aDEgY2xhc3M9XCJ0ZXh0LXdhcm5pbmdcIj4ke3BsYXllci5uYW1lfSBoYXMgYmVlbiBlbGltaW5hdGVkPC9oMT5gKTtcbiAgICAgICAgdGFibGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGFibGUpO1xufTtcblxuY29uc3QgY2hlY2tGb3JXaW5uZXIgPSAoKT0+e1xuICAgIGlmICh0YWJsZS5sZW5ndGggPT09IDEpe1xuICAgICAgICBzZXRIVE1MKHJlc3VsdCwgXCJZb3UgV2luIVwiKTtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtnYW1lT3Zlcl0pO1xuICAgIH1cbn07XG5cbi8vR2FtZSBTdGFydCBGdW5jdGlvbnNcbmxldCBjbGVhbkJvYXJkID0gKCkgPT4gaGlkZUVsZW1lbnRzKFtzdWJtaXQsIG5hbWVJbnB1dCwgcGxheWVyc0lucHV0LCBibHVmZkJ1dHRvbixzcG90T25CdXR0b24scGFzc0J1dHRvbixuZXh0Um91bmRCdXR0b24sbmV4dFBsYXllckJ1dHRvbixmYWNlRGlzcGxheSxwbGF5ZXJPcHRpb25zRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgZGVjbGFyZURpc3BsYXksIGlucHV0cywgcmVzdWx0LCBiZXREaXNwbGF5LCBnYW1lT3Zlcl0pO1xubGV0IGdhbWUgPSAoaW5pdGlhbFZhbHVlcykgPT4ge1xuICAgIHN0YXJ0R2FtZShpbml0aWFsVmFsdWVzKTtcbiAgICBzdGFydE5leHRSb3VuZCgpO1xuICAgIGZpcnN0UGxheWVyKCk7XG59O1xuY2xlYW5Cb2FyZCgpO1xuZXZlbnRMaXN0ZW5lcnMoKTtcbiIsImNvbnN0IGdldENoYWxsZW5nZXJzID0gKGZhY2UsIHBsYXllciwgdGFibGUpPT57XG4gICAgbGV0IGNoYWxsZW5nZXJzID0gW107XG4gICAgZm9yIChsZXQgaT0xOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspe1xuICAgICAgICBpZih0YWJsZVtpXS5yZXR1cm5UcnVlSWZBSUNoYWxsZW5nZXMoZmFjZSwgcGxheWVyKSl7XG4gICAgICAgICAgICBpZiAodGFibGVbaV0gIT09IGN1cnJlbnRQbGF5ZXIpe1xuICAgICAgICAgICAgICAgIGNoYWxsZW5nZXJzLnB1c2godGFibGVbaV0pfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJhbmRvbVRydXRoVmFsdWUoLjMpKXtcbiAgICAgICAgcmV0dXJuIGNoYWxsZW5nZXJzO1xuICAgIH1yZXR1cm4gW107XG59O1xuXG5jb25zdCByYW5kb21UcnV0aFZhbHVlID0gcGN0ID0+IE1hdGgucmFuZG9tKCkgPiBwY3Q7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldENoYWxsZW5nZXJzIDogZ2V0Q2hhbGxlbmdlcnMsXG59OyIsIi8vRElDRSBJTUFHRVNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmNvbnN0IGRpZTEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMS5zcmM9XCJpbWFnZXMvZGllMS5wbmdcIjtcblxuY29uc3QgZGllMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWUyLnNyYz1cImltYWdlcy9kaWUyLnBuZ1wiO1xuXG5jb25zdCBkaWUzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTMuc3JjPVwiaW1hZ2VzL2RpZTMucG5nXCI7XG5cbmNvbnN0IGRpZTQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNC5zcmM9XCJpbWFnZXMvZGllNC5wbmdcIjtcblxuY29uc3QgZGllNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU1LnNyYz1cImltYWdlcy9kaWU1LnBuZ1wiO1xuXG5jb25zdCBkaWU2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTYuc3JjPVwiaW1hZ2VzL2RpZTYucG5nXCI7XG5cbmNvbnN0IGRpY2VJbWFnZXMgPSBbZGllMSwgZGllMiwgZGllMywgZGllNCwgZGllNSwgZGllNl07XG5cbi8vR2VuZXJpYyBEaXNwbGF5IEZ1bmN0aW9uc1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jb25zdCBkaXNwbGF5RWxlbWVudHMgPSAoYXJyYXkpPT4ge1xuICAgIGZvciAobGV0IGVsZW1lbnQgPSAwOyBlbGVtZW50IDwgYXJyYXkubGVuZ3RoOyBlbGVtZW50Kyspe1xuICAgICAgICBhcnJheVtlbGVtZW50XS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzt9XG59O1xuXG5jb25zdCBoaWRlRWxlbWVudHMgPSAoYXJyYXkpPT4ge1xuICAgIGZvciAobGV0IGVsZW1lbnQgPSAwOyBlbGVtZW50IDwgYXJyYXkubGVuZ3RoOyBlbGVtZW50Kyspe1xuICAgICAgICBhcnJheVtlbGVtZW50XS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbn07XG5cbmNvbnN0IGRpc3BsYXlBbmRIaWRlID0gKGFycmF5QWRkLCBhcnJheURlbGV0ZSk9PntcbiAgICBkaXNwbGF5RWxlbWVudHMoYXJyYXlBZGQpO1xuICAgIGhpZGVFbGVtZW50cyhhcnJheURlbGV0ZSk7XG59O1xuXG4vL0RpY2UgSW1hZ2UgRnVuY3Rpb25zXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IGNvbnZlcnRUb0RpY2VJbWFnZXMgPSBoYW5kID0+e1xuICAgIGxldCBpbWdIYW5kID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgbGV0IGZhY2UgPSBoYW5kW2ldO1xuICAgICAgICBsZXQgZGljZUltYWdlID0gZGljZUltYWdlc1tmYWNlLTFdLmNsb25lTm9kZSgpO1xuICAgICAgICBpbWdIYW5kLnB1c2goZGljZUltYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIGltZ0hhbmQ7XG59O1xuXG5jb25zdCBkaXNwbGF5RGljZUltYWdlcyA9IChwYXJlbnROb2RlLCBoYW5kSW1hZ2VzKSA9PntcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmRJbWFnZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGhhbmRJbWFnZXNbaV0pO1xuICAgIH1cbn07XG5cbmNvbnN0IGNsZWFySW1hZ2VzID0gcGFyZW50Tm9kZSA9PntcbiAgICB3aGlsZSAocGFyZW50Tm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbiAgICB9XG59O1xuXG5cblxuY29uc3QgZGlzcGxheVBsYXllcnMgPSAoZWxlbWVudCwgdGFibGUpPT57XG4gICAgbGV0IGh0bWwgPSBgPGgzPlBMYXllcnM8L2gzPmA7XG4gICAgZm9yIChsZXQgaSA9MDsgaTx0YWJsZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGh0bWwgKz0gYCR7dGFibGVbaV0ubmFtZX0gLSBEaWNlIExlZnQ6ICR7dGFibGVbaV0uaGFuZC5sZW5ndGh9IDxicj5gXG4gICAgfVxuICAgIHNldEhUTUwoZWxlbWVudCwgaHRtbCk7XG59O1xuXG5jb25zdCBkaXNwbGF5TGFzdEJldCA9IChsYXN0QmV0LCBlbGVtZW50KT0+IHtcbiAgICBpZiAobGFzdEJldFswXSAhPT0gMCkge1xuICAgICAgICBzZXRIVE1MKGVsZW1lbnQsIGA8aDM+TGFzdCBCZXQ6ICR7bGFzdEJldFsxXX0gPC9oMz5gKTtcbiAgICAgICAgZGlzcGxheURpY2VJbWFnZXMoZWxlbWVudCwgY29udmVydFRvRGljZUltYWdlcyhbbGFzdEJldFswXV0pKVxuICAgIH1cbn07XG5cbmNvbnN0IGRpc3BsYXlSb3VuZCA9IChyZXN1bHQpID0+IHtcbiAgICBoaWRlRWxlbWVudHMoW3Jlc3VsdF0pO1xufTtcblxuY29uc3QgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyA9IChjaGFsbGVuZ2UsIGRpc3BsYXksIGNoYWxsZW5nZXIpID0+e1xuICAgIGlmIChjaGFsbGVuZ2Upe1xuICAgICAgICBzZXRIVE1MKGRpc3BsYXksIGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPkNIQUxMRU5HRUQgQlkgJHtjaGFsbGVuZ2VyLm5hbWV9PC9kaXY+YCk7XG4gICAgfWVsc2V7XG4gICAgICAgIHNldEhUTUwoZGlzcGxheSwgYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+Tm8gb25lIGNoYWxsZW5nZXM8L2Rpdj5gKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRIVE1MID0gKGVsZW1lbnQsIGh0bWwpPT57XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xufTtcblxuXG5cbi8vIEVYUE9SVFNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRpc3BsYXlFbGVtZW50cyA6IGRpc3BsYXlFbGVtZW50cyxcbiAgICBoaWRlRWxlbWVudHMgOiBoaWRlRWxlbWVudHMsXG4gICAgZGlzcGxheUFuZEhpZGUgOiBkaXNwbGF5QW5kSGlkZSxcbiAgICBjb252ZXJ0VG9EaWNlSW1hZ2VzIDogY29udmVydFRvRGljZUltYWdlcyxcbiAgICBjbGVhckltYWdlcyA6IGNsZWFySW1hZ2VzLFxuICAgIGRpc3BsYXlEaWNlSW1hZ2VzOiBkaXNwbGF5RGljZUltYWdlcyxcbiAgICBkaXNwbGF5UGxheWVycyA6IGRpc3BsYXlQbGF5ZXJzLFxuICAgIGRpc3BsYXlMYXN0QmV0IDogZGlzcGxheUxhc3RCZXQsXG4gICAgZGlzcGxheVJvdW5kIDogZGlzcGxheVJvdW5kLFxuICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMgOiBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzLFxuICAgIHNldEhUTUwgOiBzZXRIVE1MLFxuXG59O1xuXG5cblxuIl19
