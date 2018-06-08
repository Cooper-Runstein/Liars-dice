const getChallengers = (face, player, table, currentPlayer)=>{
    let challengers = [];
    for (let i=1; i < table.length; i++){
        if(table[i].returnTrueIfAIChallenges(face, player)){
            if (table[i] !== currentPlayer){
                challengers.push(table[i])}
        }
    }

    if (randomTruthValue(.3)){
        return challengers;
    }return [];
};

const randomTruthValue = pct => Math.random() > pct;

module.exports = {
    getChallengers : getChallengers,
};