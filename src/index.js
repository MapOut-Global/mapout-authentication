require('dotenv').config()
const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const otpController = require('./controllers/otpController');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 9000;

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use('/auth', authRoutes);

// Test route for sending OTP
// app.post('/send-otp', otpController.sendOTP);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
