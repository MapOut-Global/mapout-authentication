const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSettingSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        notifications:{
            in_app_notifications : {type:Boolean, default: true},
            push_notifications: {type:Boolean, default: true}
        }
    },
    { timestamps: true }
);

userSettingSchema.index({ user_id: 1 }, { unique: true });
const UserSetting = mongoose.model("UserSetting", userSettingSchema, "userSettings");

module.exports = UserSetting;