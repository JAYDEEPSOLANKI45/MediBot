const askAppointment = require("../templates/askAppointment");
const sendListTemplate = require("../templates/sendListTemplate");
const getGeminiGeneratedResponse = require("./getGeminiGeneratedResponse");
const Appointment = require("../models/appointmentSchema");
const Clinic = require("../models/ClinicSchema");


async function inquiryResponse(user, request) {
  let prompt = `Greet as you are a medical bot name MediBot and you are here to help users book appointments faster and reduce the hassle. greet with their name if their name is not null. here is user data: ${JSON.stringify(user)}, Also here is a user's message for you: `;
  user["lastRequest"] = "inquiry";
  user.save();
  return await getGeminiGeneratedResponse(prompt + request);
}

async function inquiryHospitalResponse(user, request) {
  let clinics=await Clinic.find({});
  let prompt = `figure out about which clinic user is talking about and generate an asnwer. Here are the registered clinics: ${JSON.stringify(clinics)}. if the clinic is not there then say "the clinic you requested either does not belong in your area or is not registered with MediBot. Here is the request of user which was classified as inquiry-hospital: `;
  user["lastRequest"] = "inquiry-hospital";
  user.save(); 
  return await getGeminiGeneratedResponse(prompt + request);
}

async function symptomsResponse(user, request) {
  let prompt =
    "User says: " +
    request +
    ", Be empathatic, give them a first aid medical advice in short and suggest them to make an appointment. ask them if they would like to make an appointment";
  user["lastRequest"] = "symptoms";
  await user.save();
  await askAppointment(await getGeminiGeneratedResponse(prompt), user.phone);
  return null;
}
async function bookAppointmentResponse(user, request) {
  /*
        get list of clinics from the nearby, select the appropriate template and send it to user.
        get it from the another rest api
        ex. let clinicsList=await axios.get("/another-api/pincode");
        await listTemplates.get(clinicsList.length)(user.phone,clinicsList);
    */

        // if user.lastData is there, which means, user has selected a clinic and now the time needs to be asked
  if (user.lastRequest=="book-appointment-time") {
    let timeInMinutes = await getGeminiGeneratedResponse(
      // time not converted into minutes correctly 11PM - > 10:00
      "Convert the given time inside this message into minutes, ex. 2PM -> 840, 5:50 PM -> 1070, **important- return only in number (minutes), no additional message with it** here is user's message: " +
        request
    );

    let appointment=new Appointment({clinic:user.lastData.clinicId,user:user._id,data:Date.now(),time:timeInMinutes.trim()});
    user.appointment=appointment._id;
    let clinic=await Clinic.findOne({_id:user.lastData.clinicId});
    /*
        not assigning doctor as of now.
    */
    console.log(clinic);
    clinic.appointments.push(appointment._id);
    user['appointment']=appointment._id;
    user['lastRequest']="None";
    user['lastData']=null;
    await user.save();
    await clinic.save();
    await appointment.save();

    return await getGeminiGeneratedResponse(
      "Tell the user that they have confirmed their booking"
    );
  }
  else if(user.lastRequest=="book-appointment")
  {
    user['lastRequest']="None";
    user['lastData']=null;
    await user.save();
    return "Previously initiated appointment has been cancelled. You can book a new appointment now."
  }
  user["lastRequest"] = "book-appointment";
  await user.save();
  // ask for the clinic.
  await sendListTemplate(user);
  return null;
}
async function cancelAppointmentResponse(user, request) {
  if(user.appointment)
  {
    await Appointment.findByIdAndDelete(user.appointment._id);
    user["lastRequest"] = "cancel-appointment";
    await user.save();
    return await getGeminiGeneratedResponse(
      "Tell user that their appointment has been cancelled, tell them to come again in case of any queries."
    );
  }
  return "You don't have any appointment booked for now. Do you need help with with anything?"
}
async function checkAppointmentResponse(user, request) {
  let prompt = "";
  if (user.appointment) {
    prompt = `User:${JSON.stringify(user)}, has a request:${request}, which is classified as check-appointment, generate an appropriate response for them.`;
  } else {
    prompt = `tell the user that they don't have any appointment booked.`;
  }
  return await getGeminiGeneratedResponse(prompt);
}
async function userInformationResponse(user, request) {
  let prompt = `tell user that their name is ${user.username}, their phone number is ${user.phone}, their address is ${user.address}, their last request was ${user.lastRequest}`;
  return await getGeminiGeneratedResponse(prompt);
}

async function randomResponse(user, request) {
  let prompt = `User's last request was ${user.lastRequest}, user's message was ${request}. if they are irrelevent just tell them that they can ask for help. otherwise tell them to be more specific on what they want to do.`;
  return await getGeminiGeneratedResponse(prompt + request);
}

module.exports = {
  inquiryResponse,
  symptomsResponse,
  inquiryHospitalResponse,
  bookAppointmentResponse,
  cancelAppointmentResponse,
  checkAppointmentResponse,
  userInformationResponse,
  randomResponse,
};
