const mongoose=require('mongoose');

const doctorSchema=mongoose.Schema({
    name:String,
    department:String,
    clinic:{type:mongoose.Schema.Types.ObjectId,ref:"Clinic"},
    // 9AM to 8PM, assigned or not
    assigned:[String]
})