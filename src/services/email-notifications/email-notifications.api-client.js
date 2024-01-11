const axios = require('axios');
const ServicesConfig = require('../../config/servicesConfig');


let api_key = process.env.APIKEY

module.exports = axios.create({
  baseURL: ServicesConfig.notificationsServiceEndpoint,
  headers: {
    common: {          
      'api-key' : api_key
    }
  }
});
