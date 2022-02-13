const OTP = require("../models/otp.model");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const sha1 = require("sha1");
const num = require("num");

const postverifyotp = (req, res) => {
    const {
        otp, 
        email,
        name,
        usertype, 
        phone,
        password,
        otpid,
    } = req.body;

    const errors = [];
    const stringOTP = num.toString(otp);
    const encodeotp = sha1(stringOTP);

    OTP.findOne({_id:otpid})
    .then((otp) => {
        if(otp){
            const userotp = otp.otpcode;
            const diff = new Date().getTime() - otp.otpcodetime;
           
            if(diff < 0){
                if(encodeotp == userotp){
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                        } else {
                            bcrypt.hash(password, salt, (err, hash) => {
                                if (err) {
                                    console.log("1 "+err);
                                } else {
                                    const newUser = new User({
                                        name: name,
                                        usertype: usertype, 
                                        email: email,
                                        phone: phone,
                                        password: hash, 
                                    });

                                    newUser
                                    .save()
                                    .then(() => {
                                        let error = "Your account has been created Successfully. Please Sign In!";
                                        req.flash("error", error);
                                        res.redirect("/signin");
                                    })
                                    .catch(()=>{
                                        let error = "Your Phone Number has been used with another account. Please provide a new one!";
                                        req.flash("errors", error);
                                        res.redirect("/signup");
                                    });
                                }    
                            });
                        }
                    }); 
                }                  
            }
        }else{
            console.log("1");
        }
    })
    .catch((err) =>{
        console.log(err);
        errors.push("OTP has expired!");
        req.flash("errors", errors);
        res.redirect("/signup");
    })
}


const postverifyotppass = (req, res) =>{
    const {
        otp,
        password, 
    } = req.body;

    const stringOTP = num.toString(otp);
    const encodeotp = sha1(stringOTP);
    User.findOne({_id : req.user._id}).then((user) => {
        if(user){
            const errors = [];
            const userotp = user.otpcode;
            const diff = new Date().getTime() - user.otpcodetime;

            if(diff < 0){
                if(encodeotp == userotp){
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                          errors.push(err);
                          req.flash("errors", errors);
                          res.redirect("/resetpassword");
                        } else {
                          bcrypt.hash(password, salt, (err, hash) => {
                            if (err) {
                              errors.push(err);
                              req.flash("errors", errors);
                              res.redirect("/resetpassword");
                            } else {
                              User.findOne({_id: req.user._id})
                              .then((user)=>{
                                user.password = hash;
                                user
                                .save()
                              })
                              .catch((err) =>{
                                  if(err){
                                    errors.push("Error in saving the new password!");
                                    req.flash("errors", errors);
                                    res.redirect("/resetpassword");
                                  }
                              });

                              req.logout();
                              let error = "Your password has been chaged Successfully. Please Sign In again!";
                              req.flash("error", error);
                              res.redirect("/signin");
                            }
                          });
                        }
                    });
                } else {
                    errors.push("Code doesn't match! Try again.");
                    req.flash("errors", errors);
                    res.redirect("/resetpassword");
                }
            } 
            else {
                errors.push("Timed out for inserting the code, Please try again");
                req.flash("errors", errors);
                res.redirect("/resetpassword");
            }
        }
    }); 
}

const postverifyotpemail = (req, res) => {
    const {
        otp,
        email,
    } = req.body;

    const stringOTP = num.toString(otp);
    const encodeotp = sha1(stringOTP);
    User.findOne({_id : req.user._id}).then((user) => {
        if(user){
            const errors = [];
            const userotp = user.otpcode;
            const diff = new Date().getTime() - user.otpcodetime;

            if(diff < 0){
                if(encodeotp == userotp){
                    User.findOne({_id: req.user._id})
                    .then((user)=>{
                        user.email = email;
                        user
                        .save()
                        .catch((err) =>{
                            errors.push("Error in saving the new email!");
                            req.flash("errors", errors);
                            res.redirect("/resetemail");
                        })
                    })                   
                    .catch((err) =>{
                        if(err){
                            req.logout();
                            let error = "Request altered!";
                            req.flash("errors", error);
                            res.redirect("/signin");
                        }
                    });

                    req.logout();
                    let error = "Your email has been chaged Successfully. Please Sign In again!";
                    req.flash("errors", error);
                    res.redirect("/signin");
                } else {
                    errors.push("Code doesn't match! Try again.");
                    req.flash("errors", errors);
                    res.redirect("/resetemail");
                }
            } 
            else {
                errors.push("Timed out for inserting the code, Please try again");
                req.flash("errors", errors);
                res.redirect("/resetemail");
            }
        }
    }); 
}

const postverifyotpforgotpass = (req, res) =>{
    const {
        otp,
        password,
        email, 
    } = req.body;

    const stringOTP = num.toString(otp);
    const encodeotp = sha1(stringOTP);
    User.findOne({email : email}).then((user) => {
        if(user){
            const errors = [];
            const userotp = user.otpcode;
            const diff = new Date().getTime() - user.otpcodetime;

            if(diff < 0){
                if(encodeotp == userotp){
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                          errors.push(err);
                          req.flash("errors", errors);
                          res.redirect("/forgotpassword");
                        } else {
                          bcrypt.hash(password, salt, (err, hash) => {
                            if (err) {
                              errors.push(err);
                              req.flash("errors", errors);
                              res.redirect("/forgotpassword");
                            } else {
                              User.findOne({email:email})
                              .then((user)=>{
                                user.password = hash;
                                user
                                .save()
                              })
                              .catch((err) =>{
                                  if(err){
                                    errors.push("Error in saving the new password!");
                                    req.flash("errors", errors);
                                    res.redirect("/forgotpassword");
                                  }
                              });

                              req.logout();
                              let error = "Your password has been chaged Successfully. Please Sign In again!";
                              req.flash("error", error);
                              res.redirect("/signin");
                            }
                          });
                        }
                    });
                } else {
                    errors.push("Code doesn't match! Try again.");
                    req.flash("errors", errors);
                    res.redirect("/forgotpassword");
                }
            } 
            else {
                errors.push("Timed out for inserting the code, Please try again");
                req.flash("errors", errors);
                res.redirect("/forgotpassword");
            }
        }
    }); 
}

module.exports = {
    postverifyotp,
    postverifyotppass,
    postverifyotpemail,
    postverifyotpforgotpass,
}