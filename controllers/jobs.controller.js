
require("dotenv").config();
const User = require("../models/User.model");
const Job = require('../models/job.model');

const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');


const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service : "Gmail",
  auth : {
      user: process.env.MailAddress,
      pass: process.env.PASS
  }
});


const conn = mongoose.createConnection(process.env.MongoURI);
let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const getJobCreation = (req, res) => {
    res.render("jobs/jobCreation.ejs", { errors: req.flash("errors"), req: req });
}

const postJobCreation = (req, res) => {
  const errors = [];

  const {
    name, 
    category, 
    jobtype,
    startdate,
    enddate, 
    union,
    thana,
    district,
    payment, 
    jobdescription,
  } = req.body;

  if (!name || !category || !jobtype || !startdate || !enddate || !union || !thana || !district || !payment) {
    errors.push("All fields are required!");
  }

  if(isNaN(payment)){
    errors.push("Payment must be in Number!");
  }

  if(category == " "){
    errors.push("Please select a Category!");  
  }

  if(jobtype == " "){
    errors.push("Please select a Job Type!");  
  }


  if(errors>0){
    req.flush("erros", errors);
    res.redirect("/jobcreation");
  } else{
    User.findById(req.user._id).exec(async (error, user) => {
      if(user){
          const newJob = new Job({
          name: name,
          recruiter: {
            id: user._id,
            name: user.name,
          },
          category: category,
          jobtype: jobtype,
          startdate: new Date(startdate),
          enddate: new Date(enddate),
          union: union,
          thana: thana,
          district: district,       
          payment: payment,
          jobdescription: jobdescription,
          document: req.file.filename,
        });

        newJob.save((error, data) => {
          if (error) {
            console.log(err);
            res.redirect("/jobcreation");
          } else {
            if (data) {
              User.findOneAndUpdate(
                { _id: req.user._id },
                {
                  $push: {jobs : data._id},
                },
                {
                  new: true,
                }
              ).exec(async (error, user) => {
                if (error){
                  console.log(error);
                  res.redirect("/jobcreation");
                }
                if (user) {
                  user
                  .save()
                  .then(() => res.redirect("/dashboard"))
                  .catch((err) =>{
                    console.log(err);
                    res.redirect("/jobcreation");
                  });
                }
              });
            }
          }
        });
      }
    })
  }
}

const getdetailedpostedjob = (req, res) => {
  const id = req.params.id;
  Job.findOne({_id: id})
  .then((job) =>{
    isrequested = req.user.requestedjobs.includes(job._id);
    isassigned = req.user.assignedjobs.includes(job._id);
    res.render("jobs/seekerjob.ejs", {job: job, errors : req.flash("errors"), req: req, isrequested:isrequested, isassigned:isassigned});
  })
  .catch((err)=>{
    console.log(err);
  })
}

const getpostedjobdetails  = (req, res) => {
  const id = req.params.id;
  Job.findOne({_id: id})
  .then((job) =>{
    isrequested = req.user.requestedjobs.includes(job._id);
    isassigned = req.user.assignedjobs.includes(job._id);
    res.render("jobs/postedjobdetails.ejs", {job: job, errors : req.flash("errors"), req: req, isrequested:isrequested, isassigned:isassigned});
  })
  .catch((err)=>{
    console.log(err);
  })
}


const getjobdescription = (req, res) => {
  const id = req.params.id;
  Job.findOne({_id: id})
  .then((job) =>{
    res.render("jobs/recruiterjob.ejs", {job: job, errors : req.flash("errors"), req: req});
  })
  .catch((err)=>{
    console.log(err);
  })
}

const jobrequest = (req,res) => {
  const id = req.params.id;
  const errors = [];

  Job.findOneAndUpdate(
    { _id: id },
    {
      $push: {
        requests : {
          id : req.user._id,
          name : req.user.name,
        } 
      },
    },
    {
      new: true,
    }
  ).exec(async (error, job) => {
    if (error) console.log(error);
    if (job) {
      console.log("2");
      job
        .save()
        .then(()=>{
          console.log("3");
          User.findOneAndUpdate(
            { _id: req.user._id }, 
            {
              $push: {
                requestedjobs : job._id,
              },
            },
            {
              new: true,
            }
          )
          .exec( async (err, job) =>{
            if(job){
              errors.push("Job Request has been made!");
              req.flash("errors", errors);
              res.redirect("/requestedjobs/"+id);
            }
          })
        })
        .catch((err) => console.log(err));
    } else {
      return console.log("no instructor");
    }
  });
}

const jobAssigned = (req,res) => {
  const errors = [];

  const {
    id,
    u_id,
  } = req.params;

  User.findOne({_id: u_id})
  .then((usr) => {
    if(usr){
      Job.findOneAndUpdate(
        { _id: id }, 
        {
          $push: {
            assigned : {
              id : usr._id,
              name : usr.name,
            }
          },
          isassigned: true,
        },
        {
          new: true,
        }
      ).exec(async (error, job) => {
        if (error) return res.status(400).json({ message: error });
        if (job) {
          job
            .save()
            .then(() => {
              User.findOneAndUpdate(
                { _id: u_id }, 
                {
                  $push: {
                    assignedjobs : job._id,
                  },
                },
                {
                  new: true,
                }
              )
              .exec( async (err, user) =>{
                if(user){
                  user.save()
                  .then(()=>{
                    const options = {
                      from: process.env.MailAddress, 
                      to: user.email,
                      subject: "You have been assigned to a JOB, RandomJobs",
                      html: "<h2>Hi "+`${user.name}`+"!</h2><br>You have been assigned to the job: <b>"+`${job.name}`+"<br>Please click the url for details: http://www.randomjobs.com/postedjobs/"+`${job._id}`+"<br>",
                    }
              
                    transporter.sendMail(options, (err, info) => {
                      if(err){
                        console.log(`${err}`);
                      }
                    })
                    errors.push("This Job has been Assigned!");
                    req.flash("errors", errors);
                    res.redirect("/yourjobs/"+id);
                  })
                }
              })
            })
            .catch((err) => console.log(err));
        } else {
         console.log("error");
        }
      })      
    }  
  });
}

const jobDone = (req,res) => {

  const id = req.params.id;
  const errors = [];

  Job.findOneAndUpdate(
    { _id: id },
    {done : true },
    {
      new: true,
    }
  ).exec(async (err, job) => {
    if (job) {
      job
        .save()
        .then(()=> {
          User.findOne({_id: job.assigned.id})
          .then((user)=>{
            const options = {
              from: process.env.MailAddress, 
              to: user.email,
              subject: "Your assigned JOB is now marked as DONE, RandomJobs",
              html: "<h2>Hi "+`${user.name}`+"!</h2><br>Your assigned job has been completed and now it is now marked as 'DONE' by the recruiter."
            }
      
            transporter.sendMail(options, (err, info) => {
              if(err){
                console.log(`${err}`);
              } else {
                errors.push("This Job has been marked as Done!");
                req.flash("errors", errors);
                res.redirect("/yourjobs/"+id);
              }
            })
          })
        })
        .catch((err) => console.log(err));
    } else {
      console.log(err);
    }
  });
}

const getjobdocument = (req, res) =>{
  const id = req.params.id;
  
  Job.findOne({_id: id})
  .then((job) =>{
    gfs.files.findOne({ filename: job.document }, (err, file) => {
      if (!file || file.length === 0) {
        res.redirect("/dashboard");
      }
     else{
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      }
    });
  })
  .catch((err)=>{
    console.log(err);
  })
}

const getpostedjobs = (req, res) =>{
  Job.find({
    startdate:{
      $gte: Date.now(),
      $lt: new Date("2300-04-30T00:00:00.000Z"),
    },
    enddate:{
      $gte: Date.now(),
      $lt: new Date("2300-04-30T00:00:00.000Z"),
    }
  })
  .then((jobs)=>{
    if(jobs){
      function custom_sort(a, b) {
        return -1*(new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      jobs.sort(custom_sort);
      res.render("jobs/postedjobs.ejs", {jobs: jobs, errors : req.flash("errors"), req: req});
    }
  })
}

const getyourjobs = (req, res) => {
  User.findById(req.user._id).exec( (error, user) => {
    if(user){
      const jobs = [];
      var i = 0;
      var length = 0;
     
      if(user.jobs.length == 0){
        res.render("jobs/nopostedjobs.ejs", {req : req});
      } else {
        for(; i < user.jobs.length; i++){
          Job.findById(user.jobs[i]).exec((error, data) => {
            if(data){
              jobs.push(data);
            }
            if(i == user.jobs.length){
              length += 1;
              if(length == user.jobs.length){
                function custom_sort(a, b) {
                  return -1*(new Date(a.date).getTime() - new Date(b.date).getTime());
                }
                jobs.sort(custom_sort);
                res.render("jobs/yourjobs.ejs", {jobs: jobs, req: req});  
              }
            }
          });
        }   
      }
    }
  })
}

const getrequestedjobs = (req,res) =>{
  User.findById(req.user._id).exec( (error, user) => {
    if(user){
      const jobs = [];
      var i = 0;
      var length = 0;

      if(user.requestedjobs.length == 0){
        res.render("jobs/norequestedjobs.ejs", {req:req});
      } else {
        for(; i < user.requestedjobs.length; i++){
          Job.findById(user.requestedjobs[i])
          .then((job) => {
            if(job){
              jobs.push(job);
            }
            if(i == user.requestedjobs.length){
              length += 1;
              if(length == user.requestedjobs.length){
                function custom_sort(a, b) {
                  return -1*(new Date(a.date).getTime() - new Date(b.date).getTime());
                }
                jobs.sort(custom_sort);
                res.render("jobs/requestedjobs.ejs", {jobs: jobs, req: req});  
              }
            }
          });
        }
      } 
    }
  })
}

const postpostedjobs = (req, res) =>{
  var {
    name,
    category, 
    jobtype,
    union,
    thana,
    district,
  } = req.body;

  if(category == " "){
    category = "";
  }
  if(jobtype == " "){
    jobtype = "";
  }

  Job.find(
  {
    name:{
      $regex: new RegExp(name, "i")
    },
    category:{
      $regex: new RegExp(category, "i")
    },
    jobtype:{
      $regex: new RegExp(jobtype, "i")
    },
    union:{
      $regex: new RegExp(union, "i")
    },
    thana:{
      $regex: new RegExp(thana, "i")
    },
    district:{
      $regex: new RegExp(district, "i")
    },
    startdate:{
      $gte: Date.now(),
      $lt: new Date("2300-04-30T00:00:00.000Z"),
    },
    enddate:{
      $gte: Date.now(),
      $lt: new Date("2300-04-30T00:00:00.000Z"),
    },    
  })
  .then((jobs) =>{
    if(jobs.length > 0){
      function custom_sort(a, b) {
        return -1*(new Date(a.startdate).getTime() - new Date(b.startdate).getTime());
      }
      jobs.sort(custom_sort);  
      const errors = [];
      errors.push("Your Search Result!");
      res.render("jobs/searchedjobs.ejs", {jobs: jobs, errors : req.flash("errors"), req: req});
    } else {
      res.render("jobs/nosearchedjobs.ejs", {req : req});
    }
  })
  .catch((err)=>{
    console.log(err);
  })
}

const getsearch = (req, res) => {
  res.render("search.ejs", { req: req });
};

module.exports = {
  getjobdocument,
  getJobCreation, 
  postJobCreation,
  getjobdescription,
  jobrequest,
  jobAssigned,
  jobDone,
  getdetailedpostedjob,
  getpostedjobs,
  getyourjobs,
  getrequestedjobs,
  getpostedjobdetails,
  postpostedjobs,
  getsearch,
};