module.exports = {
  botActive: true, // <- controle liga/desliga
  randomPorcentage: 0.51, //sell
  //randomPorcentage2: 0.49, //buy
  //randomPorcentage: 0.50, //neutral

  marginType: 'ISOLATED',
  pairs: {
    'TRXUSDT': { active: false, leverage: 10 },
    'DOGEUSDT': { active: false, leverage: 15 },
    '1INCHUSDT': { active: false, leverage: 20 },
    'BTCUSDT': { active: false, leverage: 20 },
    'ETHUSDT': { active: false, leverage: 20 },
    '1000PEPEUSDT': { active: true, leverage: 10 },
  },
  riskManagement: {
    riskPerTrade: 35,
    takeProfit: 0.65,
    stopLoss: 0.40
  }
};

  