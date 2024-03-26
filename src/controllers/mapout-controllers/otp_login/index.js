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
      const { email, phoneNumber , country_code } = req.body;
      const useStaticOtp = false;
      if(email === "invalid@mapout.com") res.status(200).send({ validUser: false });

      if (email) await sendOtpViaEmail({ email: email });
      if (phoneNumber) {
        if(useStaticOtp){
          // user last four digits of phone number
          await usePhoneNumberAsOtp({phone_number:phoneNumber})
        } else {
          let numberwithCountryCode 
          if(country_code){
            numberwithCountryCode = `${country_code}${phoneNumber}`
            console.log(numberwithCountryCode)
          } else {
            numberwithCountryCode = phoneNumber
          }
        await sendOtpViaSMS({ phoneNumber: numberwithCountryCode })
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
      const { email, phoneNumber, otp, name, deviceToken , country_code  } = req.body; 
     
      if (email) await verifyEmailOTP({ email, otp });
      
      if (phoneNumber) await verifySmsOTP({ phoneNumber:`${country_code}${phoneNumber}`, otp });

      const registerUser = await completeRegistration({email, phoneNumber,  country_code , name, deviceToken})
     
      res.status(200).send({
        status: true,
        message: "success",
        data: registerUser.data
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: `Error in OTP verifying or Registering: ${error.message}` });
    }
  },  
}
