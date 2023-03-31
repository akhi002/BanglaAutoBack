const mongoose = require('mongoose')

const adminUserSchmea = mongoose.Schema({
    userId:{
        type:String
    },

    password:{
        type:String
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true
    },
}, { timestamps: { createdAt: 'created_at' } });
// })



module.exports = mongoose.model('AdminUser',adminUserSchmea);