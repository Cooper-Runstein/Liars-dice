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
    let options = document.querySelector("#options");

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
            let challengers = getChallengers(faceInput.value);
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

//TESTING AREA
    spotOnButton.addEventListener('click', () => {
        console.log('SpotOn called');
        challenger = table[0];
        challenged = currentPlayer;
        if(checkSpotOn()){
            result.innerHTML = `<div class = "text-warning display-4"> Spot On True -> ${challenged.name} loses a die </div>`;
        }else{
            result.innerHTML = `<div class = "text-warning display-4"> Spot On False-> ${challenger.name} loses a die </div>`;
        }
        displayElements([result, nextRoundButton]);
        endRound();
    });

    const checkSpotOn = () =>{
        return (diceOnTableIndexedArray[lastBet[0] -1] === lastBet[1])
    };


   let names = [
        "Shirleen", "Kara", "Cleveland","Merri", "Conception", "Haley", "Florance", "Dorie", "Luella", "Vernia",
        "Freeman", "Katharina", "Charmain", "Graham", "Darnell", "Bernetta", "Inell", "Page", "Garnett", "Annalisa",
        "Brant", "Valda", "Viki", "Asuncion", "Moira", "Kaycee", "Richelle", "Elicia", "Eneida", "Evelynn"
    ];

// ###############OBJECTS AT TABLE##############
    class Player{
        constructor(name)
        {
            this.player = false;
            this.name = name || getRandomName();
            this.hand = [0, 0, 0, 0, 0];
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
            this.returnTrueIfAIChallenges = (face) => {
                let playerNum = getFaceCount(this, face);
                console.log(face);
                console.log(playerNum);
                let dif = dieRatio(playerNum);
                console.log(dif);
                if (dif < 0) {
                    return true;
                }else if (dif === 0){
                    return Math.random() > .1
                }else if (.2 >= dif > .4 ) {
                    return Math.random() > .25
                }else if (.4 >= dif > .6 ){
                    return Math.random() > .5
                }else if (.6 >= dif > .8){
                    return Math.random() > .75
                }else if (.8 >= dif){
                    return Math.random() > .9}
            };


        }
    }
    let getFaceCount = (player, face)=>{
        let arr = countFaces(player.hand);
        console.log(player.name + arr);
        return arr[face-1];
    };

    let dieRatio = (playerNum) => {
        return (numberOfDie - (betFaceOccurrence-playerNum))/numberOfDie;
    };

    //Main Variables
    let table = [];
    let PlayerNumber;
    let currentHand;
    let currentPlayer;
    let lastBet = [0, 0];
    let betFaceOccurrence = 0;
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
        currentHandDisplay.innerHTML = `<h1 class="text-align">${currentHand}</h1>`;
        currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name}</h1>`;
        displayAndHide([declareDisplay, declareButton, inputs], [spotOnButton, bluffButton]);
    };

    const setUpAiTurn = ()=>{
        displayElements([spotOnButton, bluffButton, passButton, result]);
        result.innerHTML = "";
        currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name} is playing</h1>`;
        currentHandDisplay.innerHTML = `Your hand is: ${table[0].hand}`;
        lastBet = playerPlayAI();
        //runAiAgainstAi();
    };

    const runAIAgainstAI = ()=>{

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
        test2.innerHTML = `Your hand is: ${table[0].hand}. You have ${table[0].hand.length} dice left.`;
        returnNewPlayerNumber();
        currentPlayer = table[PlayerNumber];
        console.log(`startNextRound function exited`);

    };

    const endRound = () => {
        resetRoundVariables();
        test.innerHTML = "ROUND OVER";
        PlayerNumber -= 1;
    };

    const resetRoundVariables = () => {
        lastBet = [0,0];
        betFaceOlastCountccurrence = 0;
        numberOfDie = 0;
        diceOnTableIndexedArray=[0,0,0,0,0,0];
        hideElements([passButton, bluffButton, spotOnButton, nextPlayerButton]);
    };

    const displayRound = () => {
        hideElements([result]);
    };

//GAME PLAY FUNCTION
    const testHandsFunction = () =>{
        console.log("##########TEST FUNCTION##########");
        for (let i =0; i < table.length; i++){
            console.log(table[i].hand );
        }
        console.log(diceOnTableIndexedArray);
    };

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
            test2.innerHTML = `<p class="display-5 text-info">Last Bet: ${lastBet}</p>`;
            return true;
        } else {
            test2.innerHTML = `<p class="display-5 text-info">Not Valid Input</p>`;
        }
    };


    const getBetIfValid = (face, count) => {
        //FIX ME?
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
            betFaceOccurrence = count;
            return [face, count];
        }
        return false;
    };

    const getChallengers = (face)=>{
        let challengers = [];
        for (let i=1; i < table.length; i++){
            if(table[i].returnTrueIfAIChallenges(face)){
                challengers.push(table[i])
            }
        }return challengers;
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

    const checkIfEliminated = (betLoser)=>{
        if (returnIfLastDie(betLoser)){
            handleLastDieLost(betLoser);}
    };

    const removeDie = (player) =>{
        player.hand  = player.hand.splice(1);
    };

    //Computer bets
    const playerPlayAI = ()=> {
        let newBet = playerBet();
        faceDisplay.innerHTML = `${currentPlayer.name} bets ${newBet}`;
        test2.innerHTML=`Last Bet: ${lastBet}`;
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
        table = table.splice(index, 1);
    };

//Game Start Functions
    let cleanBoard = () => hideElements([submit,nameInput, playersInput, bluffButton,spotOnButton,passButton,nextRoundButton,nextPlayerButton,faceDisplay,playerOptionsDisplay, declareButton, declareDisplay, inputs, result]);
    let game = (initialValues) => {
        startGame(initialValues);
        startNextRound();
        firstPlayer();
    };
    cleanBoard();
};

main();
