const Appointment = require("../models/appointmentSchema");
const mediBotUser = require("../models/mediBotUserSchema");

async function checkExpiredAppointments() {
  const now = new Date();

  /*
    find the appointments that are expired
  */
  const result = await Appointment.updateMany(
    {
      endTime: { $lt: now },
      status: { $in: ["pending", "approved"] },
    },
    {
      status: "cancelled",
    }
  );
  console.log(result);
  for (let i = 0; i < result.length; i) {
    let user = await mediBotUser.findOne({ _id: result[i].user });
    user.appointment = undefined;
    await user.save();
  }
  return result.modifiedCount;
}

module.exports = checkExpiredAppointments;
