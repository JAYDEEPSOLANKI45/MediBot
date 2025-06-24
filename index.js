// express
const express=require('express');
const app=express();
app.use(express.urlencoded({extended:true}));

// dotenv
require('dotenv').config();

// utils
const connectMongoDB = require('./utils/connectMongo.js');
const createUser = require('./utils/createUser.js');
const classifyUserGeneratedMessage = require('./utils/classifyUserGeneratedMessage');
const respondAsRequest= require("./utils/respondAsRequest.js");
const sendMessageToUser = require('./utils/sendMessageToUser.js');
const { default: axios } = require('axios');

// function to connect with mongoDB atlas
connectMongoDB();

// twilio sends a post request to this endpoint for each message recieved on +14155238886
app.post("/webhook",async (req,res)=>{

    console.log(req.body);
    // create user if it doesnt exist
    let user=await createUser(req.body.ProfileName,req.body.From);

    if(user.verified)
    {
        if(req.body.MessageType=='text')
        {
            // classify the user message
            let classified = await classifyUserGeneratedMessage(req.body.Body);

            // get reply according to request
            let reply=await respondAsRequest(user,classified,req.body.Body);

            // create a reply using TwilioClient
            sendMessageToUser(reply,req.body.From);
        }
        else if(req.body.MessageType=='location')
        {
            let address=await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${req.body.Latitude}&lon=${req.body.Longitude}`);
            user["address"]={"lat":req.body.Latitude,"long":req.body.Longitude,"pincode":address.data.address.postcode};
            sendMessageToUser("Your location has been updated, How can I help you further?",req.body.From);
        }
        else
        {
            sendMessageToUser("Other media types will be supported in future versions. Thank you for your support.",req.body.From);
        }
    }
    else
    {
        if(req.body.MessageType=='text')
        {
            // create a reply using TwilioClient
            sendMessageToUser(`Hey, Before we start please send us your live location, so we can get your nearest clinics/hospitals. This is a one time process unless you want to change it in future.`,req.body.From);
        }
        else if(req.body.MessageType=='location')
        {
            let address=await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${req.body.Latitude}&lon=${req.body.Longitude}`);
            user["address"]={"lat":req.body.Latitude,"long":req.body.Longitude,"pincode":address.data.address.postcode};
            sendMessageToUser("Thank you, Your location has been added. How can I help you today?",req.body.From);
            user['verified']=true;
            await user.save();
        }
        else
        {
            sendMessageToUser("Other media types will be supported in future versions. Thank you for your support.",req.body.From);
        }
    }
})


// port
app.listen(8080,(req,res)=>{
    console.log("listening on 8080")
})