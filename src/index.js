require('dotenv').config()
const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mapoutRoutes = require('./routes/mapout-routes');
const hrgigRoutes = require('./routes/hrgig-routes');
const otpController = require('./controllers/otpController');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 9000;

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use('/mapout', mapoutRoutes);
app.use('/hrgig', hrgigRoutes);

// Test route for sending OTP
// app.post('/send-otp', otpController.sendOTP);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
