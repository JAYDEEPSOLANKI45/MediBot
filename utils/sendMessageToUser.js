// twilio
const twilio=require('twilio');

const ACCOUNT_ID=process.env.TWILIO_ACCOUNT_ID;
const AUTH_TOKEN=process.env.TWILIO_AUTH_TOKEN;
const TwilioClient=twilio(ACCOUNT_ID,AUTH_TOKEN);

async function sendMessageToUser(message, from)
{
    TwilioClient.messages
    .create({
        body: message,
        from: 'whatsapp:+14155238886',
        to: from
    })
    .then(message => console.log(`Message sent with SID: ${message.sid}`))
    .catch(err => console.error(err));
}

module.exports=sendMessageToUser;