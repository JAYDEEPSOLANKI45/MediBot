const classifyUserGeneratedMessage = require("./classifyUserGeneratedMessage");
const respondAsRequest = require("./respondAsRequest");
const sendMessageToUser = require("./sendMessageToUser");

async function classifiedFlow(user,req)
{
    // classify the user message
    let classified = await classifyUserGeneratedMessage(req.body.Body);
    // get reply according to request
    let reply = await respondAsRequest(user, classified, req.body.Body);
    // create a reply using TwilioClient
    reply? await sendMessageToUser(reply, req.body.From):console.log("Interactive message sent to user.");
}

module.exports = classifiedFlow;