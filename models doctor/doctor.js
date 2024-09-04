const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const DoctorSchema=new  Schema({
    name:String,
    specialty:String,
    symptom:String,
    ratings:Number,
    mobile_number:String,
});

const Doctor=mongoose.model("Doctor",DoctorSchema);
module.exports=Doctor;