const bcrypt = require("bcrypt");
const HrGigUser = require("../../../models/hrgig/user");
const { generateAuthorisationToken } = require("../../../services/jwt-service");
const {createNewUser, findUserByEmail} = require('../utils/auth.utils')
const config = require("../../../config/config");
const { connectToDatabase } = require("../../../services/mongodb/connection");


module.exports = {
  signup: async (req, res) => {
    console.log("Request hdgg")
    return
    try {
      connectToDatabase(config.HRGIG_MONGODB_URI);
      const { fullName, organisationName, email, password } = req.body;

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await createNewUser({
        fullName,
        organisationName,
        email,
        password: hashedPassword,
      });

      const token = await generateAuthorisationToken({
        user_id: newUser._id,
        email,
        name: fullName,
      });

      res.status(201).json({
        message: "User created successfully",
        data: {
          user: {
            fullName: newUser.fullName,
            organisationName: newUser.organisationName,
            email: newUser.email,
          },
          token,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });    }
  },

  login: async (req, res) => {
    try {
      connectToDatabase(config.HRGIG_MONGODB_URI);
      const { email, password } = req.body;
      const user = await HrGigUser.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User Not Found!" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Incorrect Password!" });
      }

      const token = await generateAuthorisationToken({
        user_id: user._id,
        email,
        name: user.fullName,
      });

      res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            fullName: user.fullName,
            organisationName: user.organisationName,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });    }
  }
};
