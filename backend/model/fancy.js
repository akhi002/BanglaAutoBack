const mongoose = require('mongoose')

const fancySchmea = mongoose.Schema({
    F_id:{
        type: String,
    },
    name:{
        type: String,        
    },
    type_code:{
        type:String
    },
    odd_type:{
        type: String,
    },
    eventId:{
        type: String,
    },
    result:{
        type: String,
        
    },
    is_result:{
        type: Boolean,
        default:false
    },
    fancytype:{
        type: String,
    },
    isWorngsettled:{
        type:Boolean,
        default:false
    },
    isRollbacked:{
        type:Boolean,
        default:false
    }
    
})


module.exports = mongoose.model("Fancy", fancySchmea);