const { OAuth2Client } = require("google-auth-library");
const { completeRegistration } = require("../mapout-controllers/otp_login/utils/auth.utils");
const { completeHRgigRegistration } = require("../hrgig-controllers/utils/auth.utils");
const  axios  = require("axios");

module.exports = {
  googleAuth: async (req, res) => {
    try {
      const { token, deviceToken, requestFrom, organisationName } = req.body;
      let client
      let ticket
      let userInfo

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
          userInfo = ticket.getPayload();
          break;

        case "hrgig":
          // client = new OAuth2Client(process.env.HRGIG_GOOGLE_CLIENT);
          // ticket = await client.verifyIdToken({
          //   idToken: token
          // });
          userInfo = await axios
          .get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(res => res.data);
          break;

        case "dew":
          // For dew
          break;

        default:
          break;
      }
      const { email, name, email_verified } = userInfo;

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
        res.status(403).send({ status: false, message: "Email not verified" });
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