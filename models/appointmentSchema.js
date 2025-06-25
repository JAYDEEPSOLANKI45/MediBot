const mongoose=require('mongoose')

const appointmentSchema=mongoose.Schema({
    clinic:{type:mongoose.Schema.Types.ObjectId, ref:"Clinic"},
    user:{type:mongoose.Schema.Types.ObjectId, ref:"MediBotUser"},
    date:Date,
    time:String,
    // status:{type: String, enum: ["pending", "approved", "completed"], default: "pending"},
    // notes:String
});

module.exports=mongoose.model("Appointment",appointmentSchema);