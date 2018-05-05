const main = () => {

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
    const die1 = document.createElement("img");
    die1.src="../images/die1.png";

    const die2 = document.createElement("img");
    die2.src="../images/die2.png";

    const die3 = document.createElement("img");
    die3.src="../images/die3.png";

    const die4 = document.createElement("img");
    die4.src="../images/die4.png";

    const die5 = document.createElement("img");
    die5.src="../images/die5.png";

    const die6 = document.createElement("img");
    die6.src="../images/die6.png";

    const diceImages = [die1, die2, die3, die4, die5, die6];

    //Button Listeners
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
        hideElements([nextRoundButton, test]);
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
                for (let i = 0; i < this.hand.length; i++) {
                    this.hand[i] = Math.floor(Math.random() * 6) + 1;
                }
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
    const displayElements = (array) =>{
        for (let element = 0; element < array.length; element++){
        array[element].style.display = 'block';}
    };

    const hideElements = (array) =>{
        for (let element = 0; element < array.length; element++){
            array[element].style.display = 'none';
        }
    };

    const displayAndHide = (arrayAdd, arrayDelete)=>{
        displayElements(arrayAdd);
        hideElements(arrayDelete);
    };

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
        if (PlayerNumber === table.length || PlayerNumber === undefined) {
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
            displayAndHide([result, faceDisplay], [declareDisplay, declareButton, inputs]);
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
        displayAndHide([nextRoundButton, result], [nextPlayerButton]);
        handleChallengeCheck(getBetTruth());

    };

    const handleChallengeCheck = (betBoolean)=>{
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
            test2.innerHTML = `<h1 class="text-warning">${player.name} has been eliminated</h1>`;
            table.splice(index, 1);
        }
        console.log(table);

    };


    const checkForWinner = ()=>{
        if (table.length = 1){
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
};

main();
