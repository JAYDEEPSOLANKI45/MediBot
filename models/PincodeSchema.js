const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
    pincode: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    clinics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Pincode', pincodeSchema);