require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mapoutRoutes = require('./routes/mapout-routes');
const hrgigRoutes = require('./routes/hrgig-routes');
const socialLoginRoutes = require('./routes/social-login.routes');
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
  app.use(logger('dev'));

  //Health-check
  app.get('/authentication',(req,res)=>res.send("Mapout - Authentication"))

  app.use('/authentication/mapout', mapoutRoutes);
  app.use('/authentication/hrgig', hrgigRoutes);
  app.use('/authentication/social-login',socialLoginRoutes)

  // Test route for sending OTP
  // app.post('/send-otp', otpController.sendOTP);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
//});
