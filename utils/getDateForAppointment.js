const chrono = require('chrono-node');

const APPOINTMENT_DURATION_MINUTES = 15;
function getAppointmentTimes(timeInput, baseDate = new Date()) {
  const startTime = chrono.parseDate(timeInput, baseDate);
  
  const endTime = new Date(startTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60000);

  return { startTime, endTime };
}

module.exports = getAppointmentTimes;
