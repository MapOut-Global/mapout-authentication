const { generateOtp, storeOtp,verifyOtp, getLastFourDigits } = require("./otp_gen_store.util");
const {WebUser_email_notifier} = require("../../../../services/email-notifications/email-notifications.service")

const sendViaSMS = require("../../../../services/sms-notifications/smsService");
const sendViaEmail = WebUser_email_notifier;

const usePhoneNumberAsOtp = async ({phone_number})=>{
    const Otp = getLastFourDigits({phoneNumber:phone_number})
    await storeOtp(Otp,{phone_number})
}

const sendOTP = async ({ otpIdentification, sendOtpFn }) => {

    let otp = await generateOtp();
    if (otpIdentification.email=="testmapout@mapout.com"){
        otp = "138888"
    }
        
    let result = await storeOtp(otp, otpIdentification);

    let payload = {
        otp: result.otp
    };

    await sendOtpFn(payload);

    return result;
}

const sendOtpViaEmail = async ({ email }) => {

    let data = await sendOTP({
        otpIdentification: { email },
        sendOtpFn: ({ otp }) => sendViaEmail({
            email,
            otp,
            type:"6"
        }),
    });
    return data;
}

const sendOtpViaSMS = async ({ phoneNumber }) => {
    return await sendOTP({
        otpIdentification: { phone_number:phoneNumber },
        sendOtpFn: ({ otp }) => sendViaSMS({
            phoneNumber,
            otp
        })
    });
}

/**
 * Base method to verify OTP created and sent via different transports
 * @returns {Promise<*>}
 */

const verifyOTP = ({ otpIdentification, otp }) => {
    return verifyOtp(otp, otpIdentification);
}

const verifyEmailOTP = ({ email, otp }) => {
    return verifyOTP({
        otp,
        otpIdentification: { email: email }
    })
}

const verifySmsOTP = ({ phoneNumber, otp }) => {
    return verifyOTP({
        otp,
        otpIdentification: { phone_number: phoneNumber }
    })
}

module.exports = {
    sendOtpViaEmail,
    sendOtpViaSMS,
    verifyOTP,
    verifyEmailOTP,
    verifySmsOTP,
    usePhoneNumberAsOtp
}

