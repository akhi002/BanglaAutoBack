const mongoose = require('mongoose');

const tossrSchema = new mongoose.Schema({
    matchName: {
        type: String,
        required: true,
    },
    EventId: {
        type: String,
        required: true,
    },
    winnerTossRunn_Name: {
        type: String,
        required: true,
    },
    winnerTossRunn_Id: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    rollback: {
        type: Boolean,
        default: false
    }

}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model("TossResult", tossrSchema);