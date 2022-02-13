const express = require("express");
const router = express.Router();

const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const Grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require('path');


const {
  ensureAuthenticated, 
  isLoggedIn 
} = require("./../middlewares/auth.middleware");
const isRecruiter = require("./../middlewares/isRecruiter.middleware");
const {
  getjobdocument,
  getjobdescription,
  getJobCreation,
  postJobCreation,
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
} = require("./../controllers/jobs.controller");

const {
  getuser,
  getusercv,
  getuserpic
} = require("./../controllers/users.controller");

const conn = mongoose.createConnection(process.env.MongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
    url: process.env.MongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                console.log("1");
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

router.get("/search", ensureAuthenticated, getsearch);

router.get("/postedjobs", ensureAuthenticated, getpostedjobs);
router.get("/postedjobs/:id", ensureAuthenticated, getpostedjobdetails);
router.get("/postedjobs/jobdocument/:id", ensureAuthenticated, getjobdocument);
router.get("/postedjobs/request/:id", ensureAuthenticated, jobrequest);
router.get("/postedjobs/user/:id", ensureAuthenticated, getuser);
router.get("/postedjobs/user/usercv/:id", ensureAuthenticated, getusercv);
router.get("/postedjobs/user/userpic/:id", ensureAuthenticated, getuserpic);
router.post("/postedjobs", ensureAuthenticated, postpostedjobs);

router.get("/requestedjobs", ensureAuthenticated, getrequestedjobs);
router.get("/requestedjobs/:id", ensureAuthenticated, getdetailedpostedjob);
router.get("/requestedjobs/jobdocument/:id", ensureAuthenticated, getjobdocument);
router.get("/requestedjobs/request/:id", ensureAuthenticated, jobrequest);
router.get("/requestedjobs/user/:id", ensureAuthenticated, getuser);
router.get("/requestedjobs/user/usercv/:id", ensureAuthenticated, getusercv);
router.get("/requestedjobs/user/userpic/:id", ensureAuthenticated, getuserpic);

router.get("/yourjobs/:id", ensureAuthenticated, isRecruiter, getjobdescription);
router.get("/yourjobs/jobdocument/:id", ensureAuthenticated, isRecruiter, getjobdocument);
router.get("/yourjobs/jobassign/:id&:u_id", ensureAuthenticated, jobAssigned);
router.get("/yourjobs/jobdone/:id", ensureAuthenticated, isRecruiter, jobDone);
router.get("/yourjobs/user/:id", ensureAuthenticated, isRecruiter, getuser);
router.get("/yourjobs/user/usercv/:id", ensureAuthenticated, isRecruiter, getusercv);
router.get("/yourjobs/user/userpic/:id", ensureAuthenticated, isRecruiter, getuserpic);
router.get("/yourjobs", ensureAuthenticated, isRecruiter, getyourjobs);


router.get("/jobcreation", ensureAuthenticated, isRecruiter, getJobCreation);
router.post("/jobcreation", ensureAuthenticated, isRecruiter, upload.single('file'), postJobCreation);

module.exports = router;