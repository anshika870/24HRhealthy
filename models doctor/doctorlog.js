const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PassportLocalMongoose=require("passport-local-mongoose");

const DoctorSchema= new Schema({
            email:{
                type:String,
                required:true,
            },
});
DoctorSchema.plugin(PassportLocalMongoose);
module.exports=mongoose.model("Doclogin",DoctorSchema);