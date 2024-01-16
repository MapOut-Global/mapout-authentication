const User = require("../../../models/mapout/user");
const bcrypt = require("bcrypt");
const { paymentsService_createWallet } = require("../../../services/payment/payments.service");
const { email_notifyUser } = require("../../../services/email-notifications/email-notifications.service");
const { generateAuthorisationToken } = require("../../../services/jwt-service");
const { UpdateStatus } = require("../../../static/constants");
const { connectToDatabase } = require("../../../services/mongodb/connection");
const config = require("../../../config/config");

const completeRegistration = async ({ email, phoneNumber, name, deviceToken, isSocialLoggedin, socialSource }) => {
  try {
    connectToDatabase(config.MAPOUT_MONGODB_URI)
    let token, isUserCreated;
    const identification = email ? { email } : { contact_number: phoneNumber };
    let userData = await User.findOne(identification);

    if (userData) {
      userData.deviceToken = deviceToken;

      if (isSocialLoggedin && (!userData.is_social_logged_in || userData.social_login_identifier?.[socialSource] !== true)) {
        await User.updateOne({ _id: userData._id }, {
          $set: {
            is_social_logged_in: true,
            [`social_login_identifier.${socialSource}`]: true
          }
        });
      }

      await userData.save();
      token = await generateAuthorisationToken({ user_id: userData._id, ...identification, name });
      isUserCreated = false;
    } else {
      const userDataFields = {
        ...identification,
        password: " ",
        isRequestFromOtp: isSocialLoggedin ? false : true,
        isSocialLoggedin: isSocialLoggedin,
        name,
        lastUpdate: UpdateStatus.Verified
      };

      if (deviceToken !== undefined) userDataFields.deviceToken = deviceToken;
      userData = await registerUser(userDataFields, socialSource);
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

    const data = {
      userDetails: userDetails.length > 0 ? userDetails[0] : {},
      user_id: userData._id,
      profilePic: userData?.profilePic,
      name: userData?.name,
      email: email || null,
      lastUpdate: userData?.lastUpdate || null,
      contact_number: userData?.contact_number || null,
      token,
      isCreated: isUserCreated,
    };

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
};


const registerUser = async (data, socialSource) => {
  try {
    connectToDatabase(config.MAPOUT_MONGODB_URI)
    const usrData = await data;
    const saltRounds = 10;
    usrData.password = await bcrypt.hash(usrData.password, saltRounds);

    const userIdentification = usrData.email
      ? { email: usrData.email.toLowerCase() }
      : { contact_number: usrData.contact_number };

    const user = await User.findOne(userIdentification);

    if (user && user.password === "  ") {
      await User.updateOne({ _id: user._id }, { $set: { password: usrData.password } });

      return {
        _id: user._id,
        role_id: user.role_id
      };
    }

    const mongooseData = {
      ...userIdentification,
      password: usrData.password,
      name: usrData.name,
      role_id: usrData.role,
      verified: true,
      createdAt: new Date().toISOString()
    };

    if (usrData.isSocialLoggedin && (socialSource === "apple" || socialSource === "google")) {
      mongooseData.is_social_logged_in = true;
      mongooseData.social_login_identifier = { [socialSource]: true };
    }

    const result = await User.create(mongooseData);

    await User.updateOne(userIdentification, { $set: { password: "  " } });
    await paymentsService_createWallet({ owner: result._id });

    return result;
  } catch (err) {
    throw err;
  }
};

const getUserDetails = async (user_id) => {
  connectToDatabase(config.MAPOUT_MONGODB_URI)
  const id = user_id 

  const workDetailsPercentageCalculation = {
    $let: {
      vars: {
        totalFields: 3,
        nonEmptyFields: {
          $sum: {
            $map: {
              input: "$workDetails",
              as: "workDetail",
              in: {
                $add: [
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.field_of_work", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.industry", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.role", null] }, null] }, 1, 0] },
                ]
              }
            }
          }
        }
      },
      in: { $multiply: [{ $divide: ["$$nonEmptyFields", "$$totalFields"] }, 100] }
    }
  }

  const educationPercentageCalculation = {
    $let: {
      vars: {
        totalFields: 5,
        nonEmptyFields: {
          $sum: {
            $map: {
              input: "$educationDetails",
              as: "eduDetail",
              in: {
                $add: [
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.college", null] }, null] }, 1, 0] }, 
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.degree", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.end_year", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.specialization", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.current_year", null] }, null] }, 1, 0] },
                ]
              }
            }
          }
        }
      },
      in: {
        $multiply: [{ $divide: ["$$nonEmptyFields", "$$totalFields"] }, 100]
      }
    }
  }

  const skillsAspirationsPercentageCalculation = {
    $let: {
      vars: {
        totalFields: 3,
        nonEmptyFields: {
          $sum: {
            $map: {
              input: "$skillAspirations",
              as: "skill",
              in: {
                $add: [
                  { $cond: [{ $gt: [{ $size: { $ifNull: ["$$skill.technical_skills", []] } }, 0] }, 1, 0] },
                  { $cond: [{ $gt: [{ $size: { $ifNull: ["$$skill.aspirations", []] } }, 0] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$skill.soft_skills", null] }, null] }, 1, 0] }
                ]
              }
            }
          }
        }
      },
      in: { $multiply: [{ $divide: ["$$nonEmptyFields", "$$totalFields"] }, 100] }
    }
  }

  const personalDetailsPercentageCalculation = {
    $multiply: [
      {
        $divide: [
          {
            $add: [
              { $cond: [{ $ne: [{ $ifNull: ["$name", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$email", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$current_location", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$mobile", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$gender", null] }, null] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$languages", []] } }, 0] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$links", []] } }, 0] }, 1, 0] },
            ]
          },
          7
        ]
      },
      100
    ]
  }

  return await User.aggregate([{
    $match: {
      _id: id
    }
  },
  {
    $lookup: {
      from: "educations",
      localField: "education",
      foreignField: "_id",
      as: "educationDetails"
    }
  },
  {
    $lookup: {
      from: "workdetails",
      localField: "experience",
      foreignField: "_id",
      as: "workDetails"
    }
  },
  {
    $lookup: {
      from: "skillsAspirations",
      localField: "skills_aspirations",
      foreignField: "_id",
      as: "skillAspirations"
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      mobile: 1,
      gender: 1,
      current_location: 1,
      languages: 1,
      // career: 1,
      career_stage: 1,
      personality_assesment: 1,
      links: 1,
      educationDetails: 1,
      workDetails: 1,
      skillAspirations: 1,
      profilePic: 1,
      personalDetailsPercentage:{$round:[personalDetailsPercentageCalculation, 0] },
      workDetailsPercentage: { $round: [workDetailsPercentageCalculation, 0] },
      educationDetailsPercentage: { $round: [educationPercentageCalculation, 0] },
      skillAspirationsPercentage: { $round: [skillsAspirationsPercentageCalculation, 0] }
    }
  }
  ]);
}

module.exports = {
  registerUser,
  getUserDetails,
  completeRegistration
};
