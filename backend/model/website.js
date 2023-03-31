const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    websitename: {
        type: String,
        required: true,
    },
    websiteurl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    rollback: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    block_status: {
        type: String,
        default: 'ON'
    },
    autoResult:{
            type:Boolean,
            default:true
    },
    blockedMatch:    {
        type:Boolean,
        default:true
    }
    
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model("website", websiteSchema);