const axios = require('axios');
const servicesConfig = require('../../config/servicesConfig');

let api_key = process.env.APIKEY

module.exports = axios.create({
  baseURL: servicesConfig.paymentsServiceEntrypoint,
  headers: {
    common: {           
      'api-key' : api_key
    }
  }
});
