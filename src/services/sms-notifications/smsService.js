const axios = require("axios");
const { SmsTypeConstants } = require("../../static/constants");

module.exports = async (payload) => {
    try {
        await axios.post(`https://${process.env.COPILOT_ENVIRONMENT_NAME}.api-gateway.mapout.com/notify-node/api/notify/mapout/sms`, {
            "type": SmsTypeConstants.OTP,
            "mobile": payload.phoneNumber,
            "variables": { "var": payload.otp }
        });
    } catch (err) {
        throw err;
    }
}