require('./liarsdice.js');

displayElements = function(array){
    for (let element = 0; element < array.length; element++){
        array[element].style.display = 'block';}
};

hideElements = function(array){
    for (let element = 0; element < array.length; element++){
        array[element].style.display = 'none';
    }
};

const displayAndHide = (arrayAdd, arrayDelete)=>{
    displayElements(arrayAdd);
    hideElements(arrayDelete);
};

const getMessageColor = (loser, winner) =>{
    if (loser.player === true){
        return "text-danger";
    }else if(winner.player === true){
        return "text-success";
    }return ""

};

const displayLastBet = ()=> {
    if (lastBet[0] !== 0) {
        test.innerHTML = `<h3>Last Bet: ${lastBet[1]} </h3>`;
        displayDiceImages(test, convertToDiceImages([lastBet[0]]))
    }
};

module.exports.displayElements = displayElements;
module.exports.hideElements = hideElements;
module.exports.displayAndHide = displayAndHide;
module.exports.getMessageColor = getMessageColor;
module.exports.displayLastBet = displayLastBet;