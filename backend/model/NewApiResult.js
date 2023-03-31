const mongoose = require('mongoose');
// const uniqueValidator = require("mongoose-unique-validator");
const NewApiResultSchema = mongoose.Schema({
    eventId: { type: String, default: '' },
    data: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    fancyName: { type: String, default: '' },
    type: { type: String, default: '' },
    result: { type: String },
    runnerId: { type: String },
    status: { type: Number }
    /**
     * status: 1 ->suspend
     */
}, { timestamps: true });

// mongoose.set('useCreateIndex', true);
NewApiResultSchema.index({ eventId: 1, type: 1 });
module.exports = mongoose.model('NewApiResult', NewApiResultSchema);


// {
//     id: '116703804',
//     eventId: 1963681,
//     apisite: 2,
//     apiSiteMarketId: '667',
//     eventType: 4,
//     betfairEventId: 31271852,
//     marketName: '1st innings - Afghanistan total extras',
//     numberOfWinner: 1,
//     numberOfActiveRunners: 2,
//     marketStatus: 1,
//     isExpand: 0,
//     closeSite: null,
//     bookMode: '["6", "14"]',
//     apiSiteStatus: 'ACTIVE',
//     apiSiteSpecifier: '{"total":"7.5","inningnr":"1","maxovers":"20"}',
//     updateDate: 1646211833139,
//     min: 100,
//     max: 10000000,
//     sportsBookSelection: [ [Object], [Object] ],
//     selectionTs: 1646237723910
//   },