const main = () => {
//###########Document buttons and displays##############
//displays
    let currentHandDisplay = document.querySelector("#currentHand");
    let currentPlayerDisplay = document.querySelector("#currentPlayer");
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
        hideElements([startButton]);
        displayElements([submit, playersInput, nameInput]);
    });
    submit.addEventListener('click', ()=>{
      let gameInitialValues = returnGameSettings();
      if(gameInitialValues !== false){
        game(gameInitialValues);}else{
          console.log("false");
        }
    });

    returnGameSettings = ()=>{
      let name = nameInput.value;
      if (10 > playersInput.value > 0){
        console.log(`playersInput.value = ${playersInput.value}`)
        let numPlayers = playersInput.value;
        hideElements([submit, playersInput, nameInput]);
        return ([name, numPlayers]);
      }return false;
    };


    bluffButton.addEventListener('click', () => {
        console.log(`Bluff initial currentPNum: ${PlayerNumber}`);
        challenger = table[0];
        displayChallengeStatus(true);
        console.log(`Bluff called on `);
        determineChallengeResult(true);
        endRound();
    });
    nextPlayerButton.addEventListener('click', () => {
        console.log('nextPlayerListener Initialized');
        hideElements([nextPlayerButton]);
        readyNextPlayer();
        returnNewPlayerNumber();
    });
    nextRoundButton.addEventListener('click', () => {
        console.log('nextRoundListener Initialized');
        hideElements([nextRoundButton, test]);
        resetRoundVariables();
        displayRound();
        startNextRound();
        firstPlayer();
        console.log(`nextRoundListener exited-> currentPnum: ${PlayerNumber}`);

    });
    declareButton.addEventListener('click', () => {
        processBetValidity(faceInput.value, countInput.value);
        hideElements([declareDisplay, declareButton, inputs]);
        displayElements([result, faceDisplay]);
        determineChallengeResult(displayChallengeStatus(returnTrueIfAIChallenges()));
    });
    passButton.addEventListener('click', ()=>{
        hideElements([passButton, bluffButton, spotOnButton]);
        displayElements([nextPlayerButton]);
        lastBet = playerPlayAI();
    });
//TESTING AREA
    spotOnButton.addEventListener('click', () => {
        console.log('SpotOn called');
        displayChallengeStatus(true);
        displayElements([nextRoundButton]);
        determineChallengeResult(true);
        endRound();
    });
    const checkSpotOn = () =>{
        let checkArr = playerPlayAI();
        console.log(`checking if spotOn -> occuranceArray: ${diceOnTableIndexedArray}`);
        return !(diceOnTableIndexedArray[checkArr[0] -1] === checkArr[1])
    };

    const createPlayers = ()=>{

    }
    let names = [
      "Shirleen", "Kara", "Cleveland","Merri", "Conception", "Haley", "Florance", "Dorie", "Luella", "Vernia",
      "Freeman", "Katharina", "Charmain", "Graham", "Darnell", "Bernetta", "Inell", "Page", "Garnett", "Annalisa",
       "Brant", "Valda", "Viki", "Asuncion", "Moira", "Kaycee", "Richelle", "Elicia", "Eneida", "Evelynn"
    ];

// ###############OBJECTS AT TABLE##############
    const Player = function (name) {
        this.player = false;
        this.name = name || names[randomName()];
        this.hand = [0, 0, 0, 0, 0];
        this.roll = () => {
            for (let i = 0; i < this.hand.length; i++) {
                this.hand[i] = Math.floor(Math.random() * 6) + 1;
            }
            console.log(`${this.name} has rolled`);
        };
        this.addToTable = (table) => {
            table.push(this);
        };
        this.addOccurrences = () =>{
            for (let i = 0; i < this.hand.length; i++) {
                diceOnTableIndexedArray[this.hand[i] - 1] += 1;
            }
            numberOfDie += this.hand.length;
            console.log(`${this.name} has added die to occurences`);
        };
    };
    //Main Variables
    let table = [];
    let PlayerNumber;
    let currentHand;
    let currentPlayer;
    let lastBet = [0, 0];
    let betMade = false;
    let betFaceOccurrence = 0;
    let diceOnTableIndexedArray = [0,0,0,0,0,0];
    let numberOfDie = 0;
    let betIsTrue = false;
    let challenger;
    let challenged;


    const randomName = ()=> {return Math.floor(Math.random() * Math.floor(30))};
//#############Game Functions###################
    const startGame = (initialValues) => {
        console.log("startGame Function initialized");
        let human = new Player(initialValues[0]);
        human.addToTable(table);
        // sam.addToTable(table);
        // jim.addToTable(table);
        if (table[0] !== undefined) {
            table[0].player = true;
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
    const setUpNextPlayer = () => {
        currentPlayer = table[PlayerNumber];
        currentHand = currentPlayer.hand;
        displayElements([currentPlayerDisplay, currentHandDisplay]);
        if (currentPlayer.player === true) {
            currentHandDisplay.innerHTML = `<h1 class="text-align">${currentHand}</h1>`;
            currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name}</h1>`;
            displayElements([declareDisplay, declareButton, inputs]);
            hideElements([spotOnButton, bluffButton]);

        } else {
            displayElements([spotOnButton, bluffButton, passButton, result]);
            result.innerHTML = "";
            currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name}</h1>`;
            currentHandDisplay.innerHTML = `${currentPlayer.name} is playing`;
            playerPlayAI();
        }
    };
    const firstPlayer = () => {
        console.log(`firstPlayer Function Initialized-> CurrentPNum: ${PlayerNumber}`);
        setUpNextPlayer();
        PlayerNumber += 1;
        returnNewPlayerNumber();
        console.log(`firstPlayer function Exited-> CurrentPNum: ${PlayerNumber}`);
    };
    const readyNextPlayer = () => {
        console.log(`nextPlayer function initial-> currentPNum: ${PlayerNumber}`);
        setUpNextPlayer();
        PlayerNumber += 1;
        console.log(`NextPlayer Function Exited -> currentPNum: ${PlayerNumber}`);
    };
    const returnNewPlayerNumber = () => {
        if (PlayerNumber === table.length || PlayerNumber === undefined) {
            console.log(`Zeroing function Initial-> currentPNum: ${PlayerNumber}`);
            PlayerNumber = 0;
            console.log("Zerod Exit");
        } else if (PlayerNumber < 0) {
            PlayerNumber = table.length - 1;
            console.log(`Zero Exit End Table -> currentPNum: ${PlayerNumber}`);
        } else {
            console.log(`Zero Exit -> currentPNum: ${PlayerNumber}`)
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
        console.log("endRound Function initial");
        resetRoundVariables();
        test.innerHTML = "ROUND OVER";
        PlayerNumber -= 1;
        console.log(`endRound function exited -> currentPNum: ${PlayerNumber}`);
    };
    const resetRoundVariables = () => {
        lastBet = [0,0];
        betIsTrue = false;
        hideElements([passButton, bluffButton, spotOnButton, nextPlayerButton]);
        console.log(`Round Cleared`);
    };
    const displayRound = () => {
        hideElements([result]);
        console.log(`Round Displayed`);
    };
//GAME PLAY FUNCTIONS
    //Player Bets
    const testFunction = () =>{
        console.log("##########TEST FUNCTION##########");
        for (let i =0; i < table.length; i++){
            console.log(table[i].hand );
        }
        console.log(diceOnTableIndexedArray);
    };
    const checkIfBetValid = (face, count) => {
        let lastFace = lastBet[0];
        let lastCount = lastBet[1];
        if ((face > lastFace && count === lastCount) || count > lastCount) {
            betMade = true;
            betFaceOccurrence = count;
            return [face, count];
        }
        return false;
    };

    const checkBetTruth = () => {
        console.log(`checking bet -> lastBet: ${lastBet} `);
        let face = lastBet[0];
        let count = lastBet[1];
        console.log(diceOnTableIndexedArray);
        betIsTrue = (diceOnTableIndexedArray[face - 1] >= count);
        return (betIsTrue);
    };
    const processBetValidity = (face, count) => {
        if (checkIfBetValid(face, count) !== false) {
            lastBet = checkIfBetValid(face, count);
            test2.innerHTML = `${lastBet}`;
        } else {
            test2.innerHTML = "Not Valid Input";
        }
        console.log('Hand Declared');
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
        return (numberOfDie - betFaceOccurrence)/numberOfDie;
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

    const displayChallengeStatus = (challenge) =>{
        console.log("Reporting Challenge");
        if (challenge){
            challenged = currentPlayer;
            if (challenged.player === true){
                let aiTable = table.slice(1);
                console.log(`AI table ${aiTable}`);
                challenger = aiTable[Math.floor(Math.random() * aiTable.length)];
                console.log(`challenger is ${challenger.name}`);
                console.log(`challenged is ${challenged.name}`);
            }
            reportBet();
            faceDisplay.innerHTML = `<div class="text-warning display-4">CHALLENGED BY ${challenger.name}</div>`;
            return true;
        }else{
            faceDisplay.innerHTML = `<div class="text-warning display-4">No one challenges</div>`;
            return false;
        }
    };

    const determineChallengeResult = (challenge) =>{
        console.log("Testing challenge");
        if (challenge){
            displayElements([nextRoundButton, result]);
            hideElements([nextPlayerButton]);
            if (checkBetTruth()){
                result.innerHTML = `<div class = "text-success display-4"> Challenge Failed -> ${challenger.name} loses a die </div>`
                removeDie(challenger);
                if (returnIfLastDie(challenger)){
                    handleLastDieLost(challenger);
                }
            }else{
                result.innerHTML = `<div class = "text-danger display-5"> Challenge Succeeded -> ${challenged.name} loses a die </div>`
                removeDie(challenged);
                if (returnIfLastDie(challenged)){
                    handleLastDieLost(challenged);
                }
            }
        }else {
            displayElements([nextPlayerButton]);
        }
        console.log(`Challenge outcome reported`);
    };
    const removeDie = (player) =>{
        player.hand  = player.hand.splice(1);
    };
    //Computer bets
    const playerPlayAI = ()=> {
        console.log("Player is Playing");
        let pBT = playerBet();
        faceDisplay.innerHTML = `${currentPlayer.name} bets ${pBT}`;
        return pBT;
    };

    const countFaces = () =>{
        console.log(`counting faces -> current Hand: ${currentHand}`);
        let currentHandInts = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < currentHand.length; i++) {
            currentHandInts[currentHand[i] - 1] += 1;
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
