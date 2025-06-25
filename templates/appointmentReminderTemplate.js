// twilio
const twilio=require('twilio');

const ACCOUNT_ID=process.env.TWILIO_ACCOUNT_ID;
const AUTH_TOKEN=process.env.TWILIO_AUTH_TOKEN;
const TwilioClient=twilio(ACCOUNT_ID,AUTH_TOKEN);

async function sendMessageToUser(date,time, from)
{
    TwilioClient.messages
    .create({
            from: 'whatsapp:+14155238886',
            contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
            //contentVariables: '{"1":"12/1","2":"3pm"}'
            contentVariables: `{'1':${date},'2':${time}}`,
            to: from
    })
    .then(message => console.log(message.sid))
    .done();
}

module.exports=sendMessageToUser;