const Clinic=require('../models/ClinicSchema')
const express = require('express');
const router = express.Router();

// Get clinics by pincode
router.get('/:pincode', async (req, res) => {
    try {
        const Pincode = require('../models/PincodeSchema');
        const pincodeDoc = await Pincode.findOne({ pincode: req.params.pincode })
            .populate('clinics');
            
        if (!pincodeDoc || pincodeDoc.clinics.length === 0) {
            return res.status(404).json({ message: 'No clinics found for this pincode' });
        }
        res.json(pincodeDoc.clinics);
    } catch (error) {
        console.error('Error fetching clinics:', error);
        res.status(500).json({ message: 'Error fetching clinics' });
    }
});

module.exports = router;