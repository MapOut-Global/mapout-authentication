// const httpErrors = require('http-errors');
const Otp = require('../../../models/otp');

const generateOtp = () => {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

const storeOtp = async (otp, otpIdentification) => {
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
