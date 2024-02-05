const {
  sendOtpViaEmail,
  verifyEmailOTP,
  sendOtpViaSMS,
  verifySmsOTP,
  usePhoneNumberAsOtp,
} = require("./utils/otp");
const { completeRegistration } = require("./utils/auth.utils");

module.exports = {
  request: async (req, res) => {
    try {
      const { email, phoneNumber, source ,useStaticOtp } = req.body;
      if(email === "invalid@mapout.com") res.status(200).send({ validUser: false });

      if (email) await sendOtpViaEmail({ email: email });
      if (phoneNumber) {
        if(useStaticOtp){
          // user last four digits of phone number
          await usePhoneNumberAsOtp({phone_number:phoneNumber})
        } else {
        await sendOtpViaSMS({ phoneNumber: phoneNumber })
        }
      };
      
      res.status(200).json({ message: "Otp sent ..", validUser: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Error sending OTP: ${error.message}` });
    }
  },

  complete: async (req, res) => {
    try {
      const { email, phoneNumber, otp, name, deviceToken, from } = req.body; 
     
      if (email) await verifyEmailOTP({ email, otp });
      if (phoneNumber) await verifySmsOTP({ phoneNumber, otp });

      let registerUser;
      switch (from) {
        case 'app':
          registerUser = await completeRegistration({email, phoneNumber, name, deviceToken})
          break;
  
        case 'dew':
          // For dew
          break;
  
        default:
          break;
      }
      res.status(200).send({
        status: true,
        message: "success",
        data: registerUser
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: `Error in OTP verifying or Registering: ${error.message}` });
    }
  },  
}
