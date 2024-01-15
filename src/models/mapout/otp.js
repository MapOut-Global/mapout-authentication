const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema(
    {
      email: {
        type: String,
        unique: true,
        sparse: true,
      },
      phone_number: {
        type: String,
        unique: true,
        sparse: true,
      },
      otp: {
        type: String,
        required: true
      },
      is_verified: {
        type: Boolean,
        default:false,
        required:true
      }

    },
    { timestamps: true }
);

otpSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 3000 } );

const Otp = mongoose.model("Otp", otpSchema, "otp");
module.exports = Otp;

