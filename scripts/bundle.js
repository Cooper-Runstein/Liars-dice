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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9kaXNwbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8jIyMjIyMjIyMjIyBJTVBPUlRTICMjIyMjIyMjIyNcbi8vIyMjIyMjRElTUExBWSMjIyMjIyMjI1xuY29uc3QgZGlzcGxheSA9IHJlcXVpcmUoJy4vZGlzcGxheS5qcycpO1xuY29uc3Qge2Rpc3BsYXlFbGVtZW50c30gPSBkaXNwbGF5O1xuY29uc3Qge2hpZGVFbGVtZW50c30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlBbmRIaWRlfSA9IGRpc3BsYXk7XG5jb25zdCB7Y29udmVydFRvRGljZUltYWdlc30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlEaWNlSW1hZ2VzfSA9IGRpc3BsYXk7XG5jb25zdCB7Y2xlYXJJbWFnZXN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5UGxheWVyc30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlMYXN0QmV0fSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheVJvdW5kfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheUNoYWxsZW5nZVN0YXR1c30gPSBkaXNwbGF5O1xuY29uc3Qge3NldEhUTUx9ID0gZGlzcGxheTtcblxuXG4vLyMjIyMjIyMjIyMjRG9jdW1lbnQgYnV0dG9ucyBhbmQgZGlzcGxheXMjIyMjIyMjIyMjIyMjI1xuLy9kaXNwbGF5c1xubGV0IGN1cnJlbnRIYW5kRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3VycmVudEhhbmRcIik7XG5sZXQgY3VycmVudFBsYXllckRpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllckRpc3BsYXlcIik7XG5sZXQgcGxheWVyT3B0aW9uc0Rpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllck9wdGlvbnNcIik7XG5sZXQgdGVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdFwiKTtcbmxldCB0ZXN0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdDJcIik7XG5sZXQgZGVjbGFyZURpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlY2xhcmVEaXNwbGF5XCIpO1xubGV0IGZhY2VEaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmYWNlRGlzcGxheVwiKTtcbmxldCByZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3VsdFwiKTtcbmxldCBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0c1wiKTtcbmxldCBiZXREaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNiZXREaXNwbGF5XCIpO1xubGV0IGdhbWVPdmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lT3ZlclwiKTtcbmNvbnN0IGF0VGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XG5cbi8vQnV0dG9uc1xuY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpO1xuY29uc3QgbmV4dFBsYXllckJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFBsYXllclwiKTtcbmNvbnN0IGJsdWZmQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNibHVmZlwiKTtcbmNvbnN0IHNwb3RPbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3BvdE9uXCIpO1xuY29uc3QgZGVjbGFyZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZVwiKTtcbmNvbnN0IG5leHRSb3VuZEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFJvdW5kXCIpO1xuY29uc3QgZmFjZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhY2UnKTtcbmNvbnN0IGNvdW50SW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnQnKTtcbmNvbnN0IHBhc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzcycpO1xuY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldE5hbWUnKTtcbmNvbnN0IHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xuY29uc3QgcGxheWVyc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnZXRQbGF5ZXJzXCIpO1xuXG4vL0ltYWdlc1xuXG4vL0J1dHRvbiBMaXN0ZW5lcnNcbmNvbnN0IGV2ZW50TGlzdGVuZXJzID0gKCk9PiB7XG4gICAgc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtzdWJtaXQsIHBsYXllcnNJbnB1dCwgbmFtZUlucHV0XSwgW3N0YXJ0QnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBsZXQgZ2FtZUluaXRpYWxWYWx1ZXMgPSBnZXRHYW1lU2V0dGluZ3MoKTtcbiAgICAgICAgaWYoZ2FtZUluaXRpYWxWYWx1ZXMgIT09IGZhbHNlKXtcbiAgICAgICAgICAgIGdhbWUoZ2FtZUluaXRpYWxWYWx1ZXMpO31lbHNle1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBibHVmZkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCh0cnVlKTtcbiAgICAgICAgZW5kUm91bmQoKTtcbiAgICB9KTtcblxuICAgIG5leHRQbGF5ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbbmV4dFBsYXllckJ1dHRvbl0pO1xuICAgICAgICBjbGVhckltYWdlcyhjdXJyZW50SGFuZERpc3BsYXkpO1xuICAgICAgICByZWFkeU5leHRQbGF5ZXIoKTtcbiAgICAgICAgcmV0dXJuTmV3UGxheWVyTnVtYmVyKCk7XG4gICAgfSk7XG5cbiAgICBuZXh0Um91bmRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbbmV4dFJvdW5kQnV0dG9uLCB0ZXN0LCB0ZXN0Ml0pO1xuICAgICAgICByZXNldFJvdW5kVmFyaWFibGVzKCk7XG4gICAgICAgIGRpc3BsYXlSb3VuZChyZXN1bHQpO1xuICAgICAgICBzdGFydE5leHRSb3VuZCgpO1xuICAgICAgICBmaXJzdFBsYXllcigpO1xuICAgIH0pO1xuXG4gICAgZGVjbGFyZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYocHJvY2Vzc0JldFZhbGlkaXR5KGZhY2VJbnB1dC52YWx1ZSwgY291bnRJbnB1dC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVjbGFyZWJ1dHRvbiB2YWxpZGF0ZWRcIik7XG4gICAgICAgICAgICBsZXQgY2hhbGxlbmdlcnMgPSBnZXRDaGFsbGVuZ2VycyhmYWNlSW5wdXQudmFsdWUsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICAgICAgICAgICBjaGFsbGVuZ2VkID0gdGFibGVbMF07XG4gICAgICAgICAgICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICAgICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQoKTtcbiAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKGZhbHNlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgICAgICB9XG4gICAgIH1cbiAgICB9KTtcblxuICAgIHBhc3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbbmV4dFBsYXllckJ1dHRvbl0sIFtwYXNzQnV0dG9uLCBibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzcG90T25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTcG90T24gY2FsbGVkJyk7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGxldCBsb3NlcjtcbiAgICAgICAgaWYoY2hlY2tTcG90T24oKSl7XG4gICAgICAgICAgc2V0SFRNTChyZXN1bHQsIGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIFRydWUgLT4gJHtjaGFsbGVuZ2VkLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmApO1xuICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZWQ7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgc2V0SFRNTChyZXN1bHQsIGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIEZhbHNlLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmApO1xuICAgICAgICAgICAgbG9zZXIgPSBjaGFsbGVuZ2VyO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZURpZShsb3Nlcik7XG4gICAgICAgIGNoZWNrSWZFbGltaW5hdGVkKGxvc2VyKTtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtyZXN1bHQsIG5leHRSb3VuZEJ1dHRvbl0pO1xuICAgICAgICBlbmRSb3VuZCgpO1xuICAgIH0pO1xuXG59O1xuXG5sZXQgbmFtZXMgPSBbXG4gICAgXCJTaGlybGVlblwiLCBcIkthcmFcIiwgXCJDbGV2ZWxhbmRcIixcIk1lcnJpXCIsIFwiQ29uY2VwdGlvblwiLCBcIkhhbGV5XCIsIFwiRmxvcmFuY2VcIiwgXCJEb3JpZVwiLCBcIkx1ZWxsYVwiLCBcIlZlcm5pYVwiLFxuICAgIFwiRnJlZW1hblwiLCBcIkthdGhhcmluYVwiLCBcIkNoYXJtYWluXCIsIFwiR3JhaGFtXCIsIFwiRGFybmVsbFwiLCBcIkJlcm5ldHRhXCIsIFwiSW5lbGxcIiwgXCJQYWdlXCIsIFwiR2FybmV0dFwiLCBcIkFubmFsaXNhXCIsXG4gICAgXCJCcmFudFwiLCBcIlZhbGRhXCIsIFwiVmlraVwiLCBcIkFzdW5jaW9uXCIsIFwiTW9pcmFcIiwgXCJLYXljZWVcIiwgXCJSaWNoZWxsZVwiLCBcIkVsaWNpYVwiLCBcIkVuZWlkYVwiLCBcIkV2ZWx5bm5cIlxuXTtcblxuLy9PQkpFQ1RTXG5jbGFzcyBQbGF5ZXJ7XG4gICAgY29uc3RydWN0b3IobmFtZSlcbiAgICB7XG4gICAgICAgIHRoaXMucGxheWVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgZ2V0UmFuZG9tTmFtZSgpO1xuICAgICAgICB0aGlzLmhhbmQgPSBbMCwwLDAsMF07XG4gICAgICAgIHRoaXMucm9sbCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZCA9IHRoaXMuaGFuZC5tYXAoXG4gICAgICAgICAgICAgICAgKCkgPT4gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpICsgMSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9IGhhcyByb2xsZWRgKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRUb1RhYmxlID0gKCkgPT4ge1xuICAgICAgICAgICAgdGFibGUucHVzaCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRPY2N1cnJlbmNlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5oYW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZGljZU9uVGFibGVJbmRleGVkQXJyYXlbdGhpcy5oYW5kW2ldIC0gMV0gKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG51bWJlck9mRGllICs9IHRoaXMuaGFuZC5sZW5ndGg7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmV0dXJuVHJ1ZUlmQUlDaGFsbGVuZ2VzID0gKGZhY2UsIHBsYXllcikgPT4ge1xuICAgICAgICAgICAgbGV0IHBsYXllck51bSA9IGdldEZhY2VDb3VudCh0aGlzLCBmYWNlKTtcbiAgICAgICAgICAgIGxldCBwY3QgPSBkaWVSYXRpbyhwbGF5ZXJOdW0pOyAvLyBnZXQgbnVtZXJpY2FsIHByb2JhYmlsaXR5IG9mIGJldCB0cnV0aHluZXNzXG4gICAgICAgICAgICBpZiAocGxheWVyID09PSB0cnVlKXsgLy9pbmNyZWFzZSBjaGFsbGVuZ2UgY2hhbmNlIGlmIGh1bWFuIGlzIGJldHRpbmdcbiAgICAgICAgICAgICAgICBwY3QgKz0gKDEvMTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBjdCA8PSAoMSAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfWVsc2UgaWYgKHBjdCA8PSAoMiAvIDEyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjJcbiAgICAgICAgICAgIH1lbHNlIGlmIChwY3QgPD0gKDQgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjNcbiAgICAgICAgICAgIH1lbHNlIGlmKHBjdCA8PSAoNSAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuNVxuICAgICAgICAgICAgfWVsc2UgaWYocGN0IDw9ICg2IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC43XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxufX1cblxubGV0IGdldEZhY2VDb3VudCA9IChwbGF5ZXIsIGZhY2UpPT57IC8vY291bnRzIGluZGl2aWR1YWxzIGluc3RhbmNlcyBvZiBhIGZhY2VcbiAgICBsZXQgYXJyID0gY291bnRGYWNlcyhwbGF5ZXIuaGFuZCk7XG4gICAgcmV0dXJuIGFycltmYWNlLTFdO1xufTtcblxubGV0IGRpZVJhdGlvID0gKHBsYXllck51bSkgPT4geyAvL3JldHVybiBwcm9wIG9mIHRydXRoeW5lc3NcbiAgICByZXR1cm4gKGJldENvdW50LXBsYXllck51bSkvbnVtYmVyT2ZEaWU7XG59O1xuXG4vL01haW4gVmFyaWFibGVzXG5sZXQgdGFibGUgPSBbXTsgLy9hcnJheSB0byBob2xkIHBsYXllcnNcbmxldCBQbGF5ZXJOdW1iZXI7IC8vY3VycmVudCBwbGF5ZXIgaW5kZXggY291bnRlclxubGV0IGN1cnJlbnRIYW5kOyAvL2FjdGl2ZSBkaWUgaGFuZFxubGV0IGN1cnJlbnRQbGF5ZXI7IC8vIGFjdGl2ZSBwbGF5ZXIgOiB0YWJsZVtQbGF5ZXJOdW1iZXJdXG5sZXQgbGFzdEJldCA9IFswLCAwXTtcbmxldCBiZXRDb3VudCA9IDA7XG5sZXQgZGljZU9uVGFibGVJbmRleGVkQXJyYXkgPSBbMCwwLDAsMCwwLDBdO1xubGV0IG51bWJlck9mRGllID0gMDtcbmxldCBjaGFsbGVuZ2VyO1xubGV0IGNoYWxsZW5nZWQ7XG5cbi8vIyMjIyMjIyMjIyMjI0dhbWUgRnVuY3Rpb25zIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jb25zdCBzdGFydEdhbWUgPSAoaW5pdGlhbFZhbHVlcykgPT4ge1xuICAgIGNyZWF0ZUh1bWFuUGxheWVyKGluaXRpYWxWYWx1ZXMpO1xuICAgIGNyZWF0ZUFpUGxheWVycyhpbml0aWFsVmFsdWVzWzFdKTtcbiAgICB0YWJsZVswXS5wbGF5ZXIgPSB0cnVlO1xufTtcblxuY29uc3QgY3JlYXRlSHVtYW5QbGF5ZXIgPSAoaW5pdGlhbFZhbHVlcyk9PntcbiAgICBsZXQgaHVtYW4gPSBuZXcgUGxheWVyKGluaXRpYWxWYWx1ZXNbMF0pO1xuICAgIGh1bWFuLmFkZFRvVGFibGUodGFibGUpO1xufTtcblxuY29uc3QgZ2V0R2FtZVNldHRpbmdzID0gKCk9PntcbiAgICBsZXQgbmFtZSA9IG5hbWVJbnB1dC52YWx1ZTtcbiAgICBpZiAoMTAgPiBwbGF5ZXJzSW5wdXQudmFsdWUgPiAwKXtcbiAgICAgICAgbGV0IG51bVBsYXllcnMgPSBwbGF5ZXJzSW5wdXQudmFsdWU7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbc3VibWl0LCBwbGF5ZXJzSW5wdXQsIG5hbWVJbnB1dF0pO1xuICAgICAgICByZXR1cm4gKFtuYW1lLCBudW1QbGF5ZXJzXSk7XG4gICAgfXJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJhbmRvbU5hbWUgPSAoKT0+IHtcbiAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihuYW1lcy5sZW5ndGgpKTtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpbmRleF07XG4gICAgICAgIG5hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xufTtcblxuY29uc3QgY3JlYXRlQWlQbGF5ZXJzID0gKG51bSk9PntcbiAgICBmb3IgKGxldCBpID0wOyBpIDxudW07IGkrKyl7XG4gICAgICAgIGxldCB4ID0gbmV3IFBsYXllcigpO1xuICAgICAgICB4LmFkZFRvVGFibGUoKTtcbiAgICB9XG59O1xuXG4vL1BsYXllciBzZXQgdXBcbmNvbnN0IHNldFVwTmV4dFBsYXllciA9ICgpID0+IHtcbiAgIGdldE5leHRQbGF5ZXIoKTtcbiAgIGRpc3BsYXlFbGVtZW50cyhbY3VycmVudFBsYXllckRpc3BsYXksIGN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxheWVyID09PSB0cnVlKSB7XG4gICAgICBzZXRVcEh1bWFuVHVybigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgc2V0VXBBaVR1cm4oKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRVcEh1bWFuVHVybiA9ICgpPT57XG4gICAgc2V0SFRNTCh0ZXN0MixcIlwiKTtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgc2V0SFRNTChjdXJyZW50SGFuZERpc3BsYXksIGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+IFlvdXIgSGFuZCBpczogPC9oMT5gKTtcbiAgICBzZXRIVE1MKGN1cnJlbnRQbGF5ZXJEaXNwbGF5LCBgPGgxIGNsYXNzPVwidGV4dC1hbGlnblwiPiR7Y3VycmVudFBsYXllci5uYW1lfTwvaDE+YCk7XG4gICAgZGlzcGxheUxhc3RCZXQobGFzdEJldCwgdGVzdCk7XG4gICAgZGlzcGxheURpY2VJbWFnZXMoY3VycmVudEhhbmREaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKGN1cnJlbnRIYW5kKSk7XG4gICAgZGlzcGxheUFuZEhpZGUoW2RlY2xhcmVEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBpbnB1dHNdLCBbc3BvdE9uQnV0dG9uLCBibHVmZkJ1dHRvbiwgYmV0RGlzcGxheSwgZmFjZURpc3BsYXldKTtcbn07XG5cblxuY29uc3Qgc2V0VXBBaVR1cm4gPSAoKT0+e1xuICAgIGRpc3BsYXlBbmRIaWRlKFtzcG90T25CdXR0b24sIGJsdWZmQnV0dG9uLCBwYXNzQnV0dG9uLCByZXN1bHQsIHRlc3RdLCBbY3VycmVudEhhbmREaXNwbGF5XSk7XG4gICAgc2V0SFRNTChyZXN1bHQsIFwiXCIpO1xuICAgIHNldEhUTUwoY3VycmVudFBsYXllckRpc3BsYXksIGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+JHtjdXJyZW50UGxheWVyLm5hbWV9IGlzIHBsYXlpbmc8L2gxPmApO1xuICAgIHNldEhUTUwodGVzdCwgYFlvdXIgaGFuZCBpczpgKTtcbiAgICBkaXNwbGF5RGljZUltYWdlcyh0ZXN0LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKHRhYmxlWzBdLmhhbmQpKTtcbiAgICBsYXN0QmV0ID0gYWlQbGF5cygpO1xuICAgIHJ1bkFpQWdhaW5zdEFpKCk7XG59O1xuXG5jb25zdCBydW5BaUFnYWluc3RBaSA9ICgpPT57XG4gICAgbGV0IGNoYWxsZW5nZXJzID0gZ2V0Q2hhbGxlbmdlcnMobGFzdEJldFswXSwgZmFsc2UpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxsZW5nZXJzKTtcbiAgICBpZiAoY2hhbGxlbmdlcnMubGVuZ3RoID4gMCl7XG4gICAgICAgIGNoYWxsZW5nZXIgPSBnZXRPcHBvbmVudChjaGFsbGVuZ2Vycyk7XG4gICAgICAgIGNoYWxsZW5nZWQgPSBjdXJyZW50UGxheWVyO1xuICAgICAgICBoaWRlRWxlbWVudHMoW2JsdWZmQnV0dG9uLCBzcG90T25CdXR0b24sIHBhc3NCdXR0b25dKTtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCgpO1xuICAgIH1lbHNle1xuICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKGZhbHNlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0TmV4dFBsYXllciA9ICgpPT57XG4gICAgY3VycmVudFBsYXllciA9IHRhYmxlW1BsYXllck51bWJlcl07XG4gICAgY3VycmVudEhhbmQgPSBjdXJyZW50UGxheWVyLmhhbmQ7XG59O1xuXG5jb25zdCBmaXJzdFBsYXllciA9ICgpID0+IHtcbiAgICBzZXRVcE5leHRQbGF5ZXIoKTtcbiAgICBQbGF5ZXJOdW1iZXIgKz0gMTtcbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbn07XG5cbmNvbnN0IHJlYWR5TmV4dFBsYXllciA9ICgpID0+IHtcbiAgICBzZXRVcE5leHRQbGF5ZXIoKTtcbiAgICBQbGF5ZXJOdW1iZXIgKz0gMTtcbn07XG5cbmNvbnN0IHJldHVybk5ld1BsYXllck51bWJlciA9ICgpID0+IHtcbiAgICBpZiAoUGxheWVyTnVtYmVyID49IHRhYmxlLmxlbmd0aCB8fCBQbGF5ZXJOdW1iZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBQbGF5ZXJOdW1iZXIgPSAwO1xuICAgIH0gZWxzZSBpZiAoUGxheWVyTnVtYmVyIDwgMCkge1xuICAgICAgICBQbGF5ZXJOdW1iZXIgPSB0YWJsZS5sZW5ndGggLSAxO1xuICAgIH1cbn07XG5cbi8vTkVXIFJPVU5EXG5jb25zdCBzdGFydE5leHRSb3VuZCA9ICgpID0+IHtcbiAgdGFibGUubWFwKHggPT57XG4gICAgeC5yb2xsKCk7XG4gICAgeC5hZGRPY2N1cnJlbmNlcygpO1xuICB9KTtcbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBkaXNwbGF5UGxheWVycyhhdFRhYmxlLCB0YWJsZSk7XG5cbn07XG5cbmNvbnN0IGVuZFJvdW5kID0gKCkgPT4ge1xuICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICBzZXRIVE1MKHRlc3QsIFwiUk9VTkQgT1ZFUlwiKTtcbiAgICBQbGF5ZXJOdW1iZXIgLT0gMTtcbn07XG5cbmNvbnN0IHJlc2V0Um91bmRWYXJpYWJsZXMgPSAoKSA9PiB7XG4gICAgbGFzdEJldCA9IFswLDBdO1xuICAgIGJldENvdW50ID0gMDtcbiAgICBudW1iZXJPZkRpZSA9IDA7XG4gICAgZGljZU9uVGFibGVJbmRleGVkQXJyYXkgPSBbMCwwLDAsMCwwLDBdO1xuICAgIGhpZGVFbGVtZW50cyhbcGFzc0J1dHRvbiwgYmx1ZmZCdXR0b24sIHNwb3RPbkJ1dHRvbiwgbmV4dFBsYXllckJ1dHRvbl0pO1xufTtcblxuXG4vL0dBTUUgUExBWSBGVU5DVElPTlNcbmNvbnN0IGdldEJldFRydXRoID0gKCkgPT4ge1xuICAgIGxldCBmYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgY291bnQgPSBsYXN0QmV0WzFdO1xuICAgIGNvbnNvbGUubG9nKGRpY2VPblRhYmxlSW5kZXhlZEFycmF5KTtcbiAgICByZXR1cm4gZGljZU9uVGFibGVJbmRleGVkQXJyYXlbZmFjZSAtIDFdID49IGNvdW50O1xufTtcblxuY29uc3QgcHJvY2Vzc0JldFZhbGlkaXR5ID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgbGV0IGJldCA9IGdldEJldElmVmFsaWQoZmFjZSwgY291bnQpO1xuICAgIGlmIChiZXQgIT09IGZhbHNlKSB7XG4gICAgICAgIGxhc3RCZXQgPSBiZXQ7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtmYWNlRGlzcGxheV0sIFtkZWNsYXJlRGlzcGxheSwgZGVjbGFyZUJ1dHRvbiwgaW5wdXRzXSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRlc3QyLmlubmVySFRNTCA9IGA8cCBjbGFzcz1cImRpc3BsYXktNSB0ZXh0LWluZm9cIj5Ob3QgVmFsaWQgSW5wdXQ8L3A+YDtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRCZXRJZlZhbGlkID0gKGZhY2UsIGNvdW50KSA9PiB7XG4gICAgZmFjZSA9IHBhcnNlSW50KGZhY2UpO1xuICAgIGNvdW50ID0gcGFyc2VJbnQoY291bnQpO1xuICAgIGxldCBsYXN0RmFjZSA9IGxhc3RCZXRbMF07XG4gICAgbGV0IGxhc3RDb3VudCA9IGxhc3RCZXRbMV07XG5cbiAgICBpZiAoXG4gICAgICAgICggICAoKGZhY2UgPiBsYXN0RmFjZSkgJiYgKGNvdW50ID09PSBsYXN0Q291bnQpKSAmJlxuICAgICAgICAgICAgKChjb3VudCA+IDApICYmICg3ID4gZmFjZSA+IDApKVxuICAgICAgICApXG5cbiAgICAgICAgfHxcblxuICAgICAgICAoKGNvdW50ID4gbGFzdENvdW50KSAmJiAoKGNvdW50ID4gMCkgJiYgKDcgPiBmYWNlICYmIGZhY2UgPiAwKSkpXG4gICAgKSB7XG4gICAgICAgIGJldENvdW50ID0gY291bnQ7XG4gICAgICAgIHJldHVybiBbZmFjZSwgY291bnRdO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59Oy8vcmV0dXJuIGlmIGJldCBpcyB2YWxpZFxuXG5jb25zdCBnZXRDaGFsbGVuZ2VycyA9IChmYWNlLCBwbGF5ZXIpPT57XG4gICAgbGV0IGNoYWxsZW5nZXJzID0gW107XG4gICAgZm9yIChsZXQgaT0xOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspe1xuICAgICAgICBpZih0YWJsZVtpXS5yZXR1cm5UcnVlSWZBSUNoYWxsZW5nZXMoZmFjZSwgcGxheWVyKSl7XG4gICAgICAgICAgICBpZiAodGFibGVbaV0gIT09IGN1cnJlbnRQbGF5ZXIpe1xuICAgICAgICAgICAgY2hhbGxlbmdlcnMucHVzaCh0YWJsZVtpXSl9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coYFBvc3NpYmxlIENoYWxsZW5nZXJzOiAke2NoYWxsZW5nZXJzfWApO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gLjMpe1xuICAgIHJldHVybiBjaGFsbGVuZ2VycztcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG59O1xuXG5jb25zdCBnZXRPcHBvbmVudCA9IChjaGFsbGVuZ2Vycyk9PntcbiAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLmZsb29yKGNoYWxsZW5nZXJzLmxlbmd0aCkpO1xuXG4gICAgY29uc29sZS5sb2coY2hhbGxlbmdlcnNbaW5kZXhdKTtcbiAgICByZXR1cm4gY2hhbGxlbmdlcnNbaW5kZXhdXG59O1xuXG5jb25zdCBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQgPSAoKSA9PntcbiAgICBkaXNwbGF5QW5kSGlkZShbbmV4dFJvdW5kQnV0dG9uLCByZXN1bHRdLCBbbmV4dFBsYXllckJ1dHRvbl0pO1xuICAgIGhhbmRsZUNoYWxsZW5nZUNoZWNrKGdldEJldFRydXRoKCkpO1xuXG59O1xuXG5jb25zdCBoYW5kbGVDaGFsbGVuZ2VDaGVjayA9IChiZXRCb29sZWFuKT0+e1xuICAgIGNvbnNvbGUubG9nKFwiaGFuZGxlIGNoYWxsZW5nZSBmdW5jdGlvbiBjYWxsZWRcIik7XG4gICAgaWYoYmV0Qm9vbGVhbil7XG4gICAgICAgIGxldCBjb2xvciA9IGdldE1lc3NhZ2VDb2xvcihjaGFsbGVuZ2VyLGNoYWxsZW5nZWQpO1xuICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3MgPSBcIiR7Y29sb3J9IGRpc3BsYXktNFwiPiBDaGFsbGVuZ2UgRmFpbGVkIC0+ICR7Y2hhbGxlbmdlci5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gO1xuICAgICAgICByZW1vdmVEaWUoY2hhbGxlbmdlcik7XG4gICAgICAgIGNoZWNrSWZFbGltaW5hdGVkKGNoYWxsZW5nZXIpO1xufWVsc2V7XG4gICAgICAgIGxldCBjb2xvciA9IGdldE1lc3NhZ2VDb2xvcihjaGFsbGVuZ2VkLCBjaGFsbGVuZ2VyKTtcbiAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzID0gXCIke2NvbG9yfSBkaXNwbGF5LTRcIj4gQ2hhbGxlbmdlIFN1Y2NlZWRlZCAtPiAke2NoYWxsZW5nZWQubmFtZX0gbG9zZXMgYSBkaWUgPC9kaXY+YDtcbiAgICAgICAgcmVtb3ZlRGllKGNoYWxsZW5nZWQpO1xuICAgICAgICBjaGVja0lmRWxpbWluYXRlZChjaGFsbGVuZ2VkKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRNZXNzYWdlQ29sb3IgPSAobG9zZXIsIHdpbm5lcikgPT57XG4gICAgaWYgKGxvc2VyLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIHJldHVybiBcInRleHQtZGFuZ2VyXCI7XG4gICAgfWVsc2UgaWYod2lubmVyLnBsYXllciA9PT0gdHJ1ZSl7XG4gICAgICAgIHJldHVybiBcInRleHQtc3VjY2Vzc1wiO1xuICAgIH1yZXR1cm4gXCJcIlxuXG59O1xuXG5jb25zdCBjaGVja1Nwb3RPbiA9ICgpID0+e1xuICAgIHJldHVybiAoZGljZU9uVGFibGVJbmRleGVkQXJyYXlbbGFzdEJldFswXSAtMV0gPT09IGxhc3RCZXRbMV0pXG59O1xuXG5jb25zdCBjaGVja0lmRWxpbWluYXRlZCA9IChiZXRMb3Nlcik9PntcbiAgICBpZiAocmV0dXJuSWZMYXN0RGllKGJldExvc2VyKSl7XG4gICAgICAgIGhhbmRsZUxhc3REaWVMb3N0KGJldExvc2VyKTtcbiAgICAgICAgY2hlY2tGb3JXaW5uZXIoKTtcbiAgICB9XG59O1xuXG5jb25zdCByZW1vdmVEaWUgPSAocGxheWVyKSA9PntcbiAgICBwbGF5ZXIuaGFuZCAgPSBwbGF5ZXIuaGFuZC5zcGxpY2UoMSk7XG59O1xuXG4vL0NvbXB1dGVyIGJldHNcbmNvbnN0IGFpUGxheXMgPSAoKT0+IHtcbiAgICBsZXQgbmV3QmV0ID0gcGxheWVyQmV0KCk7XG4gICAgYmV0Q291bnQgPSBuZXdCZXRbMV07XG4gICAgZGlzcGxheUVsZW1lbnRzKFtiZXREaXNwbGF5XSk7XG4gICAgYmV0RGlzcGxheS5pbm5lckhUTUwgPSBgPHAgY2xhc3M9XCJkaXNwbGF5LTRcIj4ke2N1cnJlbnRQbGF5ZXIubmFtZX0gYmV0cyB0aGVyZSBhcmUgPGJyPiAke25ld0JldFsxXX0gPHNwYW4gaWQ9XCJkaWNlXCI+IDwvc3Bhbj5zIG9uIHRoZSB0YWJsZTwvcD5gO1xuICAgIGxldCBkaWVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaWNlXCIpO1xuICAgIGRpc3BsYXlEaWNlSW1hZ2VzKGRpZURpc3BsYXksIGNvbnZlcnRUb0RpY2VJbWFnZXMoW25ld0JldFswXV0pKTtcbiAgICByZXR1cm4gbmV3QmV0O1xufTtcblxuY29uc3QgY291bnRGYWNlcyA9IChoYW5kKSA9PntcbiAgICBsZXQgY3VycmVudEhhbmRJbnRzID0gWzAsIDAsIDAsIDAsIDAsIDBdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjdXJyZW50SGFuZEludHNbaGFuZFtpXSAtIDFdICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50SGFuZEludHM7XG59O1xuY29uc3QgcGxheWVyQmV0ID0gKCkgPT4ge1xuICAgIGxldCBjdXJyZW50SGFuZEludHMgPSBjb3VudEZhY2VzKGN1cnJlbnRIYW5kKTtcbiAgICBsZXQgbGFyZ2VzdENvdW50ID0gTWF0aC5tYXgoLi4uY3VycmVudEhhbmRJbnRzKTtcbiAgICBsZXQgYmVzdEhhbmQgPSBbY3VycmVudEhhbmRJbnRzLmluZGV4T2YobGFyZ2VzdENvdW50KSsxLCBsYXJnZXN0Q291bnRdO1xuICAgIHJldHVybiBhaUJsdWZmKGJlc3RIYW5kKTtcbn07XG5cbmNvbnN0IGFpQmx1ZmYgPSAoYmVzdEhhbmQpPT57XG4gICAgd2hpbGUgKGFpQ2hlY2tDdXJyZW50SGFuZFZhbGlkaXR5KGJlc3RIYW5kKSAhPT0gdHJ1ZSl7XG4gICAgICAgIGJlc3RIYW5kWzFdICs9IDE7XG4gICAgfVxuICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgLjMpe1xuICAgICAgICBiZXN0SGFuZFsxXSArPSAxO1xuICAgICAgICByZXR1cm4gYmVzdEhhbmQ7XG4gICAgfWVsc2V7XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgLjEpe1xuICAgICAgICAgICAgYmVzdEhhbmRbMV0gKz0gMjtcbiAgICAgICAgICAgIHJldHVybiBiZXN0SGFuZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmVzdEhhbmRcbn07XG5cbmNvbnN0IGFpQ2hlY2tDdXJyZW50SGFuZFZhbGlkaXR5ID0gaGFuZCA9PiB7XG4gICAgcmV0dXJuICgoaGFuZFswXSA+IGxhc3RCZXRbMF0gICYmIGhhbmRbMV0gPj0gbGFzdEJldFsxXSkgfHwgaGFuZFsxXSA+IGxhc3RCZXRbMV0pXG59O1xuXG5jb25zdCByZXR1cm5JZkxhc3REaWUgPSBwbGF5ZXIgPT4ge1xuICAgIHJldHVybiBwbGF5ZXIuaGFuZC5sZW5ndGggPT09IDA7XG59O1xuXG5jb25zdCBoYW5kbGVMYXN0RGllTG9zdCA9IHBsYXllciA9PntcbiAgICBjb25zb2xlLmxvZyhgSGFuZGxpbmcgbGFzdCBkaWNlIG9mICR7cGxheWVyLm5hbWV9YCk7XG4gICAgbGV0IGluZGV4ID0gdGFibGUuaW5kZXhPZihwbGF5ZXIpO1xuICAgIGNvbnNvbGUubG9nKGluZGV4KTtcbiAgICBjb25zb2xlLmxvZyh0YWJsZVtpbmRleF0pO1xuICAgIGlmICh0YWJsZVtpbmRleF0ucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtnYW1lT3Zlcl0pO1xuICAgICAgICBnYW1lT3Zlci5pbm5lckhUTUw9XCJZT1UgTE9TRVwiXG4gICAgfWVsc2V7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbdGVzdDJdKTtcbiAgICAgICAgdGVzdDIuaW5uZXJIVE1MID0gYDxoMSBjbGFzcz1cInRleHQtd2FybmluZ1wiPiR7cGxheWVyLm5hbWV9IGhhcyBiZWVuIGVsaW1pbmF0ZWQ8L2gxPmA7XG4gICAgICAgIHRhYmxlLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRhYmxlKTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yV2lubmVyID0gKCk9PntcbiAgICBpZiAodGFibGUubGVuZ3RoID09PSAxKXtcbiAgICAgICAgY29uc29sZS5sb2coJyMjIyMjIyMjR0FNRSBPVkVSIyMjIyMjIyMjIyMnKTtcbiAgICAgICAgcmVzdWx0LmlubmVySFRNTCA9IFwiWU9VIFdJTlwiO1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW2dhbWVPdmVyXSk7XG4gICAgfVxufTtcblxuLy9HYW1lIFN0YXJ0IEZ1bmN0aW9uc1xubGV0IGNsZWFuQm9hcmQgPSAoKSA9PiBoaWRlRWxlbWVudHMoW3N1Ym1pdCwgbmFtZUlucHV0LCBwbGF5ZXJzSW5wdXQsIGJsdWZmQnV0dG9uLHNwb3RPbkJ1dHRvbixwYXNzQnV0dG9uLG5leHRSb3VuZEJ1dHRvbixuZXh0UGxheWVyQnV0dG9uLGZhY2VEaXNwbGF5LHBsYXllck9wdGlvbnNEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBkZWNsYXJlRGlzcGxheSwgaW5wdXRzLCByZXN1bHQsIGJldERpc3BsYXksIGdhbWVPdmVyXSk7XG5sZXQgZ2FtZSA9IChpbml0aWFsVmFsdWVzKSA9PiB7XG4gICAgc3RhcnRHYW1lKGluaXRpYWxWYWx1ZXMpO1xuICAgIHN0YXJ0TmV4dFJvdW5kKCk7XG4gICAgZmlyc3RQbGF5ZXIoKTtcbn07XG5jbGVhbkJvYXJkKCk7XG5ldmVudExpc3RlbmVycygpO1xuIiwiLy9ESUNFIElNQUdFU1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xuY29uc3QgZGllMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWUxLnNyYz1cImltYWdlcy9kaWUxLnBuZ1wiO1xuXG5jb25zdCBkaWUyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTIuc3JjPVwiaW1hZ2VzL2RpZTIucG5nXCI7XG5cbmNvbnN0IGRpZTMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMy5zcmM9XCJpbWFnZXMvZGllMy5wbmdcIjtcblxuY29uc3QgZGllNCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU0LnNyYz1cImltYWdlcy9kaWU0LnBuZ1wiO1xuXG5jb25zdCBkaWU1ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTUuc3JjPVwiaW1hZ2VzL2RpZTUucG5nXCI7XG5cbmNvbnN0IGRpZTYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNi5zcmM9XCJpbWFnZXMvZGllNi5wbmdcIjtcblxuY29uc3QgZGljZUltYWdlcyA9IFtkaWUxLCBkaWUyLCBkaWUzLCBkaWU0LCBkaWU1LCBkaWU2XTtcblxuLy9HZW5lcmljIERpc3BsYXkgRnVuY3Rpb25zXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmNvbnN0IGRpc3BsYXlFbGVtZW50cyA9IChhcnJheSk9PiB7XG4gICAgZm9yIChsZXQgZWxlbWVudCA9IDA7IGVsZW1lbnQgPCBhcnJheS5sZW5ndGg7IGVsZW1lbnQrKyl7XG4gICAgICAgIGFycmF5W2VsZW1lbnRdLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO31cbn07XG5cbmNvbnN0IGhpZGVFbGVtZW50cyA9IChhcnJheSk9PiB7XG4gICAgZm9yIChsZXQgZWxlbWVudCA9IDA7IGVsZW1lbnQgPCBhcnJheS5sZW5ndGg7IGVsZW1lbnQrKyl7XG4gICAgICAgIGFycmF5W2VsZW1lbnRdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxufTtcblxuY29uc3QgZGlzcGxheUFuZEhpZGUgPSAoYXJyYXlBZGQsIGFycmF5RGVsZXRlKT0+e1xuICAgIGRpc3BsYXlFbGVtZW50cyhhcnJheUFkZCk7XG4gICAgaGlkZUVsZW1lbnRzKGFycmF5RGVsZXRlKTtcbn07XG5cbi8vRGljZSBJbWFnZSBGdW5jdGlvbnNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY29uc3QgY29udmVydFRvRGljZUltYWdlcyA9IGhhbmQgPT57XG4gICAgbGV0IGltZ0hhbmQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhbmQubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgZmFjZSA9IGhhbmRbaV07XG4gICAgICAgIGxldCBkaWNlSW1hZ2UgPSBkaWNlSW1hZ2VzW2ZhY2UtMV0uY2xvbmVOb2RlKCk7XG4gICAgICAgIGltZ0hhbmQucHVzaChkaWNlSW1hZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gaW1nSGFuZDtcbn07XG5cbmNvbnN0IGRpc3BsYXlEaWNlSW1hZ2VzID0gKHBhcmVudE5vZGUsIGhhbmRJbWFnZXMpID0+e1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZEltYWdlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoaGFuZEltYWdlc1tpXSk7XG4gICAgfVxufTtcblxuY29uc3QgY2xlYXJJbWFnZXMgPSBwYXJlbnROb2RlID0+e1xuICAgIHdoaWxlIChwYXJlbnROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cblxuXG5jb25zdCBkaXNwbGF5UGxheWVycyA9IChlbGVtZW50LCB0YWJsZSk9PntcbiAgICBsZXQgaHRtbCA9IGA8aDM+UExheWVyczwvaDM+YDtcbiAgICBmb3IgKGxldCBpID0wOyBpPHRhYmxlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaHRtbCArPSBgJHt0YWJsZVtpXS5uYW1lfSAtIERpY2UgTGVmdDogJHt0YWJsZVtpXS5oYW5kLmxlbmd0aH0gPGJyPmBcbiAgICB9XG4gICAgc2V0SFRNTChlbGVtZW50LCBodG1sKTtcbn07XG5cbmNvbnN0IGRpc3BsYXlMYXN0QmV0ID0gKGxhc3RCZXQsIGVsZW1lbnQpPT4ge1xuICAgIGlmIChsYXN0QmV0WzBdICE9PSAwKSB7XG4gICAgICAgIHNldEhUTUwoZWxlbWVudCwgYDxoMz5MYXN0IEJldDogJHtsYXN0QmV0WzFdfSA8L2gzPmApO1xuICAgICAgICBkaXNwbGF5RGljZUltYWdlcyhlbGVtZW50LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKFtsYXN0QmV0WzBdXSkpXG4gICAgfVxufTtcblxuY29uc3QgZGlzcGxheVJvdW5kID0gKHJlc3VsdCkgPT4ge1xuICAgIGhpZGVFbGVtZW50cyhbcmVzdWx0XSk7XG59O1xuXG5jb25zdCBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzID0gKGNoYWxsZW5nZSwgZGlzcGxheSwgY2hhbGxlbmdlcikgPT57XG4gICAgaWYgKGNoYWxsZW5nZSl7XG4gICAgICAgIHNldEhUTUwoZGlzcGxheSwgYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+Q0hBTExFTkdFRCBCWSAke2NoYWxsZW5nZXIubmFtZX08L2Rpdj5gKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgc2V0SFRNTChkaXNwbGF5LCBgPGRpdiBjbGFzcz1cInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj5ObyBvbmUgY2hhbGxlbmdlczwvZGl2PmApO1xuICAgIH1cbn07XG5cbmNvbnN0IHNldEhUTUwgPSAoZWxlbWVudCwgaHRtbCk9PntcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5cblxuLy8gRVhQT1JUU1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZGlzcGxheUVsZW1lbnRzIDogZGlzcGxheUVsZW1lbnRzLFxuICAgIGhpZGVFbGVtZW50cyA6IGhpZGVFbGVtZW50cyxcbiAgICBkaXNwbGF5QW5kSGlkZSA6IGRpc3BsYXlBbmRIaWRlLFxuICAgIGNvbnZlcnRUb0RpY2VJbWFnZXMgOiBjb252ZXJ0VG9EaWNlSW1hZ2VzLFxuICAgIGNsZWFySW1hZ2VzIDogY2xlYXJJbWFnZXMsXG4gICAgZGlzcGxheURpY2VJbWFnZXM6IGRpc3BsYXlEaWNlSW1hZ2VzLFxuICAgIGRpc3BsYXlQbGF5ZXJzIDogZGlzcGxheVBsYXllcnMsXG4gICAgZGlzcGxheUxhc3RCZXQgOiBkaXNwbGF5TGFzdEJldCxcbiAgICBkaXNwbGF5Um91bmQgOiBkaXNwbGF5Um91bmQsXG4gICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyA6IGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXMsXG4gICAgc2V0SFRNTCA6IHNldEhUTUwsXG5cbn07XG5cblxuXG4iXX0=
