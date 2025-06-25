const {inquiryResponse,
    inquiryHospitalResponse,
    symptomsResponse,
    bookAppointmentResponse,
    cancelAppointmentResponse,
    checkAppointmentResponse,
    userInformationResponse,
    randomResponse} = require('./classifiedResponse')

const handler = new Map([
    ["inquiry", inquiryResponse],
    ["inquiry-hospital", inquiryHospitalResponse],
    ["symptoms", symptomsResponse],
    ["book-appointment", bookAppointmentResponse],
    ["cancel-appointment", cancelAppointmentResponse],
    ["check-appointment", checkAppointmentResponse],
    ["user-information", userInformationResponse],
    ["random", randomResponse]
]);

async function respondAsRequest(user,classified,request)
{
    return await handler.get(classified.trim())(user,request);
}

module.exports = respondAsRequest;