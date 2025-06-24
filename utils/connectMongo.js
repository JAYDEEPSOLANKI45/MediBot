const mongoose = require("mongoose");

async function connectMongo()
{
    await mongoose.connect(process.env.MONGODB_URI).then(()=>console.log("Connected successfully")).catch(err=>console.log(err));
}

module.exports = connectMongo;