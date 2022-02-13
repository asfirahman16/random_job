const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  isLoggedIn
} = require("./../middlewares/auth.middleware");

const {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getresetemail,
  postresetemail,
  getresetpassword,
  postresetpassword,
  getforgotpassword,
  postforgotpasspass,
  postforgotpassword,
} = require("../controllers/auth.controllers");

router.get("/signin", isLoggedIn, getLogin);
router.post("/signin", isLoggedIn, postLogin);

router.get("/signup", isLoggedIn, getRegister);
router.post("/signup", isLoggedIn, postRegister);

router.get("/resetpassword", ensureAuthenticated, getresetpassword);
router.post("/resetpassword", ensureAuthenticated, postresetpassword);

router.get("/resetemail", ensureAuthenticated, getresetemail);
router.post("/resetemail", ensureAuthenticated, postresetemail);

router.get("/forgotpassword", getforgotpassword);
router.post("/forgotpassword", postforgotpassword);
router.post("/forgotpasswordpassword", postforgotpasspass);

router.get("/signout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
