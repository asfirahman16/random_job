const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    otpcode: {
        type: String,
        required: true,
    },
    otpcodetime: {
        type: Date,
        required: true,
    },
});
OTPSchema.index({"expire_at": 1 }, { expireAfterSeconds: 350 } );

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;