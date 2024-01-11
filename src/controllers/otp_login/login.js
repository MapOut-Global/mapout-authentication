const {
  sendOtpViaEmail,
  verifyEmailOTP,
  sendOtpViaSMS,
  verifySmsOTP,
} = require("./utils/otp");
const { generateAuthorisationToken } = require("../../services/jwt-service");
const User = require("../../models/user");
const { registerUser, getUserDetails } = require("../authController");
const { email_notifyUser } = require("../../services/email-notifications/email-notifications.service");
const { UpdateStatus } = require("../../static/constants");
const { default: mongoose } = require("mongoose");

module.exports = {
  request: async (req, res) => {
    try {
      const { email, phoneNumber, source } = req.body;
      if(email === "invalid@mapout.com") res.status(200).send({ validUser: false });

      if (email) await sendOtpViaEmail({ email: email });
      if (phoneNumber) await sendOtpViaSMS({ phoneNumber: phoneNumber });
      
      res.status(200).json({ message: "Otp sent ..", validUser: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Error sending OTP: ${error.message}` });
    }
  },

  complete: async (req, res) => {
    try {
      const { email, phoneNumber, otp, name, deviceToken, from } = req.body; 
      let token, isUserCreated;

      if (email) await verifyEmailOTP({ email, otp });
      if (phoneNumber) await verifySmsOTP({ phoneNumber, otp });
     
      switch (from) {
        case 'app':
          const identification = email ? { email: email } : { contact_number: phoneNumber };
          let userData = await User.findOne(identification);
  
          const userDataFields = {
            ...identification,
            password: " ",
            isRequestFromOtp: true,
            name,
            lastUpdate: UpdateStatus.Verified
          };
  
          if (deviceToken !== undefined) userDataFields.deviceToken = deviceToken;
  
          if (userData) {
            userData.deviceToken = deviceToken;
            await userData.save();
            token = await generateAuthorisationToken({ user_id: userData._id, ...identification, name });
            isUserCreated = false;
          } else {
            userData = await registerUser(userDataFields);
            token = await generateAuthorisationToken({ user_id: userData._id, ...identification });
            isUserCreated = true;
          }
    
          if (isUserCreated) {
           await email_notifyUser({
              name,
              type: 'onboarding',
              email,
            });
          }
  
          const userDetails = await getUserDetails(userData._id);

          res.status(200).send({
            status: true,
            message: "success",
            data: {
              userDetails: userDetails.length > 0 ? userDetails[0] : {},
              user_id: userData._id,
              profilePic: userData.profilePic,
              name: userData.name,
              email: email || null,
              lastUpdate: userData.lastUpdate || null,
              contact_number: userData.contact_number || null,
              token,
              isCreated: isUserCreated,
            },
          });
          break;
  
        case 'dew':
          // For dew
          break;
  
        default:
          break;
      }
  
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: `Error in OTP verifying or Registering: ${error.message}` });
    }
  },  
}
