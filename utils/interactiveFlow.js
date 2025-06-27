const Mongoose  = require("mongoose");
const { bookAppointmentResponse } = require("./classifiedResponse");
const resetUser = require("./resetUser");
const sendMessageToUser = require("./sendMessageToUser");

async function interactiveFlow(user,req)
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
}

module.exports=interactiveFlow;