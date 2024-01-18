const { OAuth2Client } = require("google-auth-library");
const { completeRegistration } = require("../mapout-controllers/otp_login/utils/auth.utils");
const { completeHRgigRegistration } = require("../hrgig-controllers/utils/auth.utils");

module.exports = {
  googleAuth: async (req, res) => {
    try {
      const { token, deviceToken, requestFrom, organisationName } = req.body;
      let client
      let ticket

      switch (requestFrom) {
        case "app":
          client = new OAuth2Client(process.env.MAPOUT_GOOGLE_CLIENT);
          ticket = await client.verifyIdToken({
            idToken: token,
            audience: [
              process.env.GOOGLE_ANDROID_CLIENT_ID,
              process.env.GOOGLE_IOS_CLIENT_ID,
              process.env.GOOGLE_WEB_CLIENT_ID,
            ],
          });
          break;

        case "hrgig":
          client = new OAuth2Client(process.env.HRGIG_GOOGLE_CLIENT);
          ticket = await client.verifyIdToken({
            idToken: token
          });
          break;

        case "dew":
          // For dew
          break;

        default:
          break;
      }
      const { email, name, email_verified } = ticket.getPayload();

      if (email_verified) {
        let registerUser;
        switch (requestFrom) {
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