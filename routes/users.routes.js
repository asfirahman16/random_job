require("dotenv").config();
const express = require("express");
const router = express.Router();

const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const Grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require('path');

const {
    ensureAuthenticated
} = require("./../middlewares/auth.middleware");

const {
    postsuggestion,

    getDashboard,
    getprofile,
    geteditprofile,
    geteditdescription,
    posteditprofile,
    posteditdescription,
    
    getuploadprofilepic,
    insertProfilePicname,
    getPIC,

    
    getuploadCV,
    insertCVfilename,
    getCV,
} = require("./../controllers/users.controller");

const conn = mongoose.createConnection(process.env.MongoURI);

let gfs;

conn.once('open', () => {
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


router.post("/suggestion", postsuggestion);

router.get("/dashboard", ensureAuthenticated, getDashboard);

router.get("/profpic", ensureAuthenticated, getPIC);
router.get("/profilepicture", ensureAuthenticated, getuploadprofilepic);
router.post("/profilepicture", ensureAuthenticated, upload.single('file'), insertProfilePicname);

router.get("/readcv", ensureAuthenticated, getCV);
router.get("/cv", ensureAuthenticated, getuploadCV);
router.post("/cv", ensureAuthenticated, upload.single('file'), insertCVfilename);

router.get("/profile", ensureAuthenticated, getprofile);
router.get("/updateprofile", ensureAuthenticated, geteditprofile);
router.post("/updateprofile", ensureAuthenticated, posteditprofile);

router.get("/updatedescription", ensureAuthenticated, geteditdescription);
router.post("/updatedescription", ensureAuthenticated, posteditdescription);

module.exports = router;