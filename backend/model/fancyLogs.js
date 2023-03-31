const mongoose = require('mongoose');
const fancyLogsSchema = mongoose.Schema({
    eventId:{type:String},
    fancyName:{type:String},
    result:{type:String},
    fancytype:{type:String},
    createdBy:{ type :String},   
    action:{type:String, required:true},  
    time: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true });


// mongoose.set('useCreateIndex', true);
module.exports = mongoose.model('FancyLogs', fancyLogsSchema);