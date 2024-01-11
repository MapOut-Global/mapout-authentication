const jwt = require('jsonwebtoken');

module.exports = {
  generate: async (data) => {
    return jwt.sign(data, 'mapout', { expiresIn: '30d' });
  },
  verify: async (token) => {
    return jwt.verify(token, 'mapout', (err, decoded) => {
      if (err) return 0;
      return 1;
    });
  },
  decode: async (token) => {
    return jwt.verify(token, 'mapout', (err, decoded) => {
      if (err) return 0;
      return decoded;
    });
  },
};
