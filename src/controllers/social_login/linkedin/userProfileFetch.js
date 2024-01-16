const axios = require('axios');
const { completeHRgigRegistration } = require('../../hrgig-controllers/utils/auth.utils');

module.exports = async (req, res) => {
    try {
        const {access_token,from} = req.body;

        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const profileData = profileResponse.data;

        const emailResponse = await axios.get(
            'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const emailData = emailResponse.data;
        const email =
            emailData.elements &&
            emailData.elements[0] &&
            emailData.elements[0]['handle~'] &&
            emailData.elements[0]['handle~'].emailAddress;

        const userProfile = {
            name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
            email: email,
        };
        
        let response;
        switch (from) {  
            case "hrgig":
              response = await completeHRgigRegistration({
                email:userProfile.email,
                name:userProfile.name,
                organisationName,
                isSocialLoggedIn:true,
                socialSource:'linkedin',
              })
              break;

            case "dew":
              // For dew
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
