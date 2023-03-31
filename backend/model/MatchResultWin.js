const mongoose = require('mongoose');
const MatchResultWinSchema = mongoose.Schema({
    eventId: { type: String, required: true },
    website: { type: String, required: true },
    status: { type: String, default: '1' },
    result: { type: Array }
}, { timestamps: true });

// mongoose.set('useCreateIndex', true);
MatchResultWinSchema.index({ eventId: 1, website: 1 });
module.exports = mongoose.model('MatchResultWin', MatchResultWinSchema);