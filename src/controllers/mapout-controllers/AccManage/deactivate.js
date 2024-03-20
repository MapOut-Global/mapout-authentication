const User = require("../../../models/mapout/user");
const config = require("../../../config/config");
const { connectToDatabase } = require("../../../services/mongodb/connection");

module.exports = {
    acc_deactivate: async (req, res) => {
        try {
            connectToDatabase(config.MAPOUT_MONGODB_URI);
            const userId = req.params.userId;
            const updatedUser = await User.findByIdAndUpdate(
                {_id:userId},
                { $set: { isDeactivated: true } },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'Account deactivated successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};
