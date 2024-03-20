const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const docsSchema = new mongoose.Schema({
  item_picture: {
    type: mongoose.Schema.Types.Object,
  },
  short_video: {
    candidate_video: { type: mongoose.Schema.Types.Object },
    mentor_video: { type: mongoose.Schema.Types.Object },
  },
  cv_doc: {
    type: mongoose.Schema.Types.Object,
  },
  report_doc: {
    type: mongoose.Schema.Types.Object,
  },
});

const languageSchema = new mongoose.Schema({
  name: {
    type: Schema.Types.String,
  },
  fluency: {
    reading: { type: Schema.Types.String },
    writing: { type: Schema.Types.String },
    speaking: { type: Schema.Types.String },
  },
  sequence_id: { type: Schema.Types.String },
});

const userArchiveSchema = new Schema(
  {
    name: {
      type: String,
    },
    first_name: {
      type: String,
    },
    middle_name: {
      type: String,
    },
    last_name: {
      type: String,
    },

    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    experience: {
      type: [{ type: "ObjectId", ref: "WorkDetailsModel" }],
    },
    education: {
      type: [{ type: "ObjectId", ref: "Education" }],
    },
    country_code: {
      type: Schema.Types.ObjectId,
      ref: "CountryCode",
    },
    contact_number: {
      type: Number,
    },
    mobile: {
      type: Number,
    },
    agreements_signed: {
      type: [{ type: Schema.Types.ObjectId, ref: "agreements" }],
      default: [],
    },
    profilePic: {
      type: String,
    },
    profileVideo: {
      type: String,
    },
    current_location: {
      type: String,
    },
    ethnicity: {
      type: Schema.Types.String,
      // ref: "Ethnicity",
    },
    gender: {
      type: String,
    },
    disability: {
      type: Schema.Types.ObjectId,
      ref: "Disability",
    },
    nationality: {
      type: Schema.Types.String,
      // ref: "Nationality",
    },
    desired_work_locations: {
      type: Array,
     // default: [],
    },
    MBTI_code: {
      type: String,
    },
    holland_code: {
      type: String,
    },
    moto: {
      type: String,
    },
    job_search_motivation: {
      type: Array,
      default: [],
    },
    work_preference:{
      type:[Schema.Types.String]
    },
    role_preferences: {
      type: [Schema.Types.String],
    },
    soft_skills: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "SoftSkill",
    },
    hobbies_interests: {
      type: [Schema.Types.String],
      default: [],
      // ref: "Hobby",
    },
    inspiring_companies: {
      type: [Schema.Types.ObjectId],
     // default: [],
      ref: "Company",
    },
    employer_qualities: {
      type: [Schema.Types.ObjectId],
     // default: [],
      ref: "Qualities",
    },
    availability: [
      {
        available_for: {
          type: String,
        },
        available_from: {
          type: String,
        }
      }
    ],
    lastUpdate: {
      type: String,
    },

    links: [
      {
        type: { type: String },
        link: { type: Schema.Types.String },
      },
    ],
    languages: {
      type: [languageSchema],
      default: [],
    },
    dob: {
      type: String,
    },
    docs: {
      type: docsSchema,
    },
    // @TODO: check whether it is a valid field
    role_id: {
      type: [Schema.Types.Number],
     // default: [1],
    },
    profile_visibility: {
      type: Boolean,
      default: false,
    },
    mentor_status: {
      type: Number,
      default: 0,
    },
    referal_code: {
      type: String,
    },
    visa_requirement: {
      type: Boolean,
      default: false,
    },
    remote: {
      type: Boolean,
      default: false,
    },
    career_headline: {
      type: String,
    },
    ƒava: {
      type: Schema.Types.String,
    },
    industry_preferences: {
      type: [Schema.Types.String],
    },
    profession_preferences: {
      type: [Schema.Types.ObjectId],
      ref: "Profession",
    },
    token: {
      type: String,
    },
    candidate_dashboard_visibility: {
      type: Boolean,
      default: true,
    },
    is_social_logged_in: {
      type: Boolean,
      default: false,
    },
    social_login_identifier: {
      facebook: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
      google: { type: Boolean, default: false },
    },

    career_stage: {
      type: String,
    },
    desired_career:{
      type : String
    },

    career: {
      role: { type: String },
      field_of_work: { type: String },
      industry: { type: String },
      familiarity: { type: String },
    },

    skills_aspirations: {
      type: Schema.Types.ObjectId,
    },

    coaching_goal: {
      type: Schema.Types.String,
    },

    /* Mentor specific */

    mentorFor: [{ name: { type: String }, best: { type: Boolean } }],
    mentorTo: [{ name: { type: String } }],
    mentorPrice: {
      type: String,
    },
    do_not_show: {
      type: Boolean,
      default: false,
    },
    did_not_attend: {
      type: Boolean,
    },
    changed_career_path: {
      type: Boolean,
    },
    mentorType: {
      type: String,
    },
    field_of_work: {
      type: String,
    },
    field_of_study: {
      type: String,
    },
    industry: {
      type: String,
    },
    about: {
      type: String,
    },
    // technical_skills: [
    //   {
    //     skill: { type: Schema.Types.ObjectId, ref: "TechnicalSkill" },
    //     experience: { year: { type: Number }, month: { type: Number } },
    //   },
    // ],
    personality_assesment: {
      mbti: {
        code: Schema.Types.String,
        full_form: Schema.Types.String,
        summary_for_short_report: Schema.Types.String,
      },
      riasec: {
        code: Schema.Types.String,
        full_form: Schema.Types.String,
        detail: Schema.Types.String,
      },
    },
    technical_skills: {
      type: [{ type: "ObjectId", ref: "usersTechnicalSkills" }],
    },
    talent_board: {
      type: Schema.Types.ObjectId,
      ref:"TalentBoard"
    },
    is_talent_board_visible: {
      type: Schema.Types.Boolean,
    },
    mentor: {
      applied_at: { type: Date },
      rejected_at: { type: Date },
      approved_at: { type: Date },
      is_dashboard_visible: { type: Boolean, default: false },
      is_dashboard_first_time: { type: Boolean, default: true },
      is_profile_complete_first_time: { type: Boolean, default: false },
      is_profile_visible: { type: Boolean, default: true },
      reject_email: { type: Boolean, default: false },
      accept_email: { type: Boolean, default: false },
      profile_percentage: { type: Number, default: 0 },
      session_cancellations: {
        limit: { type: Number },
        joiningMonthLimit: { type: Number },
      },
      payout_contact_id: { type: String },
      reapplication: { type: Boolean, default: false },
    },
    wallet: {
      type: Number,
      default: 0,
    },
    rating: {
      numberOfTotalRating: { type: Number, default: 0 },
      totalPointsOfRating: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      Number_of_stars: {
        Number_of_reviews_between_rating_0_to_1: { type: Number, default: 0 },
        Number_of_reviews_between_rating_1_to_2: { type: Number, default: 0 },
        Number_of_reviews_between_rating_2_to_3: { type: Number, default: 0 },
        Number_of_reviews_between_rating_3_to_4: { type: Number, default: 0 },
        Number_of_reviews_between_rating_4_to_5: { type: Number, default: 0 },
      },
    },
    userDay: {
      type: Number,
    },
    userDayDate: {
      type: String,
    },
    previousLoginDates: [{ type: String }],
    createdAt: {
      type: Date,
    },
    deviceToken: { type: String },
    last_activity: {
      type: Date,
    },
    preferenceSelected: { type: Boolean, default: true },
    taskDetails: {
      _id: { type: Schema.Types.ObjectId, required: false },
      taskCount: { type: Number, required: false, default:1 },
      isCompleted: { type: Boolean, default: false },
      lastTaskCompleted: { type: Date },
      dailyStreakCount: { type: Number, default:0 },
    },
    isDeactivated: { type: Boolean, default: false },
    profilePdf: {type:String}
  },
  { toJSON: { virtuals: true } },
  { timestamps: true }
);

userArchiveSchema.index({ email: 1, mobile: 1 }, { sparse: true });

userArchiveSchema.virtual("profileCompletionStatus").get(function () {
  return {
    name: Boolean(this.name),
    current_location: Boolean(this.current_location),
    profilePic: Boolean(this.profilePic),
    about: Boolean(this.about),
    mentorFor: Boolean(this.mentorFor?.length),
    mentorPrice: Boolean(this.mentorPrice),
    designation: Boolean(this.experience?.length),
  }; 
});

userArchiveSchema.virtual("userProfileCompletionStatus").get(function () {
  return {
    name: Boolean(this.name),
    email: Boolean(this.email),
    mobile: Boolean(this.mobile),
    gender: Boolean(this.gender),
    ethnicity: Boolean(this.ethnicity),
    disability: Boolean(this.disability),
    dob: Boolean(this.dob),
    nationality: Boolean(this.nationality),
    current_location: Boolean(this.current_location),
    education: Boolean(this.education?.length),
    technical_skills: Boolean(this.technical_skills?.length),
    soft_skills: Boolean(this.soft_skills?.length),
    languages: Boolean(this.languages?.length),
  };
});

const UserArchive = mongoose.model("UserArchive", userArchiveSchema);
module.exports = UserArchive;
