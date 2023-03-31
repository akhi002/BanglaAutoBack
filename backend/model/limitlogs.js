const mongoose = require('mongoose')

const limitLogSchmea = mongoose.Schema({
    eventId:{type:String, required: true },    
    createdBy:{ type :String},
    action:{type:String, required:true},
    time: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true });
    



module.exports = mongoose.model("LimitLogs", limitLogSchmea);