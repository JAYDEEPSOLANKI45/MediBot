// twilio
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twilio=require('twilio');

// express
const express=require('express');
const app=express();
app.use(express.urlencoded({extended:true}));

// mongodb
const mongoose=require('mongoose')
const MediBotUser=require("./models/mediBotUserSchema")

// dotenv
require('dotenv').config();
const ACCOUNT_ID=process.env.TWILIO_ACCOUNT_ID;
const AUTH_TOKEN=process.env.TWILIO_AUTH_TOKEN;
const TwilioClient=twilio(ACCOUNT_ID,AUTH_TOKEN);

// utils
const connectMongoDB = require('./utils/connectMongo.js');
const createUser = require('./utils/createUser.js');
const getGeminiGeneratedResponse = require('./utils/getGeminiGeneratedResponse.js');
const classifyUserGeneratedMessage = require('./utils/classifyUserGeneratedMessage');

// function to connect with mongoDB atlas
connectMongoDB()

// twilio sends a post request to this endpoint for each message recieved on +14155238886
app.post("/webhook",async (req,res)=>{
    // classify the user message
    let classified = await classifyUserGeneratedMessage(req.body.Body);
    // let reply = getGeminiGeneratedResponse()

    let reply=classified;

    // create user if it doesnt exist
    await createUser(req.body.ProfileName,req.body.From);
    
    // create a reply using TwilioClient
    TwilioClient.messages
    .create({
        body: reply,
        from: 'whatsapp:+14155238886',
        to: req.body.From
    })
    .then(message => console.log(`Message sent with SID: ${message.sid}`))
    .catch(err => console.error(err));
})


// port
app.listen(8080,(req,res)=>{
    console.log("listening on 8080")
})