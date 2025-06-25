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

//routes
const authRoutes = require('./routes/auth');
const clinicRoutes=require('./routes/clinic');
app.use('/api/auth', authRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/appointments', require('./routes/appointments'));

// models
const Appointment=require("./models/appointmentSchema.js");
const Clinic=require("./models/ClinicSchema.js");
// Middleware
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: {
        secure: false, //process.env.NODE_ENV === 'production' 
        maxAge: 24 * 60 * 60 * 1000 // Cookie max age (1 day)
    }
}));

const session = require('express-session');
const MongoStore = require('connect-mongo');


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
            reply?sendMessageToUser(reply,req.body.From):console.log("no reply");
        }
        else if(req.body.MessageType=='location')
        {
            let address=await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${req.body.Latitude}&lon=${req.body.Longitude}`);
            user["address"]={"lat":req.body.Latitude,"long":req.body.Longitude,"pincode":address.data.address.postcode};
            sendMessageToUser("Your location has been updated, How can I help you further?",req.body.From);
        }
        else if(req.body.MessageType=='interactive')
        {

            /*if the last request was symptoms then current reply can dictate the flow of current conversation.. Yes means book an appoint
            else leave the convo
            */
            if(user.lastRequest=="symptoms")
            {
                if(req.body.Body=="Yes")
                {
                    user.lastRequest="book-appointment";
                    user.save();
                    sendMessageToUser("Which clinic would you like to book an appointment with?",req.body.From);
                }
                else
                {
                    sendMessageToUser("Ok, Have a good day. Thank you for using our services.",req.body.From);
                }
            }
            /* refer to the last request made by the user:
                if it was book-appointment then save the lastData as the clinic doc of the selected clinic
                if it was book-appointment then save the lastData time as the selected time slot
                save the whole lastData as the appointment, book appointment in the said clinic on said time.
            */
           else if(user.lastRequest=='book-appointment')
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
                    clinic["appointment"]=appointment._id;
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


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// port
app.listen(8080,(req,res)=>{
    console.log("listening on 8080")
})