const main = () => {
//###########Document buttons and displays##############
//displays
    let currentHandDisplay = document.querySelector("#currentHand");
    let playerDisplay = document.querySelector("#currentPlayer");
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

//Button Listeners
    startButton.addEventListener('click', () => {
        hideElements([startButton]);
        game();
    });

    declareButton.addEventListener('click', () => {
        let face = faceInput.value;
        let count = countInput.value;
        let bet = checkIfBetValid(face, count);
        if(bet !== false){
            hideElements([declareDisplay, declareButton, inputs]);
            displayElements([result, faceDisplay]);
            setLastBet(bet);
            if (returnTrueIfAIChallenges()){
               handleChallenge(returnFalseIfBluff());
                displayElements([nextRoundButton]);
            }else{
                declareTurnResults(false);
                displayElements([nextPlayerButton]);
            }
        }else{
            test2.innerHTML = `Pick Again`;
        }

    });

    bluffButton.addEventListener('click', () => {
        console.log(`Bluff initial currentPNum: ${table.currentPlayerIndex}`);
        table.challenger = table.players[0];
        table.challenged = table.currentPlayerObject;
        console.log(`Bluff called on ${table.challenged.name}`);
        handleChallenge(returnFalseIfBluff());
        displayElements([nextRoundButton, result]);
        endRound();
    });

    nextPlayerButton.addEventListener('click', () => {
        console.log('nextPlayerListener Initialized');
        hideElements([nextPlayerButton]);
        if (!returnTrueIfHumanTurn()){
            table.lastBet = playerBet();
            faceDisplay.innerHTML = `${table.currentPlayerObject.name} bets ${table.lastBet}`;
        }else{
            faceDisplay.innerHTML = "";
        }
        table.currentPlayerIndex += 1;
        returnNewPlayerNumber();
    });

    nextRoundButton.addEventListener('click', () => {
        console.log('nextRoundListener Initialized');
        hideElements([nextRoundButton, test]);
        resetRoundVariables();
        displayRound();
        startNextRound();
        firstPlayer();
        console.log(`nextRoundListener exited-> currentPnum: ${table.currentPlayerIndex}`);
    });

    passButton.addEventListener('click', ()=>{
        hideElements([passButton, bluffButton, spotOnButton]);
        displayElements([nextPlayerButton]);
        // table.lastBet = playerPlayAI();
    });
//TESTING AREA
    spotOnButton.addEventListener('click', () => {
        console.log('SpotOn called');
        decideAiChallenger(true);
        table.challenged = table.currentPlayerObject;
        table.challenger = table.players[0];
        displayElements([nextRoundButton]);
        if(checkSpotOn()){
           result.innerHTML=  `<div class = "text-danger display-5"> Challenge Succeeded -> ${table.challenged.name} loses a die </div>`;
        }
        endRound();
    });
    const checkSpotOn = () =>{
        let checkArr = table.currentBet;
        console.log(`checking if spotOn -> occuranceArray: ${table.currentDiceIndexedArray}`);
        return (table.currentDiceIndexedArray[checkArr[0] -1] === checkArr[1]);
    };

// ###############OBJECTS AT TABLE##############
    const Player = function (name) {
        this.player = false;
        this.name = name || "Player";
        this.hand = [0, 0, 0, 0, 0];
        this.roll = () => {
            for (let i = 0; i < this.hand.length; i++) {
                this.hand[i] = Math.floor(Math.random() * 6) + 1;
            }
            console.log(`${this.name} has rolled`);
        };
        this.addToTable = () => {
            table.players.push(this);
        };
        this.addOccurrences = () =>{
            for (let i = 0; i < this.hand.length; i++) {
                table.currentDiceIndexedArray[this.hand[i] - 1] += 1;
            }
            table.numberActiveDice += this.hand.length;
            console.log(`${this.name} has added die to occurences`);
        };
    };

    //Main Variables
    let table = {
        players: [],
        currentPlayerIndex: 0,
        currentPlayersHand: [0,0,0,0,0],
        currentPlayerObject: 0,
        lastBet: [0, 0],
        betMade: false,
        currentBet: [0,0],
        numberOfDeclaredFaces: 0,
        currentDiceIndexedArray : [0,0,0,0,0,0],
        numberActiveDice: 0,
        betIsTrue: false,
        challenger: null,
        challenged: null
    };

//#############Game Functions###################
    const startGame = () => {
        console.log("startGame Function initialized");
        let bob = new Player("Bob");
        let sam = new Player("Sam");
        let jim = new Player("Jim");
        bob.addToTable();
        sam.addToTable();
        jim.addToTable();
        if (table.players[0] !== undefined) {
            table.players[0].player = true;
            console.log("Players have been sat");
        } else {
            console.log("There are no players at the table");
        }
        console.log('startGame success');
        console.log(`#########Game has started###########`);
    };
    const displayElements = (array) =>{
        for (let element = 0; element < array.length; element++){
            array[element].style.display = 'block';
        }
    };
    const hideElements = (array) =>{
        for (let element = 0; element < array.length; element++){
            array[element].style.display = 'none';
        }
    };
//Player set up
    const returnTrueIfHumanTurn = () => {
        table.currentPlayerObject = table.players[table.currentPlayerIndex];
        table.currentPlayersHand = table.currentPlayerObject.hand;
        displayElements([playerDisplay, currentHandDisplay]);
        if (table.currentPlayerObject.player === true) {
            currentHandDisplay.innerHTML = `<h1 class="text-align">${table.currentPlayersHand}</h1>`;
            playerDisplay.innerHTML = `<h1 class="text-align">${table.currentPlayerObject.name}</h1>`;
            displayElements([declareDisplay, declareButton, inputs]);
            hideElements([spotOnButton, bluffButton]);
            return true;

        } else {
            displayElements([spotOnButton, bluffButton, passButton, result]);
            result.innerHTML = "";
            playerDisplay.innerHTML = `<h1 class="text-align>${table.currentPlayerObject.name}</h1>`;
            currentHandDisplay.innerHTML = `${table.currentPlayerObject.name} is playing`;
            return false;

        }
    };
    const firstPlayer = () => {
        console.log(`firstPlayer Function Initialized-> CurrentPNum: ${table.currentPlayerIndex}`);
        returnTrueIfHumanTurn();
        table.currentPlayerIndex += 1;
        returnNewPlayerNumber();
        console.log(`firstPlayer function Exited-> CurrentPNum: ${table.currentPlayerIndex}`);
    };

    const returnNewPlayerNumber =  () => {
        if (table.currentPlayerIndex === table.players.length || table.currentPlayerIndex === undefined) {
            console.log(`Zeroing function Initial-> currentPNum: ${table.currentPlayerIndex}`);
            table.currentPlayerIndex = 0;
            console.log("Zerod Exit");
        } else if (table.currentPlayerIndex < 0) {
            table.currentPlayerIndex = table.players.length - 1;
            console.log(`Zero Exit End Table -> currentPNum: ${table.currentPlayerIndex}`);
        } else {
            console.log(`Zero Exit -> currentPNum: ${table.currentPlayerIndex}`)
        }
    };
//NEW ROUND
    const startNextRound = () => {
        table.currentDiceIndexedArray = [0,0,0,0,0,0];
        for (let x = 0; x < table.players.length; x++) {
            table.players[x].roll();
            table.players[x].addOccurrences();
        }
        test2.innerHTML = `Your hand is: ${table.players[0].hand}. You have ${table.players[0].hand.length} dice left.`;
        returnNewPlayerNumber();
        table.currentPlayerObject = table.players[table.currentPlayerIndex];
        console.log(`startNextRound function exited`);

    };
    const endRound = () => {
        console.log("endRound Function initial");
        resetRoundVariables();
        test.innerHTML = "ROUND OVER";
        table.currentPlayerIndex -= 1;
        console.log(`endRound function exited -> currentPNum: ${table.currentPlayerIndex}`);
    };
    const resetRoundVariables = () => {
        table.lastBet = [0,0];
        table.betIsTrue = false;
        hideElements([passButton, bluffButton, spotOnButton, nextPlayerButton]);
        console.log(`Round Cleared`);
    };
    const displayRound = () => {
        hideElements([result]);
        console.log(`Round Displayed`);
    };

    const handleChallenge = (isBluff)=>{
        decideAiChallenger();
        if (isBluff === false){
            declareTurnResults(true, false);
            handleChallengeResults(table.challenged);
        }else{
            declareTurnResults(true, true);
            handleChallengeResults(table.challenger);
        }
    };

    const declareTurnResults = (challenge, outcome) =>{
        if (challenge === true){
            faceDisplay.innerHTML = `<div class="text-warning display-4">CHALLENGED BY ${table.challenger.name}</div>`;
            if (outcome === true){
                result.innerHTML = `<div class="display-4">${table.challenger.name}'s Challenge was successful! <br> ${table.challenged.name} loses a die.</div>`
            }else{
                result.innerHTML = `<div class="display-4">${table.challenger.name}'s Challenge failed! <br> ${table.challenger.name} loses a die.</div>`
            }
        }else{
            faceDisplay.innerHTML = `<div class="text-warning display-4">No one challenges</div>`;
        }

    };

    const handleChallengeResults = player =>{
        removeDie(player);
        handleLastDieLost(player);
    };


//GAME PLAY FUNCTIONS
    //Player Bets
    const testFunction = () =>{
        console.log("##########TEST FUNCTION##########");
        for (let i =0; i < table.players.length; i++){
            console.log(table.players[i].hand );
        }
        console.log(table.currentDiceIndexedArray);
    };
    const checkIfBetValid = (face, count) => {
        let lastFace = table.lastBet[0];
        let lastCount = table.lastBet[1];
        if ((face > lastFace && count === lastCount) || count > lastCount) {
            table.betMade = true;
            table.numberOfDeclaredFaces = count;
            return [face, count];
        }
        return false;
    };

    const checkBetTruth = () => {
        console.log(`checking bet -> lastBet: ${table.lastBet} `);
        let face = table.lastBet[0];
        let count = table.lastBet[1];
        console.log(table.currentDiceIndexedArray);
        table.betIsTrue = (table.currentDiceIndexedArray[face - 1] >= count);
        return (table.betIsTrue);
    };

    const setLastBet = (bet) => {
        table.lastBet = bet;
        test2.innerHTML = `DECLARED DICE: ${table.lastBet}`;
    };

    const reportBet = () =>{
        if (checkBetTruth() === true){
            console.log("reportBet Exit-> checkBet is true");
            return true;
        }else{
            console.log("reportBet Exit-> checkBet is false");
            return false;
        }
    };
    const returnDieOnTableRatio = () => {
        return (table.numberActiveDice - table.numberOfDeclaredFaces)/table.numberActiveDice;
    };
    const returnTrueIfAIChallenges = () => {
        let dif = returnDieOnTableRatio();
        if (dif < 0) {
            return true;
        }else if (dif === 0){
            return Math.random() > .2
        }else if (.2 >= dif > .6 ){
            return Math.random() > .4
        }else if (.6 >= dif > .8){
            return Math.random() > .7
        }else if (.8 >= dif){
            return Math.random() > .9}
    };

    const decideAiChallenger = () =>{
        console.log("Reporting Challenge");
        table.challenged = table.currentPlayerObject;
        if (table.challenged.player === true){
            let aiTable = table.players.slice(1);
            console.log(`AI table ${aiTable}`);
            table.challenger = aiTable[Math.floor(Math.random() * aiTable.length)];}

    };

    const handleDisplayonChallenge = () => {
        console.log("Testing challenge");
        displayElements([nextRoundButton, result]);
        hideElements([nextPlayerButton]);
    };

    const returnFalseIfBluff = ()=>{
        return (table.currentDiceIndexedArray[table.lastBet[0]-1] <= table.lastBet[1]);
    };

    const removeDie = (player) =>{
        player.hand  = player.hand.splice(1);
    };
    //Computer bets
    const playerPlayAI = ()=> {
        console.log("Player is Playing");
        let pBT = playerBet();
        table.currentHand = pBT;
        faceDisplay.innerHTML = `${table.currentPlayerObject.name} bets ${pBT}`;
        return pBT;
    };

    const countFaces = () =>{
        console.log(`counting faces -> current Hand: ${table.currentPlayersHand}`);
        let currentHandInts = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < table.currentPlayersHand.length; i++) {
            currentHandInts[table.currentPlayersHand[i] - 1] += 1;
        }
        return currentHandInts;
    };
    const playerBet = () => {
        console.log(`Player is betting`);
        let currentHandInts = countFaces();
        let largestCount = Math.max(...currentHandInts);
        let bestHand = [currentHandInts.indexOf(largestCount)+1, largestCount];
        if (aiCheckCurrentHandValidity(bestHand)){
            if (Math.random() > .8){
                bestHand[1] += 1;
                console.log("Player bluffed");
                return bestHand;
            }
            console.log("player has made bet");
            return bestHand;
        }else{ //IF player needs to bluff
            while (aiCheckCurrentHandValidity(bestHand) !== true){
                bestHand[1] += 1;
            }
            if (Math.random() < .2){
                bestHand[1] += 1;
                return bestHand;
            }
            console.log("player has guessed and bet");
            return bestHand
        }
    };

    const aiCheckCurrentHandValidity = hand => {
        console.log(`checking if hand is bigger -> bestHand: ${hand}`);
        return ((hand[0] > table.lastBet[0]  && hand[1] >= table.lastBet[1]) || hand[1] > table.lastBet[1])
    };

    const returnIfLastDie = player => {
        return player.hand.length === 0;
    };

    const handleLastDieLost = player =>{
        let index = table.players.indexOf(player);
        table.players = table.players.splice(index, 1);
    };

//Game Start Functions
    let cleanBoard = () => hideElements([bluffButton,spotOnButton,passButton,nextRoundButton,nextPlayerButton,faceDisplay,playerOptionsDisplay, declareButton, declareDisplay, inputs, result]);
    let game = () => {
        startGame();
        startNextRound();
        firstPlayer();
    };
    cleanBoard();
};

main();
