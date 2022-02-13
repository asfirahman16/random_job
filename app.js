require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passport = require("passport");

const methodOverride = require('method-override');
const bodyParser = require('body-parser');

//Passport Strategy
require("./config/passport")(passport);

//Connect to DB
mongoose
  .connect(process.env.MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database!");
  })
  .catch((error) => {
    console.log(error);
  });
  
//Static Resources
app.use(express.static("public"));
//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'))

//View Engine
app.set("view engine", "ejs");

//Session and Flash
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Body Parser
app.use(express.urlencoded({ extended: false }));

//Routes
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const jobRoutes = require("./routes/job.routes");
const otproutes = require("./routes/otp.routes");
app.use(indexRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(jobRoutes);
app.use(otproutes);





module.exports = app;