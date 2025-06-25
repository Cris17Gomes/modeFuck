const Binance = require('binance-api-node').default;

function createBinanceClient(apiKey, apiSecret) {
  return Binance({
    apiKey,
    apiSecret,
    getTime: () => Date.now()
  });
}

module.exports = createBinanceClient;
