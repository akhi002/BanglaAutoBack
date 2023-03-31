const mongoose = require('mongoose');
const websitLogsSchema = mongoose.Schema({
    websitename:{type:String},
    websiteurl:{type:String},
    createdBy:{ type :String,required:true},
    endpoint:{type:String},
    rollback:{type:String},
    action:{type:String, required:true},
    autoResult:{type:Boolean},
    blockedMatch:{type:Boolean},
    typeofweb:{type:String},
    time: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true });


// mongoose.set('useCreateIndex', true);
module.exports = mongoose.model('WebsiteLogs', websitLogsSchema);