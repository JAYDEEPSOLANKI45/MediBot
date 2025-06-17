const mongoose=require('mongoose');
const mongodb=require('mongodb')
const mediBotUserSchema=mongoose.Schema({
    username:String,
    phone:String,
    address:String,
    verified:Boolean,
    current_booking:mongodb.ObjectId,
    appointments:[mongodb.ObjectId]
});
module.exports=mongoose.model("MediBotUser",mediBotUserSchema)