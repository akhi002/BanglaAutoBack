const mongoose = require('mongoose');
const matchLogsSchema = mongoose.Schema({
    eventId:{type:String, required: true },
    matchName:{type:String, required:true},
    createdBy:{ type :String},
    action:{type:String, required:true},
    time: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true });


// mongoose.set('useCreateIndex', true);
module.exports = mongoose.model('MatchLogs', matchLogsSchema);