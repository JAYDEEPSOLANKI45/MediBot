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

// gemini
const genAI = require('@google/generative-ai');
const GeminiClient = new genAI.GoogleGenerativeAI(process.env.GEMINI_KEY);

// function to connect with mongoDB atlas
async function connectMongoDB()
{
    await mongoose.connect(process.env.MONGODB_URI);
}
connectMongoDB().then(message=>console.log("Connected successfully")).catch(err=>console.log(err))

// function that will take prompt as an input and returns AI generated response
async function run(prompt) {
    const model = GeminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL_NAME }); 
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text()
}

// twilio sends a post request to this endpoint for each message recieved on +14155238886
app.post("/webhook",async (req,res)=>{
    // console.log(req.body)
    let prompt=`Imagine you are a classification model made to classify the text sent by the user. The user can ask about us which can be categorized into 'inquiry', user can tell his physical symptoms like if he/she has a flu,pain. user can ask to book cancel or just check on his appointments. or he may ask about himself, which is categorized in user-information. or it is just anything random. I want you to categorize the below message into these categories 1) inquiry 2) symptoms 3) book-appointment 4) cancel-appointment 5) check-appointment 6) user-information 7) random. **Important**: Only reply in the category, do not add anything extra to the reply. Now here is the message: ${req.body.Body}`
    let reply=await run(prompt)
    let user=await MediBotUser.findOne({phone:req.body.From})
    if(!user)
        {
            user=new MediBotUser({username:req.body.ProfileName,phone:req.body.From})
            await user.save()
    }
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