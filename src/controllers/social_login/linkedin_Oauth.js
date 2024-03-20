const axios = require('axios');
const { completeHRgigRegistration } = require('../hrgig-controllers/utils/auth.utils');
const requestComingFrom = require('./utils');

module.exports = async (req, res) => {
  try {
    let client 
    let secret
    const {uri,code} = req.body
    const redirecturi = `${uri}/linkedin`;
    
    const requestFrom = await requestComingFrom(req, res);

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
        return res.status(400).send({ error: 'Invalid request source' });
    }

    if (!client || !secret) {
      return res.status(500).send({ error: 'LinkedIn credentials not configured properly' });
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

    if (!TokenResponse.access_token) {
      return res.status(500).send({ error: 'Failed to retrieve access token from LinkedIn' });
    }

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
          Authorization: `Bearer ${TokenResponse.access_token}`,
      },
  });

  const profileData = profileResponse.data;

  if (!profileData || !profileData.email ) {
    return res.status(500).send({ error: 'Failed to retrieve user profile from LinkedIn' });
  }

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
        return res.status(400).send({ error: 'Invalid request source' });
    }
  
  res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
};



