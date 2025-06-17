const mongoose=require('mongoose');
const mediBotUserSchema=mongoose.Schema({
    username:String,
    phone:String,
    address:String
});
module.exports=mongoose.model("MediBotUser",mediBotUserSchema)