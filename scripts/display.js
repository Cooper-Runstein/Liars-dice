
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

module.exports.displayElements = displayElements;
module.exports.hideElements = hideElements;
module.exports.displayAndHide = displayAndHide;