const checkExpiredAppointments = require("./checkExpiredAppointments");

function setupScheduledTasks() {
  // Check for expired appointments every minute
  setInterval(async () => {
    try {
      const expiredCount = await checkExpiredAppointments();
      if (expiredCount > 0) {
        console.log(`Marked ${expiredCount} expired appointments as cancelled`);
      }
    } catch (error) {
      console.error("Error checking expired appointments:", error);
    }
  }, 60 * 1000); // Run every minutes

}

module.exports = setupScheduledTasks;
