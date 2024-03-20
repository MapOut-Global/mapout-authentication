const mongoose = require("mongoose");

const appEmployerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    companyName: {
      type: String,
    },
    logo: {
      type: String,
    },
    location: {
      type: String,
    },
    industry: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AppEmployer = mongoose.model("AppEmployer", appEmployerSchema, "appEmployer");
module.exports = AppEmployer;
