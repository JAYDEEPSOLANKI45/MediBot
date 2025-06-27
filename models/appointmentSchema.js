const mongoose=require('mongoose');
const MediBotUser = require('./mediBotUserSchema');
const Clinic = require('./ClinicSchema');


const appointmentSchema=mongoose.Schema({
    clinic:{type:mongoose.Schema.Types.ObjectId, ref:"Clinic"},
    user:{type:mongoose.Schema.Types.ObjectId, ref:"MediBotUser"},
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status:{type: String, enum: ["pending", "approved", "cancelled", "completed"], default: "pending"},
    notes: String
});


// Remove appointment reference from user when appointment is deleted
appointmentSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await MediBotUser.findByIdAndUpdate(doc.user, { $unset: { appointment: 1 }});
    // We don't remove from clinic appointments as per requirements
  }
});

// Handle status changes
appointmentSchema.pre('save', async function(next) {
  // If this is a new appointment, no need to check for status changes
  if (this.isNew) {
    return next();
  }
  
  // If status changed to cancelled or completed, remove from user document
  if (this.isModified('status') && (this.status === 'cancelled' || this.status === 'completed')) {
    await MediBotUser.findByIdAndUpdate(this.user, { $unset: { appointment: 1 }});
  }
  next();
});

module.exports=mongoose.model("Appointment",appointmentSchema);