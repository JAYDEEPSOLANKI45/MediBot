const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Appointment = require('../models/appointmentSchema');
const sendMessageToUser = require('../utils/sendMessageToUser');
const mediBotUser = require('../models/mediBotUserSchema');
const getGeminiGeneratedResponse = require('../utils/getGeminiGeneratedResponse');

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
// send user a message that their appointment has been cancelled
router.patch('/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        // const appointment = await Appointment.findOneAndUpdate(
        //     { _id: req.params.id, clinicId: req.clinicId },
        //     { status: 'cancelled' },
        //     { new: true }
        // );
        
        const appointment = await Appointment.findOneAndDelete(
            { _id: req.params.id},
        );
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        let user=await mediBotUser.findOne({_id:appointment.user});

        await sendMessageToUser('We are sorry to inform you that the clinic has cancelled your appointment.', user.phone);

        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reschedule an appointment
// send user a message that their appointment has been rescheduled
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
        let user=await mediBotUser.findOne({_id:appointment.user});

        await sendMessageToUser(await getGeminiGeneratedResponse("tell user that their appointment has been rescheduled, Here is the data about their rescheduled appointment"+JSON.stringify(appointment, null, 2)), user.phone);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;