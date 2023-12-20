const axios = require('axios');
const config = require('../../config');
const { getTemplate } = require('./templates');

const sendOTP = async (mobile, otp, type) => {
  const serviceUrl = "https://api.msg91.com/api/v5/flow/";

  const headers = {
    'Content-Type': 'application/json',
    'authKey': config.MSG91_AUTHKEY,
  };

  const template = getTemplate(type);

  const payload = {
    flow_id: template,
    sender: "MAPOUT",
    mobiles: mobile,
    otp: otp.toString(),
  };

  try {
    const response = await axios.post(serviceUrl, payload, { headers });
  console.log(response,"RESP",response.data,response?.status)
    return response.data.type === 'success';
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

module.exports = {
  sendOTP,
};
