const twilio=require('twilio');
const Pincode = require('../models/PincodeSchema');
const sendMessageToUser = require('./appointmentReminderTemplate');

const ACCOUNT_ID=process.env.TWILIO_ACCOUNT_ID;
const AUTH_TOKEN=process.env.TWILIO_AUTH_TOKEN;
const TwilioClient=twilio(ACCOUNT_ID,AUTH_TOKEN);
const arrayOfTemplate = [process.env.BOOK_APPOINMENT_ONE,
  process.env.BOOK_APPOINTMENT_TWO,
  process.env.BOOK_APPOINTMENT_THREE,
  process.env.BOOK_APPOINTMENT_FOUR,
  process.env.BOOK_APPOINTMENT_FIVE,
  process.env.BOOK_APPOINTMENT_SIX,
  process.env.BOOK_APPOINTMENT_SEVEN,
  process.env.BOOK_APPOINTMENT_EIGHT,
  process.env.BOOK_APPOINTMENT_NINE,
  process.env.BOOK_APPOINTMENT_TEN
]

function generateVariables(clinics) {
  const vars = {};
  clinics.forEach((clinic, index) => {
    const base = index * 3;
    vars[`${1 + base}`] = clinic.name;
    vars[`${2 + base}`] = clinic._id;
    vars[`${3 + base}`] = clinic.description;
  });
  console.log(vars)
  return vars;
}


async function sendListTemplate(user) {
  try {
    let clinics = await Pincode.findOne({pincode:user.address.pincode}).populate('clinics');

    
    if (clinics.clinics.length == 0) {
      await sendMessageToUser('No clinics found for your pincode. Please try again later.', user.phone);
      return;
    }
    console.log(clinics.clinics.length)
    let templateId=arrayOfTemplate[Math.min(9, clinics.clinics.length - 1)];
    console.log(templateId)
    JSON.stringify(generateVariables(clinics.clinics.slice(0, 10)));
    const response = await TwilioClient.messages.create({
      from: 'whatsapp:+14155238886', 
      to: user.phone, 
      contentSid: templateId,
      contentVariables: JSON.stringify(generateVariables(clinics.clinics)),
    });

    console.log('Message SID:', response.sid);
  } catch (err) {
    console.error('Twilio Error:', err.message);
  }
}
module.exports = sendListTemplate;