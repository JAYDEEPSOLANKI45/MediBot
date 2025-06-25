const sendListTemplate = require("../templates/sendListTemplate");
const getGeminiGeneratedResponse = require("./getGeminiGeneratedResponse");

async function inquiryResponse(user,request)
{
    let prompt=`Greet as you are a medical bot name MediBot and you are here to help users book appointments faster and reduce the hassle. greet with their name if their name is not null. here is user data: ${user}, Also here is a user's message for you: `
    user["lastRequest"]="inquiry";
    user.save();
    return await getGeminiGeneratedResponse(prompt+request);
}

async function inquiryHospitalResponse(user,request)
{
    // take data of all nearby clinics and give it to gemini, let it figure out about what user is talking about and generate an asnwer. if the clinic is not there then say "the clinic you requested either does not belong in your area or is not registered with MediBot"
    let prompt=``
    user["lastRequest"]="inquiry-hospital";
    user.save();
}

async function symptomsResponse(user,request)
{
    let prompt="Be empathatic, give them a first aid medical advice in short and suggest them to make an appointment. ask them if they would like to make an appointment"
    user["lastRequest"]="symptoms";
    user.save();
    return await getGeminiGeneratedResponse(prompt+request);
}
async function bookAppointmentResponse(user,request)
{
    user["lastRequest"]="book-appointment";
    user.save();
    /*
        get list of clinics from the nearby, select the appropriate template and send it to user.
        get it from the another rest api
        ex. let clinicsList=await axios.get("/another-api/pincode");
        await listTemplates.get(clinicsList.length)(user.phone,clinicsList);
    */

        // return type mismatch
    await sendListTemplate(user.phone)
}
async function cancelAppointmentResponse(user,request)
{

}
async function checkAppointmentResponse(user,request)
{

}
async function userInformationResponse(user,request)
{
    // let prompt=
    // return await getGeminiGeneratedResponse()
}

async function randomResponse(user,request)
{
    
}

module.exports = {
  inquiryResponse,
  symptomsResponse,
  inquiryHospitalResponse,
  bookAppointmentResponse,
  cancelAppointmentResponse,
  checkAppointmentResponse,
  userInformationResponse,
  randomResponse
};
