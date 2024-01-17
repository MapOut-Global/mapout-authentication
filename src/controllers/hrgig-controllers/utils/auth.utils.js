const HrGigUser = require("../../../models/hrgig/user");
const config = require("../../../config/config");
const { connectToDatabase } = require("../../../services/mongodb/connection");
const { generateAuthorisationToken } = require("../../../services/jwt-service");

const createNewUser = async (userData) => {
    const newUser = new HrGigUser(userData);
    await newUser.save();
    newUser.previousLoginDates.push(new Date().toISOString());
    await newUser.save();
    return newUser;
  };


 const completeHRgigRegistration = async ({
    email,
    name,
    organisationName,
    isSocialLoggedIn,
    socialSource,
  }) => {
    try {
      connectToDatabase(config.HRGIG_MONGODB_URI);
      let user = await HrGigUser.findOne({ email });

      if (!user) {
        user = await createNewUser({
          fullName: name,
          email,
          organisationName,
          is_social_logged_in: isSocialLoggedIn,
          social_login_identifier: {
            [socialSource]: true,
          },
        });
      }

      const token = await generateAuthorisationToken({
        user_id: user._id,
        email,
        name: user.fullName,
      });

      const successResponse = {
        status: true,
        message: `${socialSource} login success`,
        data: {
          user: {
            fullName: user.fullName,
            organisationName: user.organisationName,
            email: user.email,
          },
          isSocialLoggedIn,
          token,
        },
      };

      return successResponse;
    } catch (error) {
      console.error(error);
      throw new Error("Internal server error");
    }
  }

  module.exports = { completeHRgigRegistration , createNewUser}