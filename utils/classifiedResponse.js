const getGeminiGeneratedResponse = require("./getGeminiGeneratedResponse");

async function inquiryResponse(request)
{
    let prompt=`Greet as you are a medical bot name MediBot and you are here to help users book appointments faster and reduce the hassle. Also here is a user's message for you: `
    return await getGeminiGeneratedResponse(prompt+request)
}

async function inquiryHospitalResponse(request)
{
    let prompt=``
}

async function symptomsResponse(request)
{

}
async function bookAppointmentResponse(request)
{

}
async function cancelAppointmentResponse(request)
{

}
async function checkAppointmentResponse(request)
{

}
async function userInformationResponse(request)
{

}

async function randomResponse(request)
{

}


module.exports = {
  inquiryResponse,
//   symptomsResponse,
//   bookAppointmentResponse,
//   cancelAppointmentResponse,
//   checkAppointmentResponse,
//   userInformationResponse,
//   randomResponse
};
