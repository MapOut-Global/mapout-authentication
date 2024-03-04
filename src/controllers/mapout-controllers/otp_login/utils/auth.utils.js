const User = require("../../../../models/mapout/user");
const bcrypt = require("bcrypt");
const {
  paymentsService_createWallet,
} = require("../../../../services/payment/payments.service");
const { AppUser_email_notifier } = require("../../../../services/email-notifications/email-notifications.service");
const { generateAuthorisationToken } = require("../../../../services/jwt-service");
const { UpdateStatus } = require("../../../../static/constants");
const { connectToDatabase } = require("../../../../services/mongodb/connection");
const config = require("../../../../config/config");
const UserSetting = require("../../../../models/mapout/userSettings");

const completeRegistration = async ({
  email,
  phoneNumber,
  name,
  deviceToken,
  isSocialLoggedin,
  socialSource,
}) => {
  try {
    connectToDatabase(config.MAPOUT_MONGODB_URI);
    let token, isUserCreated;
    const identification = email ? { email } : { mobile: phoneNumber };
    let userData = await User.findOne(identification);

    if (userData) {
      userData.deviceToken = deviceToken;

      if (
        isSocialLoggedin &&
        (!userData.is_social_logged_in ||
          userData.social_login_identifier?.[socialSource] !== true)
      ) {
        await User.updateOne(
          { _id: userData._id },
          {
            $set: {
              is_social_logged_in: true,
              [`social_login_identifier.${socialSource}`]: true,
            },
          }
        );
      }

      userData.isDeactivated = false;

      await userData.save();
      token = await generateAuthorisationToken({
        user_id: userData._id,
        ...identification,
        name,
      });
      isUserCreated = false;
    } else {
      const userDataFields = {
        ...identification,
        password: " ",
        isRequestFromOtp: isSocialLoggedin ? false : true,
        isSocialLoggedin: isSocialLoggedin,
        name,
        lastUpdate: UpdateStatus.Verified,
      };

      if (deviceToken !== undefined) userDataFields.deviceToken = deviceToken;
      userData = await registerUser(userDataFields, socialSource);
      token = await generateAuthorisationToken({
        user_id: userData._id,
        ...identification,
      });
      isUserCreated = true;
    }

    if (isUserCreated) {
      await AppUser_email_notifier({
        name,
        type: "onboarding",
        email,
      });
    }

    const userDetails = await getUserDetails(userData._id);

    const successResponse = {
      status: true,
      message: "success",
      data: {
        userDetails: userDetails.length > 0 ? userDetails[0] : {},
        user_id: userData._id,
        profilePic: userData?.profilePic,
        name: userData?.name,
        email: email || null,
        lastUpdate: userData?.lastUpdate || null,
        mobile: userData?.mobile || null,
        token,
        isCreated: isUserCreated,
      },
    };

    return successResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const registerUser = async (data, socialSource) => {
  try {
    connectToDatabase(config.MAPOUT_MONGODB_URI);
    const usrData =  data;
    const saltRounds = 10;
    usrData.password = await bcrypt.hash(usrData.password, saltRounds);

    const userIdentification = usrData.email
      ? { email: usrData.email.toLowerCase() }
      : { mobile: usrData.mobile };

    const user = await User.findOne(userIdentification);

    if (user && user.password === "  ") {
      await User.updateOne(
        { _id: user._id },
        { $set: { password: usrData.password } }
      );

      return {
        _id: user._id,
        role_id: user.role_id,
      };
    }

    const mongooseData = {
      ...userIdentification,
      password: usrData.password,
      name: usrData.name,
      role_id: usrData.role,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    if (
      usrData.isSocialLoggedin &&
      (socialSource === "apple" || socialSource === "google")
    ) {
      mongooseData.is_social_logged_in = true;
      mongooseData.social_login_identifier = { [socialSource]: true };
    }

    const result = await User.create(mongooseData);
    await UserSetting.create({user_id:result._id})

   // await User.updateOne(userIdentification, { $set: { password: "  " } });
   // await paymentsService_createWallet({ owner: result._id });

    return result;
  } catch (err) {
    throw err;
  }
};

const getUserDetails = async (user_id) => {
  connectToDatabase(config.MAPOUT_MONGODB_URI);
  const id = user_id;

  const workDetailsPercentageCalculation = {
    $let: {
      vars: {
        totalFields: 5,
        nonEmptyFields: {
          $sum: {
            $map: {
              input: "$workDetails",
              as: "workDetail",
              in: {
                $add: [
                 // { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.field_of_work", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.industry", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.role", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.company", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$workDetail.employment_type", null] }, null] }, 1, 0] },
                  { $cond: [{ $gt: [{ $size: { $ifNull: ["$$workDetail.responsibilities", []] } }, 0] }, 1, 0] },
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
        totalFields: 9,
        nonEmptyFields: {
          $sum: {
            $map: {
              input: "$educationDetails",
              as: "eduDetail",
              in: {
                $add: [
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.college", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.degree", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.start_date", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.end_date", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.marks_format", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.marks", null] }, null] }, 1, 0] },
                  { $cond: [{ $ne: [{ $ifNull: ["$$eduDetail.specialisation", null] }, null] }, 1, 0] },
                  { $cond: [{ $gt: [{ $size: { $ifNull: ["$$eduDetail.professors_studied_under", []] } }, 0] }, 1, 0] },
                  { $cond: [{ $gt: [{ $size: { $ifNull: ["$$eduDetail.subjects", []] } }, 0] }, 1, 0] },
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
        totalFields: 2,
        nonEmptyFields: {
          $sum: {
            $map: {
              input: "$skillAspirations",
              as: "skill",
              in: {
                $add: [
                  { $cond: [{ $gt: [{ $size: { $ifNull: ["$$skill.technical_skills", []] } }, 0] }, 1, 0] },
                  //{ $cond: [{ $gt: [{ $size: { $ifNull: ["$$skill.aspirations", []] } }, 0] }, 1, 0] },
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
              // { $cond: [{ $ne: [{ $ifNull: ["$current_location", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$mobile", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$gender", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$nationality", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$dob", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$ethnicity", null] }, null] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$languages", []] } }, 0] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$hobbies_interests", []] } }, 0] }, 1, 0] },
             // { $cond: [{ $gt: [{ $size: { $ifNull: ["$links", []] } }, 0] }, 1, 0] },
            ]
          },
          9
        ]
      },
      100
    ]
  }
  const workPreferencePercentageCalculation = {
    $multiply: [
      {
        $divide: [
          {
            $add: [
              { $cond: [{ $ne: [{ $ifNull: ["$work_preference", null] }, null] }, 1, 0] },
              { $cond: [{ $ne: [{ $ifNull: ["$available_from", null] }, null] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$available_for", []] } }, 0] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$industry_preferences", []] } }, 0] }, 1, 0] },
              { $cond: [{ $gt: [{ $size: { $ifNull: ["$role_preferences", []] } }, 0] }, 1, 0] },
             { $cond: [{ $gt: [{ $size: { $ifNull: ["$job_search_motivation", []] } }, 0] }, 1, 0] },
            ]
          },
          6
        ]
      },
      100
    ]
  }

  const overallPercentageCalculation = {
    $avg: [
      workDetailsPercentageCalculation,
      educationPercentageCalculation,
      skillsAspirationsPercentageCalculation,
      personalDetailsPercentageCalculation,
      workPreferencePercentageCalculation
    ]
  };

  return await User.aggregate([{
    $match: {
      _id: mongoose.Types.ObjectId(id)
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
    $lookup: {
      from: "talentboards",
      localField: "talent_board",
      foreignField: "_id",
      as: "talent_board"
    }
  },
  {
    $addFields: {
      "careerJourneyDay": currentCareerJourneyDay,
      "feedNotification": feedNotification ? feedNotification.toObject() : null,
      "PointsWallet": walletPoints
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
      dob:1,
      // career: 1,
      career_stage: 1,
      personality_assesment: 1,
      links: 1,
      educationDetails: 1,
      workDetails: 1,
      skillAspirations: 1,
      profilePic: 1,
      profileVideo:1,
      hobbies_interests:1,
      docs: 1,
      talent_board:1,
      careerJourneyDay: 1,
      userDay: 1,
      userDayDate: 1,
      lastUpdate:1,
      //PointsWallet: 1,
      previousLoginDates: 1,
      //feedNotification,
      preferenceSelected: 1,
      coaching_goal: 1,
      work_preference:1,
      industry_preference:1,
      role_preference:1,
      job_search_motivation:1,
      available_for:1,
      available_from:1,
      nationality:1,
      ethnicity:1,
      overallPercentage: { $round: [overallPercentageCalculation, 0] },
      personalDetailsPercentage: { $round: [personalDetailsPercentageCalculation, 0] },
      workDetailsPercentage: { $round: [workDetailsPercentageCalculation, 0] },
      educationDetailsPercentage: { $round: [educationPercentageCalculation, 0] },
      skillAspirationsPercentage: { $round: [skillsAspirationsPercentageCalculation, 0] },
      workPreferencePercentage:{ $round: [workPreferencePercentageCalculation, 0] }
    }
  }
  ]);
};

module.exports = {
  registerUser,
  getUserDetails,
  completeRegistration,
};
