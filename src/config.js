const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  MSG91_AUTHKEY: process.env.MSG91_AUTHKEY,
  MONGODB_URI: process.env.MONGODB_URI,
};