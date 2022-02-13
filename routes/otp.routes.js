const express = require("express");
const router = express.Router();

const {
    postverifyotp,
    postverifyotppass,
    postverifyotpemail,
    postverifyotpforgotpass,
} = require("../controllers/otp.controller");

router.post("/verifyotp", postverifyotp);
router.post("/verifyotppass", postverifyotppass);
router.post("/verifyotpemail", postverifyotpemail);
router.post("/verifyotpforgotpassword", postverifyotpforgotpass);
module.exports = router;