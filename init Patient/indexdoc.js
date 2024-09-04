const mongoose=require("mongoose");
const doctordata=require("../init/docdata.js");
const Doctor=require("../models/doctors.js");



main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});
async  function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/24hrHEALTHY");
}

const initdoc =async()=>{
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctordata.data);
    console.log("data was intialized");
};
initdoc();