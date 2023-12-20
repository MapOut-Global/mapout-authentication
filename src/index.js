const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const otpController = require('./controllers/otpController');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

// Use routes
app.use('/auth', authRoutes);

// Test route for sending OTP
app.post('/send-otp', otpController.sendOTP);

// Common error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
