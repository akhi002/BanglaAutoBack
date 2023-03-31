const mongoose = require('mongoose')

const defaultScoreSchmea = mongoose.Schema({
    defaultScore:{
        type:String
    }   
})



module.exports = mongoose.model('defaultScore',defaultScoreSchmea);