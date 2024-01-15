const bcrypt = require('bcrypt');
const User = require('../../../models/hrgig/user');
const { generateAuthorisationToken } = require('../../../services/jwt-service');

module.exports = {
  signup: async (req, res) => {
    try {
      const { fullName, organisationName, email, password } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
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
};
