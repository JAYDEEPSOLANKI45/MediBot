const getGeminiGeneratedResponse = require("./getGeminiGeneratedResponse")

async function classifyUserGeneratedMessage(userMessage)
{
    let prompt=`Imagine you are a classification model made to classify the text sent by the user. The user can ask about us or greet, which can be categorized into 'inquiry'.User can also inquire about a specific hospital/clinic so categorieze into 'inquiry-hospital'. user can tell his physical symptoms like if he/she has a flu,pain. user can ask to book cancel or just check on his appointments. or he may ask about himself, which is categorized in user-information but if it is related to his physical self then categorize into symptoms. or it is just anything random. I want you to categorize the below message into these categories 1) inquiry 2) symptoms 3) book-appointment 4) cancel-appointment 5) check-appointment 6) user-information 7) random 8) inquiry-hospital. **Important**: Only reply in the category, do not add anything extra to the reply. Also the user can ask in any language, understand what is user trying to say and classify it. Now here is the message: ${userMessage}`
    let reply=await getGeminiGeneratedResponse(prompt);
    console.log(reply);
    return reply;
};

module.exports = classifyUserGeneratedMessage;