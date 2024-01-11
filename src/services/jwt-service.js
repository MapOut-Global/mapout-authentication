const jwt = require('../static/auth-token');

const generateAuthorisationToken = async (payload) => {
    const token = await jwt.generate(payload);
    return token
}


module.exports = { generateAuthorisationToken }