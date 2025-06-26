const mongoose=require('mongoose');
const MediBotUser = require('./mediBotUserSchema');
const Clinic = require('./ClinicSchema');


const appointmentSchema=mongoose.Schema({
    clinic:{type:mongoose.Schema.Types.ObjectId, ref:"Clinic"},
    user:{type:mongoose.Schema.Types.ObjectId, ref:"MediBotUser"},
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    // status:{type: String, enum: ["pending", "approved", "completed"], default: "pending"},
    // notes:String
});


appointmentSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await MediBotUser.findByIdAndUpdate(userId, { $unset: { appointment: 1 }});
    await Clinic.findByIdAndUpdate(doc.clinic, { $pull: { appointments: doc._id } });
  }
});

module.exports=mongoose.model("Appointment",appointmentSchema);