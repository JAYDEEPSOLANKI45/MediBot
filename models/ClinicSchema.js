const mongoose=require('mongoose')

const clinicSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: {
      lat: { type: String, required: true },
      long: { type: String, required: true },
      pincode: { type: Number, required: true },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // doctors: [{type: mongoose.Schema.Types.ObjectId, ref: "Doctor"}],
    appointments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Clinic",clinicSchema);