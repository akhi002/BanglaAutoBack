const mongoose = require('mongoose');

const autoResultStatusSchema = new mongoose.Schema({
    autoResultAll: {
        type:Boolean,
        default:false
    }    
    
    
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model("autoResultAll", autoResultStatusSchema);
