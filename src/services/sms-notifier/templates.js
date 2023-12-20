const getTemplate = (type) => {
    let template

    switch (type) {
        case "OTP":
            template = process.env.MSG91_OTP_TEMPLATE_ID
            break;
    }
    return template
}

module.exports = { getTemplate }