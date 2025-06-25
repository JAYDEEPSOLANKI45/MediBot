const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Appointment = require('../models/appointmentSchema');

// Get all appointments for clinic
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const appointments = await Appointment.find({ clinicId: req.clinicId });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel an appointment
router.patch('/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, clinicId: req.clinicId },
            { status: 'cancelled' },
            { new: true }
        );
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reschedule an appointment
router.patch('/:id/reschedule', isAuthenticated, async (req, res) => {
    try {
        const { date, time } = req.body;
        
        if (!date || !time) {
            return res.status(400).json({ message: 'Date and time are required' });
        }
        
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, clinicId: req.clinicId },
            { date, time },
            { new: true }
        );
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;