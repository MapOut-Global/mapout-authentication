const axios = require('axios');
const { completeHRgigRegistration } = require('../hrgig-controllers/utils/auth.utils');

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

    const tokenData = await axios.post(
      `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${redirecturi}&client_id=${client}&client_secret=${secret}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const TokenResponse = tokenData.data;

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
          Authorization: `Bearer ${TokenResponse.access_token}`,
      },
  });

  const profileData = profileResponse.data;

  const userProfile = {
      name: `${profileData.given_name} ${profileData.family_name}`,
      email: profileData.email,
  };

  let response;
  switch (requestFrom) {  
      case "hrgig":
        response = await completeHRgigRegistration({
          email:userProfile.email,
          name:userProfile.name,
          organisationName:userProfile.organisationName?userProfile.organisationName:undefined,
          isSocialLoggedIn:true,
          socialSource:'linkedin',
        })
        break;

      case "dew":
        // For dew
        break;
      
      case "mapout":
          // For mapout
          break;

      default:
        break;
    }
  
  res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
};



