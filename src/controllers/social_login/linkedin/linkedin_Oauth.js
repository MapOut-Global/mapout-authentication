const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const client = process.env.LINKEDIN_CLIENT;
    const secret = process.env.LINKEDIN_SECRET;
    const uri = req.body.uri;
    const code = req.body.code;
    const redirecturi = `${uri}/linkedin`;

    const response = await axios.post(
      `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${redirecturi}&client_id=${client}&client_secret=${secret}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data;
    
    res.status(200).send({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
};



