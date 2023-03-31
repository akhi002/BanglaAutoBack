const mongoose = require('mongoose');
const userLogsSchema = mongoose.Schema({
    userId:{type:String},
    password:{type:String},
    createdBy:{ type :String,required:true},
    name:{type:String},
    role:{type:String},
    action:{type:String, required:true},    
    time: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true });


// mongoose.set('useCreateIndex', true);
module.exports = mongoose.model('UserLogs', userLogsSchema);