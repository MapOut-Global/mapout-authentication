
const discoveryEndpoint = process.env.COPILOT_SERVICE_DISCOVERY_ENDPOINT; // need to find this env

const getPaymentsServiceEntryPoint = () => {
  if (process.env.PAYMENTS_SERVICE_ENTRY_POINT) {
    return process.env.PAYMENTS_SERVICE_ENTRY_POINT;
  }

  return `http://payments.${discoveryEndpoint}:9093/mapout-payments/api`;
};

const getNotificationServiceEntryPoint = () => {
  if (process.env.NOTIFICATIONS_SERVICE_ENTRY_POINT) {
    return process.env.NOTIFICATIONS_SERVICE_ENTRY_POINT;
  }
  
  return `http://notifications.${discoveryEndpoint}:2000/notify-node/api/notify/mapout`;
};

module.exports = {
  notificationsServiceEndpoint: getNotificationServiceEntryPoint(),
  paymentsServiceEntrypoint: getPaymentsServiceEntryPoint(),
};
