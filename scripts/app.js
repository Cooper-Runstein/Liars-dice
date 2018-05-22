//########### IMPORTS ##########
//DISPLAY
const {displayElements} = require('./display.js');
const {hideElements} = require('./display.js');
const {displayAndHide} = require('./display.js');
const {getMessageColor} = require('./display.js');
const {displayLastBet} = require('./display.js');
const {convertToDiceImages} = require('./display.js');
const {displayDiceImages} = require('./display.js');
const {clearImages} = require('./display.js');
const {displayPlayers} = require('./display.js');
const {displayRound} = require('./display.js');
const {displayChallengeStatus} = require('./display.js');

const {checkForWinner} = require('./challenge.js');


cleanBoard();
eventListeners();

//Button Listeners
function eventListeners(){
    page.startButton.addEventListener('click', () => {
        displayAndHide([page.submit, page.playersInput, page.nameInput], [page.startButton]);
    });

    page.submit.addEventListener('click', ()=>{
        let gameInitialValues = getGameSettings();
        if(gameInitialValues !== false){
            game(gameInitialValues);}else{
            console.log("false");
        }
    });

    page.bluffButton.addEventListener('click', () => {
        challenger = table[0];
        challenged = currentPlayer;
        displayChallengeStatus(true, challenger);
        determineChallengeResult(true);
        endRound();
    });

    page.nextPlayerButton.addEventListener('click', () => {
        hideElements([page.nextPlayerButton]);
        clearImages(page.currentHandDisplay);
        readyNextPlayer();
        returnNewPlayerNumber();
    });

    page.nextRoundButton.addEventListener('click', () => {
        hideElements([page.nextRoundButton, page.test, page.test2]);
        resetRoundVariables();
        displayRound();
        startNextRound();
        firstPlayer();
    });

    page.declareButton.addEventListener('click', () => {
        if(processBetValidity(page.faceInput.value, page.countInput.value)) {
            console.log("declarebutton validated");
            let challengers = getChallengers(page.faceInput.value, true);
            if (challengers.length > 0){
                 challenger = getOpponent(challengers);
                 challenged = table[0];
                 displayChallengeStatus(true, challenger);
                 determineChallengeResult();
             }else{
                displayChallengeStatus(false, challenger);
                displayElements([page.nextPlayerButton]);
            }
     }
    });

    page.passButton.addEventListener('click', ()=>{
        displayAndHide([page.nextPlayerButton], [page.passButton, page.bluffButton, page.spotOnButton]);
    });

    page.spotOnButton.addEventListener('click', () => {
        console.log('SpotOn called');
        challenger = table[0];
        challenged = currentPlayer;
        let loser;
        if(checkSpotOn()){
            page.result.innerHTML = `<div class = "text-warning display-4"> Spot On True -> ${challenged.name} loses a die </div>`;
           loser = challenged;
        }else{
            page.result.innerHTML = `<div class = "text-warning display-4"> Spot On False-> ${challenger.name} loses a die </div>`;
            loser = challenger;
        }
        removeDie(loser);
        checkIfEliminated(loser);
        displayElements([page.result, page.nextRoundButton]);
        endRound();
    });
}

module.exports.page = page;