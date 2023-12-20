const msg91Service = require('../services/sms-notifier/msg91Service');

const sendOTP = async (req, res, next) => {
  try {
    const { mobile, type } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save the OTP to the database (implement this logic in userService)

    // Simulate an error (remove this line in your actual implementation)
    // throw new Error('Simulated error in OTP controller');

    // Send OTP via MSG91
    const isOTPSent = await msg91Service.sendOTP(mobile, otp, type);

    if (isOTPSent) {
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      // Manually trigger an error to test the error handler
      throw new Error('Failed to send OTP');
    }
  } catch (error) {
    // Pass the error to the next middleware (error handler)
    next(error);
  }
};

module.exports = {
  sendOTP,
};
