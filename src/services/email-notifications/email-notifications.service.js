const EmailNotificationsApiClient = require("./email-notifications.api-client");

const _extractResponse = async (apiCall) => {
  const response = await apiCall;
  return response.data.data;
};
module.exports = {
  async email_notifyUser(payload) {
    return _extractResponse(
      EmailNotificationsApiClient.post("/mapout-app", payload)
    );
  },
  async email_notifyWebUser(payload) {
    return _extractResponse(
      EmailNotificationsApiClient.post("/mapout", payload)
    );
  },
};
