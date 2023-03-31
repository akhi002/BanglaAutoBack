const mongoose = require('mongoose')

const matchSchmea = mongoose.Schema({
    mType:{
        type: String,
    },
    eventId:{
        type: String,
        unique:true
        
    },
    marketId:{
        type:String
    },
    eventName:{
        type: String,
    },
    competitionName:{
        type: String,
    },
    sportId:{
        type: Number,
        
    },
    sportName:{
        type: String,
    },
    openDate:{
        type: Date,
    },
    type:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isResult:{
        type:Boolean,
        default:false
    },
    isInplay:{
        type:Boolean,
        default:false

    },
    matchRunners: { 
        type: Array, 
        "default": [],
        required: true 
    },
    mType:{
        type:String
    },
    autoResult:{
        type:Boolean,
        default:true
    },
    blockedWeb:{
        type:String
    }
})


module.exports = mongoose.model("Match", matchSchmea);