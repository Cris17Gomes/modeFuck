const Binance = require('binance-api-node').default;
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const client = Binance({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.SECRET_KEY,
  getTime: () => Date.now()
});

async function checkConnection() {
  try {
    await client.futuresPing();
    const account = await client.futuresAccountInfo();
    const available = parseFloat(account.availableBalance);
    console.log(`✅ Conectado | Saldo: ${available.toFixed(2)} USDT`);
    return { 
      connected: true,
      availableBalance: available,
      totalBalance: parseFloat(account.totalWalletBalance)
    };
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    return { connected: false, availableBalance: 0 };
  }
}

async function getFuturesExchangeInfo() {
  try {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/exchangeInfo');
    return response.data;
  } catch (error) {
    throw new Error('Erro ao obter exchangeInfo da Binance Futures: ' + error.message);
  }
}

async function setMarginType(symbol, marginType) {
  try {
    await client.futuresMarginType({ symbol, marginType });
    console.log(`🔧 Margem de ${symbol} definida como ${marginType}`);
  } catch (error) {
    const msg = error?.response?.data?.msg || '';
    if (msg.includes('No need to change margin type')) {
      console.log(`ℹ️ ${symbol} já está com margem ${marginType}`);
    } else if (error.response?.data?.code === -4046) {
      console.log(`ℹ️ ${symbol} já está com margem ${marginType}`);
    } else {
      throw error;
    }
  }
}

async function setLeverage(symbol, leverage) {
  try {
    const timestamp = Date.now();
    const params = { symbol, leverage, timestamp };
    
    // Gerar assinatura HMAC-SHA256
    const query = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    const signature = crypto
      .createHmac('sha256', process.env.SECRET_KEY)
      .update(query)
      .digest('hex');

    await axios.post(
      'https://fapi.binance.com/fapi/v1/leverage',
      `${query}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': process.env.API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log(`🔧 Alavancagem de ${symbol} definida como ${leverage}x`);
  } catch (error) {
    // Tratar erro específico de alavancagem já definida
    if (error.response?.data?.code === -4028) {
      console.log(`ℹ️ ${symbol} já está com alavancagem ${leverage}x`);
    } else {
      throw new Error(`Erro ao definir leverage para ${symbol}: ${error.response?.data?.msg || error.message}`);
    }
  }
}

module.exports = {
  client,
  checkConnection,
  getFuturesExchangeInfo,
  setMarginType,
  setLeverage
};