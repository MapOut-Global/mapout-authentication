const axios = require('axios');

module.exports = async (req, res) => {
  try {
    let client 
    let secret
    const {requestFrom,uri,code} = req.body
    const redirecturi = `${uri}/linkedin`;

    switch (requestFrom) {
      case "mapout":
        client = process.env.MAPOUT_LINKEDIN_CLIENT
        secret = process.env.MAPOUT_LINKEDIN_SECRET
        break;

      case "hrgig":
        client = process.env.HRGIG_LINKEDIN_CLIENT
        secret = process.env.HRGIG_LINKEDIN_SECRET
        break;

      default:
        break;
    }

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



