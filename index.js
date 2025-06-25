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

// templates
const sendListTemplate=require("./templates/sendListTemplate.js");

// models
const Appointment=require("./models/appointmentSchema.js");
const Clinic=require("./models/ClinicSchema.js");

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
        else if(req.body.MessageType=='interactive')
        {
            /* refer to the last request made by the user:
                if it was book-appointment then save the lastData as the clinic doc of the selected clinic
                if it was book-appointment then save the lastData time as the selected time slot
                save the whole lastData as the appointment, book appointment in the said clinic on said time.
            */
           if(user.lastRequest=='book-appointment')
           {
                if(req.body.Body.substring(0,6)=="clinic")
                {
                    user.lastData["clinicId"]=req.body.Body.substring(7);
                    user.save();
                    /*
                        ask user which time is suited for him.
                    */
                }
                else
                {
                    /*
                        check availibility, *last-request* changes to checking-time availibility
                        if it is available, book it. else ask to reschedule.

                        **not checking availability of doctor as of now**
                    */
                    user.lastData["time"]=req.body.Body.substring(5);
                    let appointment=new Appointment({clinic:user.lastData.clinicId,user:user._id,data:Date.now(),time:user.lastData.time});
                    user.appointments.push(appointment._id)
                    clinic=await Clinic.findById(user.lastData.clinicId);
                    /*
                        not assigning doctor as of now.
                    */
                    clinic.appointments.push(appointment._id);
                    user['lastRequest']="None";
                    user['lastData']=null;
                    user.save();
                    clinic.save();
                    appointment.save();
                }
           }
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