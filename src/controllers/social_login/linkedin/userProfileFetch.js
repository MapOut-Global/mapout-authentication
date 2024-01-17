const axios = require('axios');
const { completeHRgigRegistration } = require('../../hrgig-controllers/utils/auth.utils');

module.exports = async (req, res) => {
    try {
        const {access_token,requestFrom} = req.body;

        const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
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
