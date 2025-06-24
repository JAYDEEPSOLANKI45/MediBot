const mongoose=require('mongoose');

const mediBotUserSchema=mongoose.Schema({
    username:String,
    phone:String,
    address:{city:String,state:String,pincode:Number},
    verified:Boolean,
    appointments:[{type:mongoose.Schema.Types.ObjectId, ref:"Appointment"}]
});
module.exports=mongoose.model("MediBotUser",mediBotUserSchema)