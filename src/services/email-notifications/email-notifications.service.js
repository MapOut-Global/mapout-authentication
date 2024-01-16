const EmailNotificationsApiClient = require("./email-notifications.api-client");

const _extractResponse = async (apiCall) => {
  const response = await apiCall;
  return response.data.data;
};
module.exports = {
  async AppUser_email_notifier(payload) {
    return _extractResponse(
      EmailNotificationsApiClient.post("/mapout-app", payload)
    );
  },
  async WebUser_email_notifier(payload) {
    return _extractResponse(
      EmailNotificationsApiClient.post("/mapout", payload)
    );
  },
};
