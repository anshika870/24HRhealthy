const express=require("express");
const app=express();
const mongoose=require("mongoose");
const bodyParser = require('body-parser');
const ejsMate=require("ejs-mate");
const Doctor=require("./models/doctor.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const path=require("path");
const LocalStrategy=require("passport-local");
const Doclogin=require("./models/doctorlog.js");
const appoint=require("./models/appointment.js");

main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});
async  function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/24hrHEALTHY")
    }
app.listen(3000,()=>{
    console.log("listen at port 3000..");
});
app.use(express.static('views'));
app.engine("ejs",ejsMate);

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

app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session(sessionOption));
app.use(flash());
  
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Doclogin.authenticate()));
passport.serializeUser(Doclogin.serializeUser());
passport.deserializeUser(Doclogin.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});
app.get("/login",(req,res)=>{
    res.render("../views/login.ejs");
});


app.post("/login",passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
    req.flash("success","Welcome back to 24hrHealthy!!");
    const {username}=req.body;
    const currdoctor = await Doctor.findOne({ name:username });

    res.render("../views/docview.ejs",{currdoctor:currdoctor})
});

app.get('/signup',(req,res)=>{
    res.render("../views/signup.ejs");
});

app.post('/signup',async(req,res)=>{
    try {
        let { username, email, password, name, symptom, specialty, mobile_number } = req.body;
        
        // Create new doctor login
        const newDoctorLogin = new Doclogin({ email, username });
        const registeredDoctor = await Doclogin.register(newDoctorLogin, password);
        
        // Save doctor details
        const newDoctor = new Doctor({ name, symptom, specialty, mobile_number });
        await newDoctor.save();
        
        // Retrieve saved doctor information
        const currdoctor = await Doctor.findOne({ name });
        
        // Set success flash message and redirect
        req.flash('success', 'Welcome back to 24hrHealthy!!');
        res.render("../views/docview.ejs",{currdoctor:currdoctor}); // Redirect to the desired page after successful signup
        
    } catch (err) {
        // Set error flash message and redirect to signup page
        req.flash('error', err.message);
        res.redirect('/signup');
    }
});
app.get("/logout",(req,res,next)=>{
        req.logout((err)=>{
            if(err){
                return next(err);
            }
            req.flash("error","you are logged out !!")
            res.redirect("/login");
    
        })
    });

app.get('/searchdocinfo/:id', async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).send('Invalid ID');
            }
            const doctor = await Doctor.findById(req.params.id);
            console.log(doctor);
            if (!doctor) {
            return res.status(404).send('Doctor not found');
            }
            res.render("../views/profile.ejs", { currdoctor: doctor });
    } catch (err) {
            res.status(500).send('Server error');
    }
    });
app.get('/appointment/:id',async(req,res)=>{
    try {
        const id=req.params.id;
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('Invalid ID');
        }
        const patient = await appoint.find({docid:req.params.id});
        if (!patient) {
        return res.status(404).send('Doctor not found');
        }


    
        res.render("../views/showapointdetail.ejs", { patient});
} catch (err) {
        res.status(500).send('Server error');
}
});

app.get('/showapinfo/:id',async(req,res)=>{
    try {
    
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('Invalid ID');
        }
        const currapoininfo = await appoint.findById(req.params.id);
        if (!currapoininfo) {
        return res.status(404).send('APPOINTMENT NOT FOUND ');
        }
        res.render("../views/apoiinfo.ejs", { currappoin:currapoininfo   });
} catch (err) {
        res.status(500).send('Server error');
}
})
app.post("/searchpatient",async(req,res)=>{
    try {
    
        
    let {input}=req.body;
    const patient = await appoint.find({firstName:input});
    console.log(patient);
    if (!patient) {
        return res.status(404).send('Doctor not found');
        }
        res.render("../views/showapointdetail.ejs", { patient});
    } catch (err) {
            res.status(500).send('Server error');
    }

    
    // res.render("../views/showapointdetail.ejs", { patient});

})
app.get("/searchdocinfonavbar/:id",async(req,res)=>{

        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).send('Invalid ID');
            }
            const doctorid = await Doclogin.findById(req.params.id);
            const docid=doctorid.username;
            const doctor = await Doctor.findOne({name:docid});
            if (!doctor) {
            return res.status(404).send('Doctor not found');
            }
            res.render("../views/profile.ejs", { currdoctor: doctor });
    } catch (err) {
            res.status(500).send('Server error');
    }
});

app.get("/appointmentnavbar/:id",async(req,res)=>{

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('Invalid ID');
        }
        const doctorid = await Doclogin.findById(req.params.id);
        const docid=doctorid.username;
        const doctor = await Doctor.findOne({name:docid});
        const id=doctor.id;
        const patient = await appoint.find({docid:id});
        if (!patient) {
        return res.status(404).send('Doctor not found');
        }
    res.render("../views/showapointdetail.ejs", { patient});
} catch (err) {
        res.status(500).send('Server error');
}

})

app.get("/submitprescription/:id", async (req, res) => {
    const { disease, prescription, precaution } = req.body;

    // Initialize updateFields object
    const updateFields = { done: true }; // Always set done to true

    // Only add fields to updateFields if they are provided in the request
    if (disease) updateFields.disease = disease;
    if (prescription) updateFields.prescription = prescription;
    if (precaution) updateFields.precaution = precaution;

    try {
        // Use findByIdAndUpdate to update the appointment
        const updatedAppointment = await appoint.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        
        if (!updatedAppointment) {
            return res.status(404).send('Appointment not found');
        }
    
        req.flash("success", "Appointment Request Completed");
        res.status(200).send(updatedAppointment); // Send the updated document back as a response
    
    } catch (err) {
        console.error("Error updating appointment:", err); // Log the error for debugging
        res.status(500).send('Server error');
    }
});