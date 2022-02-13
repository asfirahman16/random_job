const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    validate : {
        validator : Number.isInteger,
        message   : '{VALUE} is not an integer value'
      }
  },
  userOccupation: {
      type: String,
  },
  age: {
    type: Number,
  },
  address: {
      union:{
        type: String,
      },
      thana: {
          type: String,
      },
      district: {
          type: String,
      }
  },
  description: {
    type: String,
    deafult: null,
  },
  interests: {
    type: String,
  },
  jobs:[{
    type: String,
  }],
  jobrequests: [{
    type: String,
  }],
  requestedjobs:[{
    type: String,
  }],
  assignedjobs:[{
    type: String,
  }],
  wishlistID: {
    type: String,
  },
  ratingID: {
    type: String,
  },
  otpcode: {
    type: String,
  },
  otpcodetime: {
    type: Date,
  },
  profilepic: {
    type: String,
    default: null,
  },
  cv: {
    type: String,
    default: null,
  },
  linkedin: {
    type: String,
    default: null,
  },
  facebook: {
    type: String,
    default: null,
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
