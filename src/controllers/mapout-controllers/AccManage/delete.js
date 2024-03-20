const User = require("../../../models/mapout/user");
const UserArchive = require("../../../models/mapout/users_archive");
const { connectToDatabase } = require("../../../services/mongodb/connection");
const { verifyEmailOTP, verifySmsOTP } = require("../otp_login/utils/otp");
const config = require("../../../config/config");

module.exports = {
  acc_delete: async (req, res) => {
    try {
      connectToDatabase(config.MAPOUT_MONGODB_URI);
      const { email, phoneNumber, otp } = req.body;

      if (email) await verifyEmailOTP({ email, otp });
      if (phoneNumber) await verifySmsOTP({ phoneNumber, otp });

      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const archivedUser = new UserArchive(user.toObject());

      await archivedUser.save();

      await User.findByIdAndDelete(userId);

      return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: `Internal Server Error: ${error.message}` });
    }
  },
};
