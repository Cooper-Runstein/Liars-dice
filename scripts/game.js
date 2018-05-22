//##### SET UP #####
//*** New Game ***
let game = (initialValues) => {
    startGame(initialValues);
    startNextRound();
    firstPlayer();
};

const startGame = (initialValues) => {
    createHumanPlayer(initialValues);
    createAiPlayers(initialValues[1]);
    if (table[0] !== undefined) {
        table[0].player = true;}
};

const getGameSettings = ()=>{
    let name = page.nameInput.value;
    if (10 > page.playersInput.value > 0){
        let numPlayers = page.playersInput.value;
        hideElements([page.submit, page.playersInput, page.nameInput]);
        return ([name, numPlayers]);
    }return false;
};

const createHumanPlayer = (initialValues)=>{
    let human = new Player(initialValues[0]);
    human.addToTable(table);
};

const createAiPlayers = (num)=>{
    for (let i =0; i <num; i++){
        let x = new Player();
        x.addToTable();
    }
};

//*** New Round ***
const startNextRound = () => {
    table.map(x => {
        x.roll();
        x.addOccurrences();
    });
    returnNewPlayerNumber();
    currentPlayer = table[PlayerNumber];
    displayPlayers(table, page);
    console.log(`startNextRound function exited`);

};

const endRound = () => {
    resetRoundVariables();
    page.test.innerHTML = "ROUND OVER";
    PlayerNumber -= 1;
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




//*** New Turn ***
const setUpNextPlayer = () => {
    getNextPlayer();
    displayElements([page.currentPlayerDisplay, page.currentHandDisplay]);
    if (currentPlayer.player === true) {
        setUpHumanTurn();
    } else {
        setUpAiTurn();
    }
};

const setUpHumanTurn = ()=>{
    page.test2.innerHTML = "";
    displayElements([page.test2]);
    page.currentHandDisplay.innerHTML = `<h1 class="text-align"> Your Hand is: </h1>`;
    page.currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name}</h1>`;
    displayLastBet(lastBet);
    displayDiceImages(page.currentHandDisplay, convertToDiceImages(currentHand));
    displayAndHide([page.declareDisplay, page.declareButton, page.inputs], [page.spotOnButton, page.bluffButton, page.betDisplay, page.faceDisplay]);
};

const setUpAiTurn = ()=>{
    displayAndHide([page.spotOnButton, page.bluffButton, page.passButton, page.result, page.test], [page.currentHandDisplay]);
    page.result.innerHTML = "";
    page.currentPlayerDisplay.innerHTML = `<h1 class="text-align">${currentPlayer.name} is playing</h1>`;
    page.test.innerHTML = `Your hand is:`;
    displayDiceImages(page.test, convertToDiceImages(table[0].hand));
    lastBet = aiPlays();
    runAiAgainstAi();
};

//##### Human #####

const processBetValidity = (face, count) => {
    let bet = getBetIfValid(face, count);
    if (bet !== false) {
        lastBet = bet;
        displayAndHide([page.faceDisplay], [page.declareDisplay, page.declareButton, page.inputs]);
        return true;
    } else {
        page.test2.innerHTML = `<p class="display-5 text-info">Not Valid Input</p>`;
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
//##### Ai #####
const aiCheckCurrentHandValidity = hand => {
    return ((hand[0] > lastBet[0]  && hand[1] >= lastBet[1]) || hand[1] > lastBet[1])
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

const aiPlays = ()=> {
    let newBet = playerBet();
    betCount = newBet[1];
    displayElements([page.betDisplay]);
    page.betDisplay.innerHTML = `<p class="display-4">${currentPlayer.name} bets there are <br> ${newBet[1]} <span id="dice"> </span>s on the table</p>`;
    displayDiceImages(page.betDisplay, convertToDiceImages([newBet[0]]));
    return newBet;
};

const runAiAgainstAi = ()=>{
    let challengers = getChallengers(lastBet[0], false);
    console.log(challengers);
    if (challengers.length > 0){
        challenger = getOpponent(challengers);
        challenged = currentPlayer;
        hideElements([page.bluffButton, page.spotOnButton, page.passButton]);
        displayChallengeStatus(true, challenger);
        determineChallengeResult();
    }else{
        displayChallengeStatus(false, challenger);
    }
};