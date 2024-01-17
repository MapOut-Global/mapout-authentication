const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
    },
    organisationName: {
      type: String,
     // required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
     // required: true,
    },
    is_social_logged_in: {
      type: Boolean,
      default: false,
    },
    social_login_identifier: {
      linkedin: { type: Boolean, default: false },
      google: { type: Boolean, default: false },
    },
    previousLoginDates: [
      { type: String }
    ],
  }, {
    timestamps: true,
  });

  const HrGigUser = mongoose.model('HrGigUser', userSchema,'users');
  module.exports = HrGigUser;
