const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Doctor=require("./models/doctors.js");
const bodyParser = require('body-parser');
const ejsMate=require("ejs-mate");
const path = require("path");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const Patient=require("./models/patient.js");
const appoint=require("./models/appointment.js");
const { check, validationResult } = require('express-validator');



main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});
async  function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/24hrHEALTHY")
    }
app.listen(8080,()=>{
    console.log("listen at port 8080..");
});
app.use(express.static('views'));
app.engine("ejs",ejsMate);

app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

const sessionOption={
    secret:"myscretecode",
    resave:false,
    saveUninitialized:true,
    cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,  
    },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Patient.authenticate()));



passport.serializeUser(Patient.serializeUser());
passport.deserializeUser(Patient.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});



app.get("/24hrHealthy",(req,res)=>{
     res.render("../views/index.ejs");
});
app.get('/patient', (req, res) => {
  res.render("formp.ejs");
});
app.get('/signup',(req,res)=>{
    res.render("../views/signup.ejs")
});

app.post('/signup',async(req,res)=>{
    try{

        let{username,email,password}=req.body;
        const newPatient=new Patient({email,username});
        const registeredPatient=await Patient.register(newPatient,password);
        res.redirect("/login");
        }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
});





app.get("/login",(req,res)=>{
    res.render("../views/login.ejs");
});

app.post("/login",passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
    req.flash("success","Welcome back to 24hrHealthy!!");
    res.redirect("/patient");
});

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("error","you are logged out !!")
        res.redirect("/24hrHealthy");

    })
})

app.post('/submit', async(req, res) => {
    const userinput= req.body.input;
    const alldoctors = await Doctor.find({ $or: [ {symptom : `${userinput }` }, {specialty: `${userinput }`   } ] });
    res.render("../views/patient.ejs", {alldoctors});

});


// Validation middleware
const validateAppointment = [
    check('firstName').notEmpty().withMessage('First name is required'),
    check('lastName').notEmpty().withMessage('Last name is required'),
    check('mobileNumber').notEmpty().isMobilePhone().withMessage('Valid mobile number is required'),
    check('email').notEmpty().isEmail().withMessage('Valid email is required'),
    check('street').notEmpty().withMessage('Street is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('month').notEmpty().isInt({ min: 1, max: 12 }).withMessage('Valid month is required'),
    check('date').notEmpty().isInt({ min: 1, max: 31 }).withMessage('Valid date is required'),
    check('year').notEmpty().isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
    check('startTime').notEmpty().withMessage('Start time is required'),
    check('endTime').notEmpty().withMessage('End time is required')
];



app.post('/apoinform',validateAppointment, async (req, res) => {
    const { firstName, lastName, mobileNumber, email, street, city, state, month, date, year, startTime, endTime, comment,docid,loginid,
        specialty,
        name } = req.body;

    const newUser = new appoint({
    firstName,
    lastName,
    mobileNumber,
    email,
    docid,
    loginid,
    specialty,
    name,
    address: {
        street,
        city,
        state
    },
    preferredAppointmentDate: {
        month,
        date,
        year,
        startTime,
        endTime
    },
    comment,
    });
    console.log(newUser);
    try {
        await newUser.save();
        req.flash("success","We will catch you soon via your registerd Email or Phone number !!");
        console.log("data saved");
        
        res.render("../views/formp.ejs");
        
    } catch (err) {
        res.status(500).send(`Error saving user: ${err.message}`);
    }
});
app.get('/checkauthenticationapoint/:id', async (req,res)=>{
    if(!req.isAuthenticated()){
    req.flash("error","you must be logged in !!");
    res.redirect("/login");
    }else{ 
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).send('Invalid ID');
            }
            const doctor = await Doctor.findById(req.params.id);
            if (!doctor) {
            return res.status(404).send('Doctor not found');
            }
            res.render("../views/appointmentform.ejs", { currdoctor: doctor });
    } catch (err) {
            res.status(500).send('Server error');
    }

}});

app.get("/apoininfo/:id",async(req,res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('Invalid ID');
        }
        const allapoints = await appoint.find({loginid:req.params.id });
        console.log(allapoints);
        res.render("../views/appointmentnavbar.ejs", { patient :allapoints });
       
} catch (err) {
        res.status(500).send('Server error');
}

})













//image processing using symptoms
///**************************************************** */
app.get('/stomachpain',async(req,res)=>{
    const alldoctors=await Doctor.find({symptom:"Stomach pain"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/acne',async(req,res)=>{
    const alldoctors=await Doctor.find({symptom:"Acne"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/backpain',async(req,res)=>{
    const alldoctors=await Doctor.find({symptom:"Back pain"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/stress',async(req,res)=>{
    const alldoctors=await Doctor.find({symptom:"Stress"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/thyroid',async(req,res)=>{
    const alldoctors=await Doctor.find({symptom:"Thyroid"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/pcos',async(req,res)=>{
    const alldoctors=await Doctor.find({symptom:"PCOS"});
    res.render("../views/patient.ejs",{alldoctors});
});
///**************************************************** */
//image processing using specialities
app.get('/cardio',async(req,res)=>{
    const alldoctors=await Doctor.find({specialty:"Cardiology"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/dental',async(req,res)=>{
    const alldoctors=await Doctor.find({specialty:"Dental"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/diabtology',async(req,res)=>{
    const alldoctors=await Doctor.find({specialty:"Diabetology"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/eye',async(req,res)=>{
    const alldoctors=await Doctor.find({specialty:"Eye"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/gyno',async(req,res)=>{
    const alldoctors=await Doctor.find({specialty:"Gynecology"});
    res.render("../views/patient.ejs",{alldoctors});
});
app.get('/ortho',async(req,res)=>{
    const alldoctors=await Doctor.find({specialty:"Orthopedic"});
    res.render("../views/patient.ejs",{alldoctors});
});

