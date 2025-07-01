const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const Appointment = require("../models/appointmentSchema");
const sendMessageToUser = require("../utils/sendMessageToUser");
const mediBotUser = require("../models/mediBotUserSchema");
const getGeminiGeneratedResponse = require("../utils/getGeminiGeneratedResponse");

// Get all appointments for clinic
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const appointments = await Appointment.find({ clinic: req.clinicId });
    console.log(appointments);
    const populatedAppointments = await Appointment.find({
      clinic: req.clinicId,
    }).populate("user");
    res.status(200).json(populatedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by status
router.get("/status/:status", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.params;
    if (!["pending", "approved", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointments = await Appointment.find({
      clinic: req.clinicId,
      status: status,
    }).populate("user");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel an appointment
// send user a message that their appointment has been cancelled
router.patch("/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, clinic: req.clinicId },
      { status: "cancelled" },
      { new: true }
    ).populate("user");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    let user = await mediBotUser.findOne({ _id: appointment.user });
    user.appointment = undefined;
    await user.save();

    await sendMessageToUser(
      "We are sorry to inform you that the clinic has cancelled your appointment. Would you like to book another?",
      user.phone
    );

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reschedule an appointment
// send user a message that their appointment has been rescheduled
router.patch("/:id/reschedule", isAuthenticated, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "Start time and end time are required" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, clinic: req.clinicId },
      { startTime, endTime },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    let user = await mediBotUser.findOne({ _id: appointment.user });

    await sendMessageToUser(
      await getGeminiGeneratedResponse(
        "tell user that their appointment has been rescheduled, Here is the data about their rescheduled appointment" +
          JSON.stringify(appointment, null, 2)
      ),
      user.phone
    );
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve an appointment
router.patch("/:id/approve", isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, clinic: req.clinicId, status: "pending" },
      { status: "approved" },
      { new: true }
    ).populate("user");

    if (!appointment) {
      return res.status(404).json({ message: "Pending appointment not found" });
    }

    await sendMessageToUser(
      "Your appointment has been approved by the clinic.",
      appointment.user.phone
    );

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark appointment as completed
router.patch("/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, clinic: req.clinicId, status: "approved" },
      { status: "completed" },
      { new: true }
    ).populate("user");

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Approved appointment not found" });
    }

    await sendMessageToUser(
      "Thank you for visiting our clinic. Your appointment has been marked as completed.",
      appointment.user.phone
    );

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to manually check and update expired appointments (admin only)
router.post("/check-expired", isAuthenticated, async (req, res) => {
  try {
    const checkExpiredAppointments = require("../utils/checkExpiredAppointments");
    const expiredCount = await checkExpiredAppointments();

    res.status(200).json({
      message: `Checked for expired appointments`,
      expiredCount: expiredCount,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

module.exports = router;
