const Clinic = require('../models/ClinicSchema');
const Appointment = require('../models/appointmentSchema');
const isSlotAvailable = require('./checkAvailibilitySlot');
const getAppointmentTimes = require('./getDateForAppointment');

async function bookAppointment(user, timeInput) {
  const { clinicId } = user.lastData;
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) throw new Error("Clinic not found");
    console.log(clinic)
  const { startTime, endTime } = timeInput.split(":").map(Number);

  // Optional: Check if time is within clinic hours
  const [openHour, openMin] = clinic.openingTime.split(":").map(Number);
  const [closeHour, closeMin] = clinic.closingTime.split(":").map(Number);

  const clinicOpen = new Date(startTime);
  clinicOpen.setHours(openHour, openMin, 0, 0);

  const clinicClose = new Date(startTime);
  clinicClose.setHours(closeHour, closeMin, 0, 0);

  if (startTime < clinicOpen || endTime > clinicClose) {
    await sendMessageToUser("Selected time is outside clinic working hours", user.phoneNumber);
    return null;
  }

  const available = await isSlotAvailable(clinicId, startTime, endTime);
  if (!available) {
    await sendMessageToUser("Selected time is not available, Please select another time slot", user.phoneNumber);
    return null;
  }

  // Create appointment
  const appointment = await Appointment.create({
    user: user._id,
    clinic: clinicId, // Using clinic field as per the schema
    startTime,
    endTime,
    status: 'pending' // Default status is pending, but explicitly setting it here for clarity
  });

  return appointment;
}

module.exports= bookAppointment;