const twilio = require('twilio');

const ACCOUNT_ID = process.env.TWILIO_ACCOUNT_ID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TwilioClient = twilio(ACCOUNT_ID, AUTH_TOKEN);

async function askAppointment(geminiResponse, to) {
  try {
    const response = await TwilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      to: to,
      contentSid: 'HX781ab2c0de9297b05694acd3e3ed7fef',
      contentVariables: JSON.stringify({
        "1": geminiResponse
      })
    });

    console.log('Message SID:', response.sid);
  } catch (err) {
    console.error('Twilio Error:', err.message);
  }
}

module.exports = askAppointment;
