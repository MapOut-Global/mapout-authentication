// const httpErrors = require('http-errors');
const config = require("../../../../config/config");
const Otp = require("../../../../models/mapout/otp");
const { connectToDatabase } = require("../../../../services/mongodb/connection");

const generateOtp = () => {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

const storeOtp = async (otp, otpIdentification) => {
  connectToDatabase(config.MAPOUT_MONGODB_URI)
  return Otp.findOneAndUpdate(
    otpIdentification,
    {
      otp: otp,
      is_verified:false
    },
    {
      new: true,
      upsert:true
    }
  );
};

const verifyOtp =async (otp, otpIdentification) => {
  connectToDatabase(config.MAPOUT_MONGODB_URI)
  const result =await Otp.findOneAndUpdate(
    { ...otpIdentification, otp, is_verified: false },
    {
      $set: {is_verified: true}
    },
    {new: true},
  );
  
  if (!result) {
    const error = new Error("The entered OTP code is not correct!");
    error.statusCode = 401;
    throw error;
    }

  return result;
};

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
}
