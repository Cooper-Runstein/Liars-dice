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
    setHtml("result", "");
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
  })
    returnNewPlayerNumber();
    currentPlayer = table[PlayerNumber];
    displayPlayers(atTable, table);

};

const endRound = () => {
    resetRoundVariables();
    setHTML(test, "ROUND OVER")
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
        setHTML(display, `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`);
    }else{
        setHTML(display, `<div class="text-warning display-4">No one challenges</div>`);
    }
};

const setHTML = (element, html)=>{
    element.innerHTML = html;
}



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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYXBwLmpzIiwic2NyaXB0cy9kaXNwbGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8jIyMjIyMjIyMjIyBJTVBPUlRTICMjIyMjIyMjIyNcbi8vIyMjIyMjRElTUExBWSMjIyMjIyMjI1xuY29uc3QgZGlzcGxheSA9IHJlcXVpcmUoJy4vZGlzcGxheS5qcycpO1xuY29uc3Qge2Rpc3BsYXlFbGVtZW50c30gPSBkaXNwbGF5O1xuY29uc3Qge2hpZGVFbGVtZW50c30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlBbmRIaWRlfSA9IGRpc3BsYXk7XG5jb25zdCB7Y29udmVydFRvRGljZUltYWdlc30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlEaWNlSW1hZ2VzfSA9IGRpc3BsYXk7XG5jb25zdCB7Y2xlYXJJbWFnZXN9ID0gZGlzcGxheTtcbmNvbnN0IHtkaXNwbGF5UGxheWVyc30gPSBkaXNwbGF5O1xuY29uc3Qge2Rpc3BsYXlMYXN0QmV0fSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheVJvdW5kfSA9IGRpc3BsYXk7XG5jb25zdCB7ZGlzcGxheUNoYWxsZW5nZVN0YXR1c30gPSBkaXNwbGF5O1xuY29uc3Qge3NldEhUTUx9ID0gZGlzcGxheTtcblxuXG4vLyMjIyMjIyMjIyMjRG9jdW1lbnQgYnV0dG9ucyBhbmQgZGlzcGxheXMjIyMjIyMjIyMjIyMjI1xuLy9kaXNwbGF5c1xubGV0IGN1cnJlbnRIYW5kRGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3VycmVudEhhbmRcIik7XG5sZXQgY3VycmVudFBsYXllckRpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllckRpc3BsYXlcIik7XG5sZXQgcGxheWVyT3B0aW9uc0Rpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllck9wdGlvbnNcIik7XG5sZXQgdGVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdFwiKTtcbmxldCB0ZXN0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVzdDJcIik7XG5sZXQgZGVjbGFyZURpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlY2xhcmVEaXNwbGF5XCIpO1xubGV0IGZhY2VEaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmYWNlRGlzcGxheVwiKTtcbmxldCByZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3VsdFwiKTtcbmxldCBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0c1wiKTtcbmxldCBiZXREaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNiZXREaXNwbGF5XCIpO1xubGV0IGdhbWVPdmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lT3ZlclwiKTtcbmNvbnN0IGF0VGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllcnNcIik7XG5cbi8vQnV0dG9uc1xuY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpO1xuY29uc3QgbmV4dFBsYXllckJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFBsYXllclwiKTtcbmNvbnN0IGJsdWZmQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNibHVmZlwiKTtcbmNvbnN0IHNwb3RPbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3BvdE9uXCIpO1xuY29uc3QgZGVjbGFyZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVjbGFyZVwiKTtcbmNvbnN0IG5leHRSb3VuZEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmV4dFJvdW5kXCIpO1xuY29uc3QgZmFjZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhY2UnKTtcbmNvbnN0IGNvdW50SW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnQnKTtcbmNvbnN0IHBhc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzcycpO1xuY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldE5hbWUnKTtcbmNvbnN0IHN1Ym1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0XCIpO1xuY29uc3QgcGxheWVyc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnZXRQbGF5ZXJzXCIpO1xuXG4vL0ltYWdlc1xuXG4vL0J1dHRvbiBMaXN0ZW5lcnNcbmNvbnN0IGV2ZW50TGlzdGVuZXJzID0gKCk9PiB7XG4gICAgc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGRpc3BsYXlBbmRIaWRlKFtzdWJtaXQsIHBsYXllcnNJbnB1dCwgbmFtZUlucHV0XSwgW3N0YXJ0QnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBsZXQgZ2FtZUluaXRpYWxWYWx1ZXMgPSBnZXRHYW1lU2V0dGluZ3MoKTtcbiAgICAgICAgaWYoZ2FtZUluaXRpYWxWYWx1ZXMgIT09IGZhbHNlKXtcbiAgICAgICAgICAgIGdhbWUoZ2FtZUluaXRpYWxWYWx1ZXMpO31lbHNle1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBibHVmZkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2hhbGxlbmdlciA9IHRhYmxlWzBdO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyh0cnVlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgIGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCh0cnVlKTtcbiAgICAgICAgZW5kUm91bmQoKTtcbiAgICB9KTtcblxuICAgIG5leHRQbGF5ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbbmV4dFBsYXllckJ1dHRvbl0pO1xuICAgICAgICBjbGVhckltYWdlcyhjdXJyZW50SGFuZERpc3BsYXkpO1xuICAgICAgICByZWFkeU5leHRQbGF5ZXIoKTtcbiAgICAgICAgcmV0dXJuTmV3UGxheWVyTnVtYmVyKCk7XG4gICAgfSk7XG5cbiAgICBuZXh0Um91bmRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbbmV4dFJvdW5kQnV0dG9uLCB0ZXN0LCB0ZXN0Ml0pO1xuICAgICAgICByZXNldFJvdW5kVmFyaWFibGVzKCk7XG4gICAgICAgIGRpc3BsYXlSb3VuZChyZXN1bHQpO1xuICAgICAgICBzdGFydE5leHRSb3VuZCgpO1xuICAgICAgICBmaXJzdFBsYXllcigpO1xuICAgIH0pO1xuXG4gICAgZGVjbGFyZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYocHJvY2Vzc0JldFZhbGlkaXR5KGZhY2VJbnB1dC52YWx1ZSwgY291bnRJbnB1dC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVjbGFyZWJ1dHRvbiB2YWxpZGF0ZWRcIik7XG4gICAgICAgICAgICBsZXQgY2hhbGxlbmdlcnMgPSBnZXRDaGFsbGVuZ2VycyhmYWNlSW5wdXQudmFsdWUsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICAgICAgICAgICBjaGFsbGVuZ2VkID0gdGFibGVbMF07XG4gICAgICAgICAgICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICAgICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQoKTtcbiAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzKGZhbHNlLCBmYWNlRGlzcGxheSwgY2hhbGxlbmdlcik7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgICAgICAgICB9XG4gICAgIH1cbiAgICB9KTtcblxuICAgIHBhc3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xuICAgICAgICBkaXNwbGF5QW5kSGlkZShbbmV4dFBsYXllckJ1dHRvbl0sIFtwYXNzQnV0dG9uLCBibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uXSk7XG4gICAgfSk7XG5cbiAgICBzcG90T25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTcG90T24gY2FsbGVkJyk7XG4gICAgICAgIGNoYWxsZW5nZXIgPSB0YWJsZVswXTtcbiAgICAgICAgY2hhbGxlbmdlZCA9IGN1cnJlbnRQbGF5ZXI7XG4gICAgICAgIGxldCBsb3NlcjtcbiAgICAgICAgaWYoY2hlY2tTcG90T24oKSl7XG4gICAgICAgICAgc2V0SFRNTChyZXN1bHQsIGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIFRydWUgLT4gJHtjaGFsbGVuZ2VkLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmApO1xuICAgICAgICAgICBsb3NlciA9IGNoYWxsZW5nZWQ7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgc2V0SFRNTChyZXN1bHQsIGA8ZGl2IGNsYXNzPVwidGV4dC13YXJuaW5nIGRpc3BsYXktNFwiPiBTcG90IE9uIEZhbHNlLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmApO1xuICAgICAgICAgICAgbG9zZXIgPSBjaGFsbGVuZ2VyO1xuICAgICAgICB9XG4gICAgICAgIHJlbW92ZURpZShsb3Nlcik7XG4gICAgICAgIGNoZWNrSWZFbGltaW5hdGVkKGxvc2VyKTtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFtyZXN1bHQsIG5leHRSb3VuZEJ1dHRvbl0pO1xuICAgICAgICBlbmRSb3VuZCgpO1xuICAgIH0pO1xuXG59O1xuXG5sZXQgbmFtZXMgPSBbXG4gICAgXCJTaGlybGVlblwiLCBcIkthcmFcIiwgXCJDbGV2ZWxhbmRcIixcIk1lcnJpXCIsIFwiQ29uY2VwdGlvblwiLCBcIkhhbGV5XCIsIFwiRmxvcmFuY2VcIiwgXCJEb3JpZVwiLCBcIkx1ZWxsYVwiLCBcIlZlcm5pYVwiLFxuICAgIFwiRnJlZW1hblwiLCBcIkthdGhhcmluYVwiLCBcIkNoYXJtYWluXCIsIFwiR3JhaGFtXCIsIFwiRGFybmVsbFwiLCBcIkJlcm5ldHRhXCIsIFwiSW5lbGxcIiwgXCJQYWdlXCIsIFwiR2FybmV0dFwiLCBcIkFubmFsaXNhXCIsXG4gICAgXCJCcmFudFwiLCBcIlZhbGRhXCIsIFwiVmlraVwiLCBcIkFzdW5jaW9uXCIsIFwiTW9pcmFcIiwgXCJLYXljZWVcIiwgXCJSaWNoZWxsZVwiLCBcIkVsaWNpYVwiLCBcIkVuZWlkYVwiLCBcIkV2ZWx5bm5cIlxuXTtcblxuLy9PQkpFQ1RTXG5jbGFzcyBQbGF5ZXJ7XG4gICAgY29uc3RydWN0b3IobmFtZSlcbiAgICB7XG4gICAgICAgIHRoaXMucGxheWVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgZ2V0UmFuZG9tTmFtZSgpO1xuICAgICAgICB0aGlzLmhhbmQgPSBbMCwwLDAsMF07XG4gICAgICAgIHRoaXMucm9sbCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZCA9IHRoaXMuaGFuZC5tYXAoXG4gICAgICAgICAgICAgICAgKCkgPT4gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpICsgMSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9IGhhcyByb2xsZWRgKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRUb1RhYmxlID0gKCkgPT4ge1xuICAgICAgICAgICAgdGFibGUucHVzaCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRPY2N1cnJlbmNlcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5oYW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZGljZU9uVGFibGVJbmRleGVkQXJyYXlbdGhpcy5oYW5kW2ldIC0gMV0gKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG51bWJlck9mRGllICs9IHRoaXMuaGFuZC5sZW5ndGg7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmV0dXJuVHJ1ZUlmQUlDaGFsbGVuZ2VzID0gKGZhY2UsIHBsYXllcikgPT4ge1xuICAgICAgICAgICAgbGV0IHBsYXllck51bSA9IGdldEZhY2VDb3VudCh0aGlzLCBmYWNlKTtcbiAgICAgICAgICAgIGxldCBwY3QgPSBkaWVSYXRpbyhwbGF5ZXJOdW0pOyAvLyBnZXQgbnVtZXJpY2FsIHByb2JhYmlsaXR5IG9mIGJldCB0cnV0aHluZXNzXG4gICAgICAgICAgICBpZiAocGxheWVyID09PSB0cnVlKXsgLy9pbmNyZWFzZSBjaGFsbGVuZ2UgY2hhbmNlIGlmIGh1bWFuIGlzIGJldHRpbmdcbiAgICAgICAgICAgICAgICBwY3QgKz0gKDEvMTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBjdCA8PSAoMSAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfWVsc2UgaWYgKHBjdCA8PSAoMiAvIDEyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjJcbiAgICAgICAgICAgIH1lbHNlIGlmIChwY3QgPD0gKDQgLyAxMikpe1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgLjNcbiAgICAgICAgICAgIH1lbHNlIGlmKHBjdCA8PSAoNSAvIDEyKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAuNVxuICAgICAgICAgICAgfWVsc2UgaWYocGN0IDw9ICg2IC8gMTIpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IC43XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxufX1cblxubGV0IGdldEZhY2VDb3VudCA9IChwbGF5ZXIsIGZhY2UpPT57IC8vY291bnRzIGluZGl2aWR1YWxzIGluc3RhbmNlcyBvZiBhIGZhY2VcbiAgICBsZXQgYXJyID0gY291bnRGYWNlcyhwbGF5ZXIuaGFuZCk7XG4gICAgcmV0dXJuIGFycltmYWNlLTFdO1xufTtcblxubGV0IGRpZVJhdGlvID0gKHBsYXllck51bSkgPT4geyAvL3JldHVybiBwcm9wIG9mIHRydXRoeW5lc3NcbiAgICByZXR1cm4gKGJldENvdW50LXBsYXllck51bSkvbnVtYmVyT2ZEaWU7XG59O1xuXG4vL01haW4gVmFyaWFibGVzXG5sZXQgdGFibGUgPSBbXTsgLy9hcnJheSB0byBob2xkIHBsYXllcnNcbmxldCBQbGF5ZXJOdW1iZXI7IC8vY3VycmVudCBwbGF5ZXIgaW5kZXggY291bnRlclxubGV0IGN1cnJlbnRIYW5kOyAvL2FjdGl2ZSBkaWUgaGFuZFxubGV0IGN1cnJlbnRQbGF5ZXI7IC8vIGFjdGl2ZSBwbGF5ZXIgOiB0YWJsZVtQbGF5ZXJOdW1iZXJdXG5sZXQgbGFzdEJldCA9IFswLCAwXTtcbmxldCBiZXRDb3VudCA9IDA7XG5sZXQgZGljZU9uVGFibGVJbmRleGVkQXJyYXkgPSBbMCwwLDAsMCwwLDBdO1xubGV0IG51bWJlck9mRGllID0gMDtcbmxldCBjaGFsbGVuZ2VyO1xubGV0IGNoYWxsZW5nZWQ7XG5cbi8vIyMjIyMjIyMjIyMjI0dhbWUgRnVuY3Rpb25zIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jb25zdCBzdGFydEdhbWUgPSAoaW5pdGlhbFZhbHVlcykgPT4ge1xuICAgIGNyZWF0ZUh1bWFuUGxheWVyKGluaXRpYWxWYWx1ZXMpO1xuICAgIGNyZWF0ZUFpUGxheWVycyhpbml0aWFsVmFsdWVzWzFdKTtcbiAgICB0YWJsZVswXS5wbGF5ZXIgPSB0cnVlO1xufTtcblxuY29uc3QgY3JlYXRlSHVtYW5QbGF5ZXIgPSAoaW5pdGlhbFZhbHVlcyk9PntcbiAgICBsZXQgaHVtYW4gPSBuZXcgUGxheWVyKGluaXRpYWxWYWx1ZXNbMF0pO1xuICAgIGh1bWFuLmFkZFRvVGFibGUodGFibGUpO1xufTtcblxuY29uc3QgZ2V0R2FtZVNldHRpbmdzID0gKCk9PntcbiAgICBsZXQgbmFtZSA9IG5hbWVJbnB1dC52YWx1ZTtcbiAgICBpZiAoMTAgPiBwbGF5ZXJzSW5wdXQudmFsdWUgPiAwKXtcbiAgICAgICAgbGV0IG51bVBsYXllcnMgPSBwbGF5ZXJzSW5wdXQudmFsdWU7XG4gICAgICAgIGhpZGVFbGVtZW50cyhbc3VibWl0LCBwbGF5ZXJzSW5wdXQsIG5hbWVJbnB1dF0pO1xuICAgICAgICByZXR1cm4gKFtuYW1lLCBudW1QbGF5ZXJzXSk7XG4gICAgfXJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJhbmRvbU5hbWUgPSAoKT0+IHtcbiAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5mbG9vcihuYW1lcy5sZW5ndGgpKTtcbiAgICAgICAgbGV0IG5hbWUgPSBuYW1lc1tpbmRleF07XG4gICAgICAgIG5hbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBuYW1lO1xufTtcblxuY29uc3QgY3JlYXRlQWlQbGF5ZXJzID0gKG51bSk9PntcbiAgICBmb3IgKGxldCBpID0wOyBpIDxudW07IGkrKyl7XG4gICAgICAgIGxldCB4ID0gbmV3IFBsYXllcigpO1xuICAgICAgICB4LmFkZFRvVGFibGUoKTtcbiAgICB9XG59O1xuXG4vL1BsYXllciBzZXQgdXBcbmNvbnN0IHNldFVwTmV4dFBsYXllciA9ICgpID0+IHtcbiAgIGdldE5leHRQbGF5ZXIoKTtcbiAgIGRpc3BsYXlFbGVtZW50cyhbY3VycmVudFBsYXllckRpc3BsYXksIGN1cnJlbnRIYW5kRGlzcGxheV0pO1xuICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxheWVyID09PSB0cnVlKSB7XG4gICAgICBzZXRVcEh1bWFuVHVybigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgc2V0VXBBaVR1cm4oKTtcbiAgICB9XG59O1xuXG5jb25zdCBzZXRVcEh1bWFuVHVybiA9ICgpPT57XG4gICAgc2V0SFRNTCh0ZXN0MixcIlwiKTtcbiAgICBkaXNwbGF5RWxlbWVudHMoW3Rlc3QyXSk7XG4gICAgc2V0SFRNTChjdXJyZW50SGFuZERpc3BsYXksIGA8aDEgY2xhc3M9XCJ0ZXh0LWFsaWduXCI+IFlvdXIgSGFuZCBpczogPC9oMT5gKTtcbiAgICBzZXRIVE1MKGN1cnJlbnRQbGF5ZXJEaXNwbGF5LCBgPGgxIGNsYXNzPVwidGV4dC1hbGlnblwiPiR7Y3VycmVudFBsYXllci5uYW1lfTwvaDE+YCk7XG4gICAgZGlzcGxheUxhc3RCZXQobGFzdEJldCwgdGVzdCk7XG4gICAgZGlzcGxheURpY2VJbWFnZXMoY3VycmVudEhhbmREaXNwbGF5LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKGN1cnJlbnRIYW5kKSk7XG4gICAgZGlzcGxheUFuZEhpZGUoW2RlY2xhcmVEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBpbnB1dHNdLCBbc3BvdE9uQnV0dG9uLCBibHVmZkJ1dHRvbiwgYmV0RGlzcGxheSwgZmFjZURpc3BsYXldKTtcbn07XG5cblxuY29uc3Qgc2V0VXBBaVR1cm4gPSAoKT0+e1xuICAgIGRpc3BsYXlBbmRIaWRlKFtzcG90T25CdXR0b24sIGJsdWZmQnV0dG9uLCBwYXNzQnV0dG9uLCByZXN1bHQsIHRlc3RdLCBbY3VycmVudEhhbmREaXNwbGF5XSk7XG4gICAgc2V0SHRtbChcInJlc3VsdFwiLCBcIlwiKTtcbiAgICBzZXRIVE1MKGN1cnJlbnRQbGF5ZXJEaXNwbGF5LCBgPGgxIGNsYXNzPVwidGV4dC1hbGlnblwiPiR7Y3VycmVudFBsYXllci5uYW1lfSBpcyBwbGF5aW5nPC9oMT5gKTtcbiAgICBzZXRIVE1MKHRlc3QsIGBZb3VyIGhhbmQgaXM6YCk7XG4gICAgZGlzcGxheURpY2VJbWFnZXModGVzdCwgY29udmVydFRvRGljZUltYWdlcyh0YWJsZVswXS5oYW5kKSk7XG4gICAgbGFzdEJldCA9IGFpUGxheXMoKTtcbiAgICBydW5BaUFnYWluc3RBaSgpO1xufTtcblxuY29uc3QgcnVuQWlBZ2FpbnN0QWkgPSAoKT0+e1xuICAgIGxldCBjaGFsbGVuZ2VycyA9IGdldENoYWxsZW5nZXJzKGxhc3RCZXRbMF0sIGZhbHNlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsbGVuZ2Vycyk7XG4gICAgaWYgKGNoYWxsZW5nZXJzLmxlbmd0aCA+IDApe1xuICAgICAgICBjaGFsbGVuZ2VyID0gZ2V0T3Bwb25lbnQoY2hhbGxlbmdlcnMpO1xuICAgICAgICBjaGFsbGVuZ2VkID0gY3VycmVudFBsYXllcjtcbiAgICAgICAgaGlkZUVsZW1lbnRzKFtibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uLCBwYXNzQnV0dG9uXSk7XG4gICAgICAgIGRpc3BsYXlDaGFsbGVuZ2VTdGF0dXModHJ1ZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgICAgICBkZXRlcm1pbmVDaGFsbGVuZ2VSZXN1bHQoKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlzcGxheUNoYWxsZW5nZVN0YXR1cyhmYWxzZSwgZmFjZURpc3BsYXksIGNoYWxsZW5nZXIpO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldE5leHRQbGF5ZXIgPSAoKT0+e1xuICAgIGN1cnJlbnRQbGF5ZXIgPSB0YWJsZVtQbGF5ZXJOdW1iZXJdO1xuICAgIGN1cnJlbnRIYW5kID0gY3VycmVudFBsYXllci5oYW5kO1xufTtcblxuY29uc3QgZmlyc3RQbGF5ZXIgPSAoKSA9PiB7XG4gICAgc2V0VXBOZXh0UGxheWVyKCk7XG4gICAgUGxheWVyTnVtYmVyICs9IDE7XG4gICAgcmV0dXJuTmV3UGxheWVyTnVtYmVyKCk7XG59O1xuXG5jb25zdCByZWFkeU5leHRQbGF5ZXIgPSAoKSA9PiB7XG4gICAgc2V0VXBOZXh0UGxheWVyKCk7XG4gICAgUGxheWVyTnVtYmVyICs9IDE7XG59O1xuXG5jb25zdCByZXR1cm5OZXdQbGF5ZXJOdW1iZXIgPSAoKSA9PiB7XG4gICAgaWYgKFBsYXllck51bWJlciA+PSB0YWJsZS5sZW5ndGggfHwgUGxheWVyTnVtYmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgUGxheWVyTnVtYmVyID0gMDtcbiAgICB9IGVsc2UgaWYgKFBsYXllck51bWJlciA8IDApIHtcbiAgICAgICAgUGxheWVyTnVtYmVyID0gdGFibGUubGVuZ3RoIC0gMTtcbiAgICB9XG59O1xuXG4vL05FVyBST1VORFxuY29uc3Qgc3RhcnROZXh0Um91bmQgPSAoKSA9PiB7XG4gIHRhYmxlLm1hcCh4ID0+e1xuICAgIHgucm9sbCgpO1xuICAgIHguYWRkT2NjdXJyZW5jZXMoKTtcbiAgfSlcbiAgICByZXR1cm5OZXdQbGF5ZXJOdW1iZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gdGFibGVbUGxheWVyTnVtYmVyXTtcbiAgICBkaXNwbGF5UGxheWVycyhhdFRhYmxlLCB0YWJsZSk7XG5cbn07XG5cbmNvbnN0IGVuZFJvdW5kID0gKCkgPT4ge1xuICAgIHJlc2V0Um91bmRWYXJpYWJsZXMoKTtcbiAgICBzZXRIVE1MKHRlc3QsIFwiUk9VTkQgT1ZFUlwiKVxuICAgIFBsYXllck51bWJlciAtPSAxO1xufTtcblxuY29uc3QgcmVzZXRSb3VuZFZhcmlhYmxlcyA9ICgpID0+IHtcbiAgICBsYXN0QmV0ID0gWzAsMF07XG4gICAgYmV0Q291bnQgPSAwO1xuICAgIG51bWJlck9mRGllID0gMDtcbiAgICBkaWNlT25UYWJsZUluZGV4ZWRBcnJheSA9IFswLDAsMCwwLDAsMF07XG4gICAgaGlkZUVsZW1lbnRzKFtwYXNzQnV0dG9uLCBibHVmZkJ1dHRvbiwgc3BvdE9uQnV0dG9uLCBuZXh0UGxheWVyQnV0dG9uXSk7XG59O1xuXG5cbi8vR0FNRSBQTEFZIEZVTkNUSU9OU1xuY29uc3QgZ2V0QmV0VHJ1dGggPSAoKSA9PiB7XG4gICAgbGV0IGZhY2UgPSBsYXN0QmV0WzBdO1xuICAgIGxldCBjb3VudCA9IGxhc3RCZXRbMV07XG4gICAgY29uc29sZS5sb2coZGljZU9uVGFibGVJbmRleGVkQXJyYXkpO1xuICAgIHJldHVybiBkaWNlT25UYWJsZUluZGV4ZWRBcnJheVtmYWNlIC0gMV0gPj0gY291bnQ7XG59O1xuXG5jb25zdCBwcm9jZXNzQmV0VmFsaWRpdHkgPSAoZmFjZSwgY291bnQpID0+IHtcbiAgICBsZXQgYmV0ID0gZ2V0QmV0SWZWYWxpZChmYWNlLCBjb3VudCk7XG4gICAgaWYgKGJldCAhPT0gZmFsc2UpIHtcbiAgICAgICAgbGFzdEJldCA9IGJldDtcbiAgICAgICAgZGlzcGxheUFuZEhpZGUoW2ZhY2VEaXNwbGF5XSwgW2RlY2xhcmVEaXNwbGF5LCBkZWNsYXJlQnV0dG9uLCBpbnB1dHNdKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGVzdDIuaW5uZXJIVE1MID0gYDxwIGNsYXNzPVwiZGlzcGxheS01IHRleHQtaW5mb1wiPk5vdCBWYWxpZCBJbnB1dDwvcD5gO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldEJldElmVmFsaWQgPSAoZmFjZSwgY291bnQpID0+IHtcbiAgICBmYWNlID0gcGFyc2VJbnQoZmFjZSk7XG4gICAgY291bnQgPSBwYXJzZUludChjb3VudCk7XG4gICAgbGV0IGxhc3RGYWNlID0gbGFzdEJldFswXTtcbiAgICBsZXQgbGFzdENvdW50ID0gbGFzdEJldFsxXTtcblxuICAgIGlmIChcbiAgICAgICAgKCAgICgoZmFjZSA+IGxhc3RGYWNlKSAmJiAoY291bnQgPT09IGxhc3RDb3VudCkpICYmXG4gICAgICAgICAgICAoKGNvdW50ID4gMCkgJiYgKDcgPiBmYWNlID4gMCkpXG4gICAgICAgIClcblxuICAgICAgICB8fFxuXG4gICAgICAgICgoY291bnQgPiBsYXN0Q291bnQpICYmICgoY291bnQgPiAwKSAmJiAoNyA+IGZhY2UgJiYgZmFjZSA+IDApKSlcbiAgICApIHtcbiAgICAgICAgYmV0Q291bnQgPSBjb3VudDtcbiAgICAgICAgcmV0dXJuIFtmYWNlLCBjb3VudF07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07Ly9yZXR1cm4gaWYgYmV0IGlzIHZhbGlkXG5cbmNvbnN0IGdldENoYWxsZW5nZXJzID0gKGZhY2UsIHBsYXllcik9PntcbiAgICBsZXQgY2hhbGxlbmdlcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpPTE7IGkgPCB0YWJsZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGlmKHRhYmxlW2ldLnJldHVyblRydWVJZkFJQ2hhbGxlbmdlcyhmYWNlLCBwbGF5ZXIpKXtcbiAgICAgICAgICAgIGlmICh0YWJsZVtpXSAhPT0gY3VycmVudFBsYXllcil7XG4gICAgICAgICAgICBjaGFsbGVuZ2Vycy5wdXNoKHRhYmxlW2ldKX1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgUG9zc2libGUgQ2hhbGxlbmdlcnM6ICR7Y2hhbGxlbmdlcnN9YCk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAuMyl7XG4gICAgcmV0dXJuIGNoYWxsZW5nZXJzO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbn07XG5cbmNvbnN0IGdldE9wcG9uZW50ID0gKGNoYWxsZW5nZXJzKT0+e1xuICAgIGxldCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1hdGguZmxvb3IoY2hhbGxlbmdlcnMubGVuZ3RoKSk7XG5cbiAgICBjb25zb2xlLmxvZyhjaGFsbGVuZ2Vyc1tpbmRleF0pO1xuICAgIHJldHVybiBjaGFsbGVuZ2Vyc1tpbmRleF1cbn07XG5cbmNvbnN0IGRldGVybWluZUNoYWxsZW5nZVJlc3VsdCA9ICgpID0+e1xuICAgIGRpc3BsYXlBbmRIaWRlKFtuZXh0Um91bmRCdXR0b24sIHJlc3VsdF0sIFtuZXh0UGxheWVyQnV0dG9uXSk7XG4gICAgaGFuZGxlQ2hhbGxlbmdlQ2hlY2soZ2V0QmV0VHJ1dGgoKSk7XG5cbn07XG5cbmNvbnN0IGhhbmRsZUNoYWxsZW5nZUNoZWNrID0gKGJldEJvb2xlYW4pPT57XG4gICAgY29uc29sZS5sb2coXCJoYW5kbGUgY2hhbGxlbmdlIGZ1bmN0aW9uIGNhbGxlZFwiKTtcbiAgICBpZihiZXRCb29sZWFuKXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZXIsY2hhbGxlbmdlZCk7XG4gICAgICAgIHJlc3VsdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcyA9IFwiJHtjb2xvcn0gZGlzcGxheS00XCI+IENoYWxsZW5nZSBGYWlsZWQgLT4gJHtjaGFsbGVuZ2VyLm5hbWV9IGxvc2VzIGEgZGllIDwvZGl2PmA7XG4gICAgICAgIHJlbW92ZURpZShjaGFsbGVuZ2VyKTtcbiAgICAgICAgY2hlY2tJZkVsaW1pbmF0ZWQoY2hhbGxlbmdlcik7XG59ZWxzZXtcbiAgICAgICAgbGV0IGNvbG9yID0gZ2V0TWVzc2FnZUNvbG9yKGNoYWxsZW5nZWQsIGNoYWxsZW5nZXIpO1xuICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3MgPSBcIiR7Y29sb3J9IGRpc3BsYXktNFwiPiBDaGFsbGVuZ2UgU3VjY2VlZGVkIC0+ICR7Y2hhbGxlbmdlZC5uYW1lfSBsb3NlcyBhIGRpZSA8L2Rpdj5gO1xuICAgICAgICByZW1vdmVEaWUoY2hhbGxlbmdlZCk7XG4gICAgICAgIGNoZWNrSWZFbGltaW5hdGVkKGNoYWxsZW5nZWQpO1xuICAgIH1cbn07XG5cbmNvbnN0IGdldE1lc3NhZ2VDb2xvciA9IChsb3Nlciwgd2lubmVyKSA9PntcbiAgICBpZiAobG9zZXIucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIFwidGV4dC1kYW5nZXJcIjtcbiAgICB9ZWxzZSBpZih3aW5uZXIucGxheWVyID09PSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIFwidGV4dC1zdWNjZXNzXCI7XG4gICAgfXJldHVybiBcIlwiXG5cbn07XG5cbmNvbnN0IGNoZWNrU3BvdE9uID0gKCkgPT57XG4gICAgcmV0dXJuIChkaWNlT25UYWJsZUluZGV4ZWRBcnJheVtsYXN0QmV0WzBdIC0xXSA9PT0gbGFzdEJldFsxXSlcbn07XG5cbmNvbnN0IGNoZWNrSWZFbGltaW5hdGVkID0gKGJldExvc2VyKT0+e1xuICAgIGlmIChyZXR1cm5JZkxhc3REaWUoYmV0TG9zZXIpKXtcbiAgICAgICAgaGFuZGxlTGFzdERpZUxvc3QoYmV0TG9zZXIpO1xuICAgICAgICBjaGVja0Zvcldpbm5lcigpO1xuICAgIH1cbn07XG5cbmNvbnN0IHJlbW92ZURpZSA9IChwbGF5ZXIpID0+e1xuICAgIHBsYXllci5oYW5kICA9IHBsYXllci5oYW5kLnNwbGljZSgxKTtcbn07XG5cbi8vQ29tcHV0ZXIgYmV0c1xuY29uc3QgYWlQbGF5cyA9ICgpPT4ge1xuICAgIGxldCBuZXdCZXQgPSBwbGF5ZXJCZXQoKTtcbiAgICBiZXRDb3VudCA9IG5ld0JldFsxXTtcbiAgICBkaXNwbGF5RWxlbWVudHMoW2JldERpc3BsYXldKTtcbiAgICBiZXREaXNwbGF5LmlubmVySFRNTCA9IGA8cCBjbGFzcz1cImRpc3BsYXktNFwiPiR7Y3VycmVudFBsYXllci5uYW1lfSBiZXRzIHRoZXJlIGFyZSA8YnI+ICR7bmV3QmV0WzFdfSA8c3BhbiBpZD1cImRpY2VcIj4gPC9zcGFuPnMgb24gdGhlIHRhYmxlPC9wPmA7XG4gICAgbGV0IGRpZURpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpY2VcIik7XG4gICAgZGlzcGxheURpY2VJbWFnZXMoZGllRGlzcGxheSwgY29udmVydFRvRGljZUltYWdlcyhbbmV3QmV0WzBdXSkpO1xuICAgIHJldHVybiBuZXdCZXQ7XG59O1xuXG5jb25zdCBjb3VudEZhY2VzID0gKGhhbmQpID0+e1xuICAgIGxldCBjdXJyZW50SGFuZEludHMgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGN1cnJlbnRIYW5kSW50c1toYW5kW2ldIC0gMV0gKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRIYW5kSW50cztcbn07XG5jb25zdCBwbGF5ZXJCZXQgPSAoKSA9PiB7XG4gICAgbGV0IGN1cnJlbnRIYW5kSW50cyA9IGNvdW50RmFjZXMoY3VycmVudEhhbmQpO1xuICAgIGxldCBsYXJnZXN0Q291bnQgPSBNYXRoLm1heCguLi5jdXJyZW50SGFuZEludHMpO1xuICAgIGxldCBiZXN0SGFuZCA9IFtjdXJyZW50SGFuZEludHMuaW5kZXhPZihsYXJnZXN0Q291bnQpKzEsIGxhcmdlc3RDb3VudF07XG4gICAgcmV0dXJuIGFpQmx1ZmYoYmVzdEhhbmQpO1xufTtcblxuY29uc3QgYWlCbHVmZiA9IChiZXN0SGFuZCk9PntcbiAgICB3aGlsZSAoYWlDaGVja0N1cnJlbnRIYW5kVmFsaWRpdHkoYmVzdEhhbmQpICE9PSB0cnVlKXtcbiAgICAgICAgYmVzdEhhbmRbMV0gKz0gMTtcbiAgICB9XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPCAuMyl7XG4gICAgICAgIGJlc3RIYW5kWzFdICs9IDE7XG4gICAgICAgIHJldHVybiBiZXN0SGFuZDtcbiAgICB9ZWxzZXtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAuMSl7XG4gICAgICAgICAgICBiZXN0SGFuZFsxXSArPSAyO1xuICAgICAgICAgICAgcmV0dXJuIGJlc3RIYW5kO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0SGFuZFxufTtcblxuY29uc3QgYWlDaGVja0N1cnJlbnRIYW5kVmFsaWRpdHkgPSBoYW5kID0+IHtcbiAgICByZXR1cm4gKChoYW5kWzBdID4gbGFzdEJldFswXSAgJiYgaGFuZFsxXSA+PSBsYXN0QmV0WzFdKSB8fCBoYW5kWzFdID4gbGFzdEJldFsxXSlcbn07XG5cbmNvbnN0IHJldHVybklmTGFzdERpZSA9IHBsYXllciA9PiB7XG4gICAgcmV0dXJuIHBsYXllci5oYW5kLmxlbmd0aCA9PT0gMDtcbn07XG5cbmNvbnN0IGhhbmRsZUxhc3REaWVMb3N0ID0gcGxheWVyID0+e1xuICAgIGNvbnNvbGUubG9nKGBIYW5kbGluZyBsYXN0IGRpY2Ugb2YgJHtwbGF5ZXIubmFtZX1gKTtcbiAgICBsZXQgaW5kZXggPSB0YWJsZS5pbmRleE9mKHBsYXllcik7XG4gICAgY29uc29sZS5sb2coaW5kZXgpO1xuICAgIGNvbnNvbGUubG9nKHRhYmxlW2luZGV4XSk7XG4gICAgaWYgKHRhYmxlW2luZGV4XS5wbGF5ZXIgPT09IHRydWUpe1xuICAgICAgICBkaXNwbGF5RWxlbWVudHMoW2dhbWVPdmVyXSk7XG4gICAgICAgIGdhbWVPdmVyLmlubmVySFRNTD1cIllPVSBMT1NFXCJcbiAgICB9ZWxzZXtcbiAgICAgICAgZGlzcGxheUVsZW1lbnRzKFt0ZXN0Ml0pO1xuICAgICAgICB0ZXN0Mi5pbm5lckhUTUwgPSBgPGgxIGNsYXNzPVwidGV4dC13YXJuaW5nXCI+JHtwbGF5ZXIubmFtZX0gaGFzIGJlZW4gZWxpbWluYXRlZDwvaDE+YDtcbiAgICAgICAgdGFibGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGFibGUpO1xufTtcblxuY29uc3QgY2hlY2tGb3JXaW5uZXIgPSAoKT0+e1xuICAgIGlmICh0YWJsZS5sZW5ndGggPT09IDEpe1xuICAgICAgICBjb25zb2xlLmxvZygnIyMjIyMjIyNHQU1FIE9WRVIjIyMjIyMjIyMjIycpO1xuICAgICAgICByZXN1bHQuaW5uZXJIVE1MID0gXCJZT1UgV0lOXCI7XG4gICAgICAgIGRpc3BsYXlFbGVtZW50cyhbZ2FtZU92ZXJdKTtcbiAgICB9XG59O1xuXG4vL0dhbWUgU3RhcnQgRnVuY3Rpb25zXG5sZXQgY2xlYW5Cb2FyZCA9ICgpID0+IGhpZGVFbGVtZW50cyhbc3VibWl0LCBuYW1lSW5wdXQsIHBsYXllcnNJbnB1dCwgYmx1ZmZCdXR0b24sc3BvdE9uQnV0dG9uLHBhc3NCdXR0b24sbmV4dFJvdW5kQnV0dG9uLG5leHRQbGF5ZXJCdXR0b24sZmFjZURpc3BsYXkscGxheWVyT3B0aW9uc0Rpc3BsYXksIGRlY2xhcmVCdXR0b24sIGRlY2xhcmVEaXNwbGF5LCBpbnB1dHMsIHJlc3VsdCwgYmV0RGlzcGxheSwgZ2FtZU92ZXJdKTtcbmxldCBnYW1lID0gKGluaXRpYWxWYWx1ZXMpID0+IHtcbiAgICBzdGFydEdhbWUoaW5pdGlhbFZhbHVlcyk7XG4gICAgc3RhcnROZXh0Um91bmQoKTtcbiAgICBmaXJzdFBsYXllcigpO1xufTtcbmNsZWFuQm9hcmQoKTtcbmV2ZW50TGlzdGVuZXJzKCk7XG4iLCIvL0RJQ0UgSU1BR0VTXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5jb25zdCBkaWUxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTEuc3JjPVwiaW1hZ2VzL2RpZTEucG5nXCI7XG5cbmNvbnN0IGRpZTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllMi5zcmM9XCJpbWFnZXMvZGllMi5wbmdcIjtcblxuY29uc3QgZGllMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWUzLnNyYz1cImltYWdlcy9kaWUzLnBuZ1wiO1xuXG5jb25zdCBkaWU0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbmRpZTQuc3JjPVwiaW1hZ2VzL2RpZTQucG5nXCI7XG5cbmNvbnN0IGRpZTUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuZGllNS5zcmM9XCJpbWFnZXMvZGllNS5wbmdcIjtcblxuY29uc3QgZGllNiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5kaWU2LnNyYz1cImltYWdlcy9kaWU2LnBuZ1wiO1xuXG5jb25zdCBkaWNlSW1hZ2VzID0gW2RpZTEsIGRpZTIsIGRpZTMsIGRpZTQsIGRpZTUsIGRpZTZdO1xuXG4vL0dlbmVyaWMgRGlzcGxheSBGdW5jdGlvbnNcbi8vIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuY29uc3QgZGlzcGxheUVsZW1lbnRzID0gKGFycmF5KT0+IHtcbiAgICBmb3IgKGxldCBlbGVtZW50ID0gMDsgZWxlbWVudCA8IGFycmF5Lmxlbmd0aDsgZWxlbWVudCsrKXtcbiAgICAgICAgYXJyYXlbZWxlbWVudF0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7fVxufTtcblxuY29uc3QgaGlkZUVsZW1lbnRzID0gKGFycmF5KT0+IHtcbiAgICBmb3IgKGxldCBlbGVtZW50ID0gMDsgZWxlbWVudCA8IGFycmF5Lmxlbmd0aDsgZWxlbWVudCsrKXtcbiAgICAgICAgYXJyYXlbZWxlbWVudF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG59O1xuXG5jb25zdCBkaXNwbGF5QW5kSGlkZSA9IChhcnJheUFkZCwgYXJyYXlEZWxldGUpPT57XG4gICAgZGlzcGxheUVsZW1lbnRzKGFycmF5QWRkKTtcbiAgICBoaWRlRWxlbWVudHMoYXJyYXlEZWxldGUpO1xufTtcblxuLy9EaWNlIEltYWdlIEZ1bmN0aW9uc1xuLy8jIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jb25zdCBjb252ZXJ0VG9EaWNlSW1hZ2VzID0gaGFuZCA9PntcbiAgICBsZXQgaW1nSGFuZCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZC5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGxldCBmYWNlID0gaGFuZFtpXTtcbiAgICAgICAgbGV0IGRpY2VJbWFnZSA9IGRpY2VJbWFnZXNbZmFjZS0xXS5jbG9uZU5vZGUoKTtcbiAgICAgICAgaW1nSGFuZC5wdXNoKGRpY2VJbWFnZSk7XG4gICAgfVxuICAgIHJldHVybiBpbWdIYW5kO1xufTtcblxuY29uc3QgZGlzcGxheURpY2VJbWFnZXMgPSAocGFyZW50Tm9kZSwgaGFuZEltYWdlcykgPT57XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYW5kSW1hZ2VzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChoYW5kSW1hZ2VzW2ldKTtcbiAgICB9XG59O1xuXG5jb25zdCBjbGVhckltYWdlcyA9IHBhcmVudE5vZGUgPT57XG4gICAgd2hpbGUgKHBhcmVudE5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxuXG5cbmNvbnN0IGRpc3BsYXlQbGF5ZXJzID0gKGVsZW1lbnQsIHRhYmxlKT0+e1xuICAgIGxldCBodG1sID0gYDxoMz5QTGF5ZXJzPC9oMz5gO1xuICAgIGZvciAobGV0IGkgPTA7IGk8dGFibGUubGVuZ3RoOyBpKyspe1xuICAgICAgICBodG1sICs9IGAke3RhYmxlW2ldLm5hbWV9IC0gRGljZSBMZWZ0OiAke3RhYmxlW2ldLmhhbmQubGVuZ3RofSA8YnI+YFxuICAgIH1cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5jb25zdCBkaXNwbGF5TGFzdEJldCA9IChsYXN0QmV0LCBlbGVtZW50KT0+IHtcbiAgICBpZiAobGFzdEJldFswXSAhPT0gMCkge1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGA8aDM+TGFzdCBCZXQ6ICR7bGFzdEJldFsxXX0gPC9oMz5gO1xuICAgICAgICBkaXNwbGF5RGljZUltYWdlcyhlbGVtZW50LCBjb252ZXJ0VG9EaWNlSW1hZ2VzKFtsYXN0QmV0WzBdXSkpXG4gICAgfVxufTtcblxuY29uc3QgZGlzcGxheVJvdW5kID0gKHJlc3VsdCkgPT4ge1xuICAgIGhpZGVFbGVtZW50cyhbcmVzdWx0XSk7XG59O1xuXG5jb25zdCBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzID0gKGNoYWxsZW5nZSwgZGlzcGxheSwgY2hhbGxlbmdlcikgPT57XG4gICAgaWYgKGNoYWxsZW5nZSl7XG4gICAgICAgIHNldEhUTUwoZGlzcGxheSwgYDxkaXYgY2xhc3M9XCJ0ZXh0LXdhcm5pbmcgZGlzcGxheS00XCI+Q0hBTExFTkdFRCBCWSAke2NoYWxsZW5nZXIubmFtZX08L2Rpdj5gKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgc2V0SFRNTChkaXNwbGF5LCBgPGRpdiBjbGFzcz1cInRleHQtd2FybmluZyBkaXNwbGF5LTRcIj5ObyBvbmUgY2hhbGxlbmdlczwvZGl2PmApO1xuICAgIH1cbn07XG5cbmNvbnN0IHNldEhUTUwgPSAoZWxlbWVudCwgaHRtbCk9PntcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG59XG5cblxuXG4vLyBFWFBPUlRTXG4vLyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkaXNwbGF5RWxlbWVudHMgOiBkaXNwbGF5RWxlbWVudHMsXG4gICAgaGlkZUVsZW1lbnRzIDogaGlkZUVsZW1lbnRzLFxuICAgIGRpc3BsYXlBbmRIaWRlIDogZGlzcGxheUFuZEhpZGUsXG4gICAgY29udmVydFRvRGljZUltYWdlcyA6IGNvbnZlcnRUb0RpY2VJbWFnZXMsXG4gICAgY2xlYXJJbWFnZXMgOiBjbGVhckltYWdlcyxcbiAgICBkaXNwbGF5RGljZUltYWdlczogZGlzcGxheURpY2VJbWFnZXMsXG4gICAgZGlzcGxheVBsYXllcnMgOiBkaXNwbGF5UGxheWVycyxcbiAgICBkaXNwbGF5TGFzdEJldCA6IGRpc3BsYXlMYXN0QmV0LFxuICAgIGRpc3BsYXlSb3VuZCA6IGRpc3BsYXlSb3VuZCxcbiAgICBkaXNwbGF5Q2hhbGxlbmdlU3RhdHVzIDogZGlzcGxheUNoYWxsZW5nZVN0YXR1cyxcbiAgICBzZXRIVE1MIDogc2V0SFRNTCxcblxufTtcblxuXG5cbiJdfQ==
