const twilio=require('twilio');

const ACCOUNT_ID=process.env.TWILIO_ACCOUNT_ID;
const AUTH_TOKEN=process.env.TWILIO_AUTH_TOKEN;
const TwilioClient=twilio(ACCOUNT_ID,AUTH_TOKEN);

// const clinics = [
//   {
//     name: 'Green Valley Clinic',
//     id: 'clinic_001',
//     description: 'Main Street, Open 9 AM – 5 PM',
//   },
//   {
//     name: 'Sunshine Health Center',
//     id: 'clinic_002',
//     description: 'Park Road, Open 10 AM – 6 PM',
//   },
//   {
//     name: 'Lifecare Diagnostics',
//     id: 'clinic_003',
//     description: 'Central Market, Open 8 AM – 4 PM',
//   }
//   // Add up to 10 items
// ];

// function generateContentVariables() {
//   const vars = {};

//   clinics.forEach((clinic, index) => {
//     const varIndex = 3 + index; // 43, 44, 45... for item names
//     vars[`${varIndex}`] = clinic.name;
//     vars[`${varIndex + 10}`] = clinic.id;
//     vars[`${varIndex + 20}`] = clinic.description;
//   });

//   return vars;
// }

// async function sendListTemplate() {
//   try {
//     const response = await TwilioClient.messages.create({
//       from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
//       to: 'whatsapp:+91XXXXXXXXXX',  // Replace with recipient
//       contentSid: 'HX2348403e58620d0026a563d6deb9743b',
//       contentVariables: JSON.stringify(generateContentVariables()),
//     });

//     console.log('Message sent with SID:', response.sid);
//   } catch (error) {
//     console.error('Failed to send message:', error.message);
//   }
// }


const clinics = [
  {
    name: 'Green Valley Clinic',
    id: 'clinic_001',
    description: 'Main Street, Open 9–5',
  },
  {
    name: 'Sunshine Health',
    id: 'clinic_002',
    description: 'Near Park, Open 10–6',
  },
  {
    name: 'Lifecare',
    id: 'clinic_003',
    description: 'Central Market, Open 8–4',
  }
];

function generateVariables(clinics) {
  const vars = {};
  clinics.forEach((clinic, index) => {
    const base = index * 3;
    vars[`${1 + base}`] = clinic.name;
    vars[`${2 + base}`] = clinic.id;
    vars[`${3 + base}`] = clinic.description;
  });
  return vars;
}

async function sendListTemplate(to) {
  try {
    const response = await TwilioClient.messages.create({
      from: 'whatsapp:+14155238886', 
      to: to, 
      contentSid: 'HXdc57c43a8b13bc105b8388f0d0c32ae7',
      contentVariables: JSON.stringify(generateVariables(clinics)),
    });

    console.log('Message SID:', response.sid);
  } catch (err) {
    console.error('Twilio Error:', err.message);
  }
}



module.exports = sendListTemplate;
