const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
const { completeRegistration } = require("../mapout-controllers/otp_login/utils/auth.utils");
const { completeHRgigRegistration } = require("../hrgig-controllers/utils/auth.utils");

module.exports = {
  googleAuth: async (req, res) => {
    try {
      const { token, deviceToken, from, organisationName } = await req.body;

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [
          process.env.GOOGLE_ANDROID_CLIENT_ID,
          process.env.GOOGLE_IOS_CLIENT_ID,
          process.env.GOOGLE_WEB_CLIENT_ID,
        ],
      });
      
      const { email, name, email_verified } = ticket.getPayload();

      if (email_verified) {
        let registerUser;
        switch (from) {
          case "app":
            registerUser = await completeRegistration({
              email,
              name,
              deviceToken,
              isSocialLoggedin: true,
              socialSource: "google",
            });
            break;

          case "hrgig":
            registerUser = await completeHRgigRegistration({
              email,
              name,
              organisationName,
              isSocialLoggedin: true,
              socialSource: "google",
            });
            break;

          case "dew":
            // For dew
            break;

          default:
            break;
        }
        res.status(200).send(registerUser);
      } else {
        res.status(400).send({ status: false, message: "Email not verified" });
      }
    } catch (error) {
      res
        .status(500)
        .send({
          status: false,
          message: `Something went wrong: ${error.message} `,
        });
    }
  },
};
