const mongoose = require('mongoose');

const blockStatusSchema = new mongoose.Schema({
    blockStatus: {
        type: Boolean        
    }
   
    
    
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model("BlockStatus", blockStatusSchema);