const  axios  = require("axios");

module.exports = async (payload) =>{
    try{
        await axios.post(`https://${process.env.COPILOT_ENVIRONMENT_NAME}.api-gateway.mapout.com/notify-node/api/notify/mapout`, {
            "type": 6,
            "email": payload.email,
            "otp": payload.otp
        });
    } catch(err){
        throw err;
    }
}
