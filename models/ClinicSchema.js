const mongoose=require('mongoose')

const clinicSchema=mongoose.Schema({
    name:String,
    address:String,
    phone:String,
    email:String,
    doctors: [{type: mongoose.Schema.Types.ObjectId,ref: "Doctor"}],
    appointments:[{type:mongoose.Schema.Types.ObjectId, ref:"Appointment"}],
})