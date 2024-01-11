const PaymentsApiClient = require('./payments.api-client');

const _extractResponse = async (apiCall) => {
  const response = await apiCall;
  return response.data.data;
};

module.exports = {
  async paymentsService_createWallet({owner}) {
    return _extractResponse(
      PaymentsApiClient.post('/internal-wallets', {
        owner,
      }),
    );
  },

}
