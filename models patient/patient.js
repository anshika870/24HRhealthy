const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PassportLocalMongoose=require("passport-local-mongoose");

const patientSchema= new Schema({
            email:{
                type:String,
                required:true,
            },
});
patientSchema.plugin(PassportLocalMongoose);
module.exports=mongoose.model("Patient",patientSchema);