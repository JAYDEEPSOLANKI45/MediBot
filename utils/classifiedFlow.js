const classifyUserGeneratedMessage = require("./classifyUserGeneratedMessage");
const respondAsRequest = require("./respondAsRequest");
const sendMessageToUser = require("./sendMessageToUser");

async function classifiedFlow(user,message)
{
    // classify the user message
        let classified = await classifyUserGeneratedMessage(message);

        // get reply according to request
        let reply = await respondAsRequest(user, classified, message);


        // create a reply using TwilioClient
        reply? sendMessageToUser(reply, user.phone):console.log("Interactive message sent to user.");
}

module.exports = classifiedFlow;