const mongoose=require('mongoose');

const mediBotUserSchema=mongoose.Schema({
    username:String,
    phone:String,
    address:{lat:String,long:String,pincode:Number},
    verified:{type:Boolean, default:false},
    appointments:[{type:mongoose.Schema.Types.ObjectId, ref:"Appointment"}],
    lastRequest:{type:String,default:"None"},
    lastData:{type:{clinicId:{type:mongoose.Types.ObjectId},time:{type:String}},default:null}
});

module.exports=mongoose.model("MediBotUser",mediBotUserSchema)