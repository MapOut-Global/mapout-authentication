require('dotenv').config();
const config = require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mapoutRoutes = require('./routes/mapout-routes');
const hrgigRoutes = require('./routes/hrgig-routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 9000;

//mongoose.connect(config.MAPOUT_MONGODB_URI);

//const db = mongoose.connection;

//db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//db.once('open', () => {
  //console.log('Connected to MongoDB');

  // Start setting up your Express app after the MongoDB connection is established

  app.use(bodyParser.json());

  app.use('/mapout', mapoutRoutes);
  app.use('/hrgig', hrgigRoutes);

  // Test route for sending OTP
  // app.post('/send-otp', otpController.sendOTP);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
//});
