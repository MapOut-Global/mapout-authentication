const User = require("../models/user");
const bcrypt = require("bcrypt");
const { paymentsService_createWallet } = require("../services/payment/payments.service");

const registerUser = async (data) => {
  try {
    const usrData = await data;
    const saltRounds = 10;
    usrData.password = await bcrypt.hash(usrData.password, saltRounds);
    let result;

    const userIdentification = usrData.email ? { email: usrData.email.toLowerCase() } : { contact_number: usrData.contact_number };

    const user = await User.findOne(userIdentification);

    if (user && user.password === "  ") {
      await User.updateOne({ _id: user._id }, { $set: { password: usrData.password } });

      result = {
        _id: user._id,
        role_id: user.role_id
      };
    } else {
      const mongooseData = {
        ...userIdentification,
        password: usrData.password,
        name: usrData.name,
        role_id: usrData.role,
        verified: true,
        createdAt: new Date().toISOString()
      };

      if (usrData.referal_code) {
        mongooseData.referal_code = usrData.referal_code;
      }

      result = await User.create(mongooseData);
    }

    if (data.isRequestFromOtp == undefined || data.isRequestFromOtp == null) {
      // await verifyEmail(result);
    } else {
      await User.updateOne(userIdentification, { $set: { password: "  " } });
    }

    await paymentsService_createWallet({ owner: result._id });
    return result;
  } catch (err) {
    throw err;
  }
};


const getUserDetails = async (user_id) => {
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
  getUserDetails
};
