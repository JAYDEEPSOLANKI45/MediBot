const mongoose=require('mongoose')

const clinicSchema=mongoose.Schema({
    name:String,
    address:{lat:String,long:String,pincode:Number},
    phone:String,
    email:String,
    // doctors: [{type: mongoose.Schema.Types.ObjectId, ref: "Doctor"}],
    appointments:[{type:mongoose.Schema.Types.ObjectId, ref:"Appointment"}],
})