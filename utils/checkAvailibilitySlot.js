const Appointment = require('../models/appointmentSchema');

async function isSlotAvailable(clinicId, startTime, endTime) {
  const overlap = await Appointment.findOne({
    clinicId,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      }
    ]
  });

  return !overlap;
}

module.exports = isSlotAvailable;