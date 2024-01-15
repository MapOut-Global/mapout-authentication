const bcrypt = require('bcrypt');
const HrGigUser = require('../../../models/hrgig/user');
const { generateAuthorisationToken } = require('../../../services/jwt-service');
const config = require('../../../config/config');
const { connectToDatabase } = require('../../../services/mongodb/connection');

module.exports = {
  signup: async (req, res) => {
    try {
      connectToDatabase(config.HRGIG_MONGODB_URI)
      const { fullName, organisationName, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new HrGigUser({
        fullName,
        organisationName,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      newUser.previousLoginDates.push(new Date().toISOString());
      await newUser.save();

      const token = await generateAuthorisationToken({
        user_id: newUser._id,
        email,
        name: fullName,
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          fullName: newUser.fullName,
          organisationName: newUser.organisationName,
          email: newUser.email,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  login: async (req, res) => {
    try {
      connectToDatabase(config.HRGIG_MONGODB_URI)
      const { email, password } = req.body;

      const user = await HrGigUser.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = await generateAuthorisationToken({
        user_id: user._id,
        email,
        name: user.fullName,
      });
      res.status(200).json({
        message: 'Login successfull',
        user: {
          fullName: user.fullName,
          organisationName: user.organisationName,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
