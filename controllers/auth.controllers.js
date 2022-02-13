require("dotenv").config();
const User = require("../models/User.model");
const OTP = require("../models/otp.model");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");
const sha1 = require("sha1");
const num = require("num");
const emailExistence = require('email-existence');

function between(min, max) {  
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

const transporter = nodemailer.createTransport({
    service : "Gmail",
    auth : {
        user: process.env.MailAddress,
        pass: process.env.PASS
    }
});


//Authentication
const getLogin = (req, res) => {
  res.render("auth/signin.ejs", { error: req.flash("error"), req: req });
};

const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/signin",
    failureFlash: true,
  })(req, res, next);
};

const getRegister = (req, res) => {
  res.render("auth/signup.ejs", { errors: req.flash("errors"), req: req });
};

const postRegister = (req, res) => {
  
  const { 
    name, 
    email, 
    usertype, 
    phone, 
    password, 
    confirm_password,
  } = req.body;

 
  const errors = [];

  if (!name || !email || !password || !confirm_password || !usertype || !phone) {
    errors.push("All fields are required!");
  }
  if ( usertype != "recruiter" && usertype != "jobseeker") {
    errors.push("Please select a User Type!");
  }
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters!");
  }
  if (password !== confirm_password) {
    errors.push("Passwords do not match!");
  }

  if(isNaN(phone)){
    errors.push("Phone can't be text!");
  }

  emailExistence.check(email, function(error, response){
    if(response){
      if (errors.length > 0) {
        req.flash("errors", errors);
        res.redirect("/signup");
      } else {
        User.findOne({ email: email })
        .then((user) => {
          if (user) {
            errors.push("User already exists with this email!");
            req.flash("errors", errors);
            res.redirect("/signup");
          } else {
            const otp = between(1000, 9999);
            const stringOTP = num.toString(otp);
            const otpcode = sha1(stringOTP);
            
            const newotp = new OTP({
              otpcode: otpcode,
              otpcodetime: new Date().getTime() + 300000,
            });
    
            newotp
            .save()
            .then(()=>{
              const options = {
                from: process.env.MailAddress, 
                to: email,
                subject: "Verify your Email, RandomJobs",
                html: "<h2>Hi "+`${name}`+"!</h2><br>Please insert the below code within 5 minutes for your email verification: <b>"+`${otp}`+"</b>",
              }
        
              transporter.sendMail(options, (err, info) => {
                if(err){
                  console.log(`${err}`);
                  errors.push("Your Provided Email doesn't exists, Please Sign Up again!");
                  req.flash("errors", errors);
                  res.redirect("/signup");
                } else {
                  res.render("otp/verifyotp.ejs", { otpid:newotp._id, name: name, email: email, password: password, usertype:usertype, phone:phone, req : req,error: req.flash("errors")});
                }
              })
            })
            .catch((err)=>{
              console.log(`${err}`);
            });
          }
        })
        .catch((err)=>{
          console.log(`${err}`);
          errors.push("User already exists with this email!");
          req.flash("errors", errors);
          res.redirect("/signup");
        });
      }
    } else {
      errors.push("Please enter a valid Email!");
      req.flash("errors", errors);
      res.redirect("/signup");
    }
  });
};

const getresetpassword = (req, res) => {
  res.render("auth/resetpassword.ejs", { errors: req.flash("errors"), req: req });
}

const postresetpassword = (req, res) => {
  
  const {
    new_password,
    confirm_password,
  } = req.body

  const errors = [];
  
  if (new_password.length < 6) {
    errors.push("Password must be at least 6 characters!");
  }
  if (new_password !== confirm_password) {
    errors.push("Passwords do not match!");
  }


  if (errors.length > 0) {
    req.flash("errors", errors);
    res.redirect("/resetpassword");
  } else { 
    const otp = between(1000, 9999);
    const stringOTP = num.toString(otp);
    const otpcode = sha1(stringOTP);

    User.findOne({_id: req.user._id})
    .then((user)=>{
      user.otpcode = otpcode;
      user.otpcodetime = new Date().getTime() + 300000;
      user
      .save()
    });

    const options = {
      from: process.env.MailAddress, 
      to: req.user.email,
      subject: "Verify your Email, RandomJobs",
      html: "<h2>Hi "+`${req.user.name}`+"!</h2><br>Please insert the below code within 5 minutes for your email verification: <b>"+`${otp}`+"</b>",
    }

    transporter.sendMail(options, (err, info) => {
      if(err){
        errors.push("Something is wrong, Please try again!");
        req.flash("errors", errors);
        res.redirect("/resetpassword");
      } else {
        errors.push("Please verify your email!");
        req.flash("errors", errors);
        res.render("otp/verifyotppass.ejs", { password:new_password, req : req,error: req.flash("errors")});
      } 
    });   
  }
}

const getresetemail = (req, res) => {
  res.render("auth/resetemail.ejs", { errors: req.flash("errors"), req: req });
}

const postresetemail = (req, res) => {
  const errors = [];
  const {
    new_email,
    confirm_email,
  } = req.body

  if (new_email !== confirm_email) {
    errors.push("Emails do not match!");
  }

  if (errors.length > 0) {
    req.flash("errors", errors);
    res.redirect("/resetemail");
  } else { 

    const otp = between(1000, 9999);
    const stringOTP = num.toString(otp);
    const otpcode = sha1(stringOTP);

    User.findOne({_id: req.user._id})
    .then((user)=>{
      user.otpcode = otpcode;
      user.otpcodetime = new Date().getTime() + 300000;
      user
      .save();
    });

    const options = {
      from: process.env.MailAddress, 
      to: new_email,
      subject: "Verify your Email, RandomJobs",
      html: "<h2>Hi "+`${req.user.name}`+"!</h2><br>Please insert the below code within 5 minutes for your email verification: <b>"+`${otp}`+"</b>",
    }

    transporter.sendMail(options, (err, info) => {
      if(err){
        errors.push("Something is wrong, Please try again!");
        req.flash("errors", errors);
        res.redirect("/resetpassword");
      } else {
        let errors = "Please verify your email!";
        req.flash("errors", errors);
        res.render("otp/verifyotpemail.ejs", { email:new_email, req : req,error: req.flash("errors")});
      }
    });   
  }
}

const getforgotpassword = (req,res) =>{
  res.render("auth/forgotpassmail.ejs", { errors: req.flash("errors"), req: req });
}

const postforgotpassword = (req,res) =>{
  const errors = [];
  const{
    email
  } = req.body;

  User.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push("Please type a new password");
      req.flash("errors", errors);
      res.render("auth/forgotpasspass.ejs", { email:email, errors:req.flash("errors"), req:req });
    } else {
      errors.push("User doesn't exists");
      req.flash("errors", errors);
      res.redirect("/forgotpassword");
    }
  });
}

const postforgotpasspass = (req,res) =>{
  const errors = [];
  const{
    new_password,
    confirm_password,
    email,
  } = req.body;

  if (new_password.length < 6) {
    errors.push("Password must be at least 6 characters!");
  }
  if (new_password !== confirm_password) {
    errors.push("Passwords do not match!");
  }


  if (errors.length > 0) {
    req.flash("errors", errors);
    res.redirect(req.get('referer'));
  } else { 
    const otp = between(1000, 9999);
    const stringOTP = num.toString(otp);
    const otpcode = sha1(stringOTP);

    User.findOne({email: email})
    .then((user)=>{
      user.otpcode = otpcode;
      user.otpcodetime = new Date().getTime() + 300000;
      user
      .save()

      const options = {
        from: process.env.MailAddress, 
        to: email,
        subject: "Verify your Email, RandomJobs",
        html: "<h2>Hi "+`${user.name}`+"!</h2><br>Please insert the below code within 5 minutes for your email verification: <b>"+`${otp}`+"</b>",
      }

      transporter.sendMail(options, (err, info) => {
        if(err){
          errors.push("Something is wrong, Please try again!");
          req.flash("errors", errors);
          res.redirect("/forgotpassword");
        } else {
          errors.push("Please verify your email!");
          req.flash("errors", errors);
          res.render("otp/verifyotpforgotpass.ejs", { email:email, password:new_password, req : req,error: req.flash("errors")});
        } 
      });
    });
  }
   
}


module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getresetpassword,
  postresetpassword,
  getresetemail,
  postresetemail,
  getforgotpassword,
  postforgotpassword,
  postforgotpasspass,
};
