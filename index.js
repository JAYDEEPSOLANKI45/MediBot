// express
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// dotenv
require("dotenv").config();

// Session configuration
const session = require("express-session");
const MongoStore = require("connect-mongo");
const Mongoose = require("mongoose");
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60, // Session TTL (1 day)
    }),
    cookie: {
      secure: false, //process.env.NODE_ENV === 'production'
      maxAge: 24 * 60 * 60 * 1000, // Cookie max age (1 day)
    },
  })
);

// passport
const passport = require('passport');
require('./config/passport');

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// utils
const connectMongoDB = require("./utils/connectMongo.js");
const createUser = require("./utils/createUser.js");
const classifyUserGeneratedMessage = require("./utils/classifyUserGeneratedMessage");
const respondAsRequest = require("./utils/respondAsRequest.js");
const sendMessageToUser = require("./utils/sendMessageToUser.js");
const setupScheduledTasks = require("./utils/scheduleTasks.js");
const { default: axios } = require("axios");
const { bookAppointmentResponse } = require("./utils/classifiedResponse.js");

//routes
const authRoutes = require("./routes/auth");
const clinicRoutes = require("./routes/clinic");
const saveLocation = require("./utils/saveLocation.js");
const resetUser = require("./utils/resetUser.js");
app.use("/api/auth", authRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/appointments", require("./routes/appointments"));

// function to connect with mongoDB atlas
connectMongoDB();

// twilio sends a post request to this endpoint for each message recieved on +14155238886
app.post("/webhook", async (req, res) => {
  console.log(req.body);

  // create user if it doesnt exist
  let user = await createUser(req.body.ProfileName, req.body.From);

  if (user.verified) {
    if (req.body.MessageType == "text") 
    {
      // classify the user message
      let classified = await classifyUserGeneratedMessage(req.body.Body);

      // get reply according to request
      let reply = await respondAsRequest(user, classified, req.body.Body);

      // create a reply using TwilioClient
      reply? sendMessageToUser(reply, req.body.From):console.log("Interactive message sent to user.");
    } 
    else if (req.body.MessageType == "location")
    {
      saveLocation(user,req.body.Latitude,req.body.Longitude);
      await sendMessageToUser("Your location has been updated, How can I help you further?",req.body.From);
    }
    else if (req.body.MessageType == "interactive")
    {
      /*  if the last request was symptoms then current reply can dictate the flow of current conversation.. Yes means book an appoint
          else leave the convo
      */
      if (user.lastRequest == "symptoms") {

        if (req.body.Body == "Yes") 
          {
            // sendMessageToUser("Which clinic would you like to book an appointment with?",req.body.From);
            let response=await bookAppointmentResponse(user, "book request made");
            if(response)
            {
              await sendMessageToUser(
              response,
              req.body.From
            );
            }
          } 
          else if (req.body.Body == "No") 
          {
            resetUser(user);
            await sendMessageToUser(
              "Ok, Have a good day. Thank you for using our services.",
              req.body.From
            );
          }
          else
          {
            await sendMessageToUser(
              "I am sorry I couldn't understand your request, can you please specify again.",
              req.body.From
            );
          }
      } 
      else if (user.lastRequest == "book-appointment") 
      {
        if (Mongoose.Types.ObjectId.isValid(req.body.Body)) {
          user.lastRequest = "book-appointment-time";
          user.lastData = { clinicId: req.body.Body };

          user.save();
          await sendMessageToUser(
            "Please provide a time suitable for your visit. example: 11AM, 2PM, 6PM",
            req.body.From
          );
        } else {
          await sendMessageToUser(
            "We lost a context of this conversation. Let's start again. How can I help you?.",
            req.body.From
          );
          resetUser(user);
        }
      }
    } else {
      await sendMessageToUser(
        "Other media types will be supported in future versions. Thank you for your support.",
        req.body.From
      );
    }
  } 
  else {
    if (req.body.MessageType == "text") {
      // create a reply using TwilioClient
      await sendMessageToUser(
        `Hey, Before we start please send us your live location, so we can get your nearest clinics/hospitals. This is a one time process unless you want to change it in future.`,
        req.body.From
      );
    } else if (req.body.MessageType == "location") {
      user["verified"] = true;
      saveLocation(user,req.body.Latitude,req.body.Longitude);
      await sendMessageToUser(
        "Thank you, Your location has been added. How can I help you today?",
        req.body.From
      );
      
    } else {
      await sendMessageToUser(
        "Other media types will be supported in future versions. Thank you for your support.",
        req.body.From
      );
    }
  }
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  let user = await createUser(req.body.ProfileName, req.body.From);
  resetUser(user);
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// port
app.listen(8080, (req, res) => {
  console.log("listening on 8080");
});
