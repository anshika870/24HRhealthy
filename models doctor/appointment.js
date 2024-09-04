const mongoose=require("mongoose");
const Schema=mongoose.Schema;

// Define the Address sub-schema
const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
});

// Define the Preferred Appointment Date sub-schema
const appointmentSchema = new Schema({
  month: { type: Number, required: true },
  date: { type: Number, required: true },
  year: { type: Number, required: true },
  startTime: { type: String, required: true }, // e.g., '10:00 AM'
  endTime: { type: String, required: true },   // e.g., '11:00 AM'
});

// Define the main schema
const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String  },
  mobileNumber: { type: String },
  email: { type: String  },
  address: addressSchema,
  preferredAppointmentDate: appointmentSchema,
  comment: { type: String },
  docid: { type: String },
  login:{type:String},
  specialty: { type: String },
  name:{type:String},
  done: {
    type: Boolean,
    default: false
},
  disease:{type:String},
  precaution:{type:String},
  prescription:{type:String},
});

// Create the model
const appoint = mongoose.model('appoint', userSchema);

module.exports = appoint;
