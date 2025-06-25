// //const { client } = require('../bot/connection');
// const { binance } = require('./binanceClient');

// // use binance para conexão

// const {  calculateTargets } = require('../bot/utils');
// const config = require('../bot/config');



// const state = {
//   activePositions: new Map(),
//   pairConfigs: {},
//   botEnabled: true // controle de liga/desliga
// };

// async function initializePairs() {
//   try {
//     const exchangeInfo = await client.futuresExchangeInfo();

//     for (const pair of Object.keys(config.pairs)) {
//       if (!config.pairs[pair].active) continue;

//       const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === pair);
//       const lotFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
//       const priceFilter = symbolInfo.filters.find(f => f.filterType === 'PRICE_FILTER');
//       const minNotional = symbolInfo.filters.find(f => f.filterType === 'MIN_NOTIONAL');

//       state.pairConfigs[pair] = {
//         quantityPrecision: symbolInfo.quantityPrecision,
//         pricePrecision: symbolInfo.pricePrecision,
//         stepSize: parseFloat(lotFilter.stepSize),
//         minQty: parseFloat(lotFilter.minQty),
//         tickSize: parseFloat(priceFilter.tickSize),
//         minNotional: parseFloat(minNotional.notional)
//       };

//       await client.futuresMarginType({ symbol: pair, marginType: config.marginType }).catch(() => {});
//       await client.futuresLeverage({ symbol: pair, leverage: config.pairs[pair].leverage });
//     }
//   } catch (error) {
//     console.error('❌ Falha na inicialização:', error.message);
//     process.exit(1);
//   }
// }

// async function executeFuckStrategy(availableBalance) {
//   if (!state.botEnabled) return;

//   const activePairs = Object.keys(config.pairs).filter(pair => config.pairs[pair].active);
//   const accountInfo = await client.futuresAccountBalance();
//   const freeMarginObj = accountInfo.find(a => a.asset === 'USDT');
//   const freeMargin = freeMarginObj ? parseFloat(freeMarginObj.availableBalance) : 0;

//   for (const pair of activePairs) {
//     try {
//       if (state.activePositions.has(pair)) continue;

//       const positions = await client.futuresPositionRisk({ symbol: pair });
//       const position = positions.find(p => Math.abs(p.positionAmt) > 0);
//       if (position && Math.abs(position.positionAmt) > 0) {
//         state.activePositions.set(pair, true);
//         continue;
//       }

//       const priceData = await client.futuresMarkPrice({ symbol: pair });
//       const currentPrice = parseFloat(priceData.markPrice);

//       const quantity = calculateSafeQuantity(
//         pair,
//         currentPrice,
//         availableBalance,
//         config.riskManagement.riskPerTrade
//       );

//       const orderValue = quantity * currentPrice;
//       const minNotional = state.pairConfigs[pair].minNotional;
//       const leverage = config.pairs[pair].leverage;
//       const requiredMargin = orderValue / leverage;

//       if (!quantity || orderValue < minNotional) {
//         console.log(`⚠️ ${pair} | Valor abaixo do mínimo (${orderValue.toFixed(4)} < ${minNotional})`);
//         continue;
//       }

//       if (requiredMargin > freeMargin) {
//         console.log(`⚠️ ${pair} | Margem insuficiente (${requiredMargin.toFixed(2)} > ${freeMargin.toFixed(2)})`);
//         continue;
//       }

//       const side = Math.random() > config.randomPorcentage ? 'BUY' : 'SELL';

//       const order = await client.futuresOrder({
//         symbol: pair,
//         side,
//         type: 'MARKET',
//         quantity: parseFloat(quantity.toFixed(state.pairConfigs[pair].quantityPrecision))
//       });

//       console.log(`✅ ORDEM EXECUTADA: ${side} ${quantity} ${pair} @ ${currentPrice.toFixed(2)} | Ordem ID: ${order.orderId}`);

//       state.activePositions.set(pair, true);
//       await setProtectionOrders(pair, side, currentPrice);
//     } catch (error) {
//       console.error(`❌ Erro ao operar ${pair}:`, error.message);
//       await emergencyClose(pair);
//     }
//   }
// }

// function calculateSafeQuantity(pair, price, balance, riskPercent) {
//   try {
//     const pairConfig = state.pairConfigs[pair];
//     const leverage = config.pairs[pair].leverage;
//     const riskAmount = balance * (riskPercent / 100);
//     const positionValue = riskAmount * leverage;
//     let quantity = positionValue / price;
//     quantity = Math.floor(quantity / pairConfig.stepSize) * pairConfig.stepSize;
//     return quantity >= pairConfig.minQty ? parseFloat(quantity.toFixed(pairConfig.quantityPrecision)) : 0;
//   } catch (error) {
//     console.error(`❌ Erro ao calcular quantidade segura: ${error.message}`);
//     return 0;
//   }
// }

// async function setProtectionOrders(pair, side, entryPrice) {
//   try {
//     const pairConfig = state.pairConfigs[pair];
//     const { takeProfit, stopLoss } = calculateTargets(
//       entryPrice,
//       side === 'BUY' ? 'LONG' : 'SHORT',
//       config.riskManagement.takeProfit,
//       config.riskManagement.stopLoss
//     );

//     const formattedTP = parseFloat(takeProfit.toFixed(pairConfig.pricePrecision));
//     const formattedSL = parseFloat(stopLoss.toFixed(pairConfig.pricePrecision));

//     await client.futuresOrder({
//       symbol: pair,
//       side: side === 'BUY' ? 'SELL' : 'BUY',
//       type: 'TAKE_PROFIT_MARKET',
//       stopPrice: formattedTP,
//       closePosition: true
//     });

//     await client.futuresOrder({
//       symbol: pair,
//       side: side === 'BUY' ? 'SELL' : 'BUY',
//       type: 'STOP_MARKET',
//       stopPrice: formattedSL,
//       closePosition: true
//     });

//     console.log(`🎯 Proteções ${pair} | TP: ${formattedTP} | SL: ${formattedSL}`);
//   } catch (error) {
//     console.error(`❌ Falha ao definir TP/SL em ${pair}: ${error.message}`);
//   }
// }

// async function emergencyClose(pair) {
//   try {
//     const positions = await client.futuresPositionRisk({ symbol: pair });
//     const position = positions.find(p => Math.abs(p.positionAmt) > 0);

//     if (position) {
//       await client.futuresOrder({
//         symbol: pair,
//         side: position.positionAmt > 0 ? 'SELL' : 'BUY',
//         type: 'MARKET',
//         quantity: Math.abs(position.positionAmt),
//         reduceOnly: true
//       });
//       state.activePositions.delete(pair);
//       console.log(`🛑 ${pair} | Fechamento emergencial`);
//     } else {
//       state.activePositions.delete(pair);
//     }
//   } catch (error) {
//     console.error(`❌ Falha ao fechar posição de emergência ${pair}: ${error.message}`);
//   }
// }

// // NOVA FUNÇÃO PARA CHECAR E LIMPAR POSIÇÕES E ORDENS PENDENTES
// async function checkAndCleanupPositions() {
//   const activePairs = Object.keys(config.pairs).filter(pair => config.pairs[pair].active);

//   for (const pair of activePairs) {
//     try {
//       const positions = await client.futuresPositionRisk({ symbol: pair });
//       const position = positions.find(p => Math.abs(p.positionAmt) > 0);

//       if (!position || Math.abs(position.positionAmt) === 0) {
//         const openOrders = await client.futuresOpenOrders({ symbol: pair });

//         if (openOrders.length > 0) {
//           for (const order of openOrders) {
//             await client.futuresCancelOrder({ symbol: pair, orderId: order.orderId });
//           }
//           console.log(`🧹 ${pair} | Ordens pendentes canceladas`);
//         }

//         if (state.activePositions.has(pair)) {
//           state.activePositions.delete(pair);
//           console.log(`🔁 ${pair} | Liberado para nova entrada`);
//            }
//       }
//     } catch (error) {
//       console.error(`❌ Erro ao verificar e limpar ${pair}:`, error.message);
//     }
//   }
// }

// module.exports = async (availableBalance, botCommand) => {
//   if (botCommand === 'off') {
//     state.botEnabled = false;
//     console.log('⛔ Bot desligado');
//     return;
//   } else if (botCommand === 'on') {
//     state.botEnabled = true;
//     console.log('✅ Bot ligado');
//   }

//   await initializePairs();
//   await executeFuckStrategy(availableBalance);

//   setInterval(async () => {
//     if (!state.botEnabled) return;

//     try {
//       const accountInfo = await client.futuresAccountBalance();
//       const freeMarginObj = accountInfo.find(a => a.asset === 'USDT');
//       const availableBalance = freeMarginObj ? parseFloat(freeMarginObj.availableBalance) : 0;

//       // AQUI, CHECK E LIMPEZA ANTES DE EXECUTAR ESTRATÉGIA
//       await checkAndCleanupPositions();
//       await executeFuckStrategy(availableBalance);
//     } catch (error) {
//       console.error('❌ Erro ao buscar saldo:', error.message);
//     }
//   }, 5000);
// };

const { calculateTargets } = require('../bot/utils');
const config = require('../bot/config');
const { getFuturesExchangeInfo, setMarginType, setLeverage } = require('./connection');

const state = {
  activePositions: new Map(),
  pairConfigs: {},
  botEnabled: true
};

async function initializePairs(client) {
  try {
    const exchangeInfo = await getFuturesExchangeInfo();

    for (const pair of Object.keys(config.pairs)) {
      if (!config.pairs[pair].active) continue;

      const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === pair);
      if (!symbolInfo) {
        console.warn(`⚠️ Par ${pair} não encontrado na Binance (verifique se está correto)`);
        continue;
      }

      const lotFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
      const priceFilter = symbolInfo.filters.find(f => f.filterType === 'PRICE_FILTER');
      const minNotional = symbolInfo.filters.find(f => f.filterType === 'MIN_NOTIONAL');

      state.pairConfigs[pair] = {
        quantityPrecision: symbolInfo.quantityPrecision,
        pricePrecision: symbolInfo.pricePrecision,
        stepSize: parseFloat(lotFilter.stepSize),
        minQty: parseFloat(lotFilter.minQty),
        tickSize: parseFloat(priceFilter.tickSize),
        minNotional: parseFloat(minNotional.notional)
      };

    try {
  await setMarginType(pair, config.marginType);
} catch (err) {
  const msg = err?.response?.data?.msg || err.message;

  if (msg.includes('No need to change margin type')) {
    console.log(`ℹ️ MarginType já está como ${config.marginType} para ${pair}`);
  } else {
    console.warn(`⚠️ Erro ao definir marginType de ${pair}: ${msg}`);
  }
}

      try {
        await setLeverage(pair, config.pairs[pair].leverage);
      } catch (err) {
        console.warn(`⚠️ Erro ao definir leverage de ${pair}: ${err.message}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao inicializar pares: ${error.message}`);
  }
}

async function getFreeUSDT(client) {
  const account = await client.futuresAccountInfo();
  return parseFloat(account.availableBalance);
}

async function executeStrategy(client, availableBalance) {
  if (!state.botEnabled) return;

  const activePairs = Object.keys(config.pairs).filter(pair => config.pairs[pair].active);
  const freeMargin = await getFreeUSDT(client);

  for (const pair of activePairs) {
    try {
      if (state.activePositions.has(pair)) continue;

      const positions = await client.futuresPositionRisk({ symbol: pair });
      const position = positions.find(p => Math.abs(parseFloat(p.positionAmt)) > 0);
      
      if (position && Math.abs(parseFloat(position.positionAmt)) > 0) {
        state.activePositions.set(pair, true);
        continue;
      }

      const priceData = await client.futuresMarkPrice({ symbol: pair });
      const currentPrice = parseFloat(priceData.markPrice);

      const quantity = calculateSafeQuantity(
        pair,
        currentPrice,
        availableBalance,
        config.riskManagement.riskPerTrade
      );

      const orderValue = quantity * currentPrice;
      const minNotional = state.pairConfigs[pair].minNotional;
      const leverage = config.pairs[pair].leverage;
      const requiredMargin = orderValue / leverage;

      if (!quantity || orderValue < minNotional) {
        console.log(`⚠️ ${pair} | Valor abaixo do mínimo (${orderValue.toFixed(4)} < ${minNotional})`);
        continue;
      }

      if (requiredMargin > freeMargin) {
        console.log(`⚠️ ${pair} | Margem insuficiente (${requiredMargin.toFixed(2)} > ${freeMargin.toFixed(2)})`);
        continue;
      }

      const side = Math.random() > config.randomPorcentage ? 'BUY' : 'SELL';

      const order = await client.futuresOrder({
        symbol: pair,
        side,
        type: 'MARKET',
        quantity: parseFloat(quantity.toFixed(state.pairConfigs[pair].quantityPrecision))
      });

      console.log(`✅ ORDEM EXECUTADA: ${side} ${quantity} ${pair} @ ${currentPrice.toFixed(2)} | Ordem ID: ${order.orderId}`);

      state.activePositions.set(pair, true);
      await setProtectionOrders(client, pair, side, currentPrice);
    } catch (error) {
      console.error(`❌ Erro ao operar ${pair}:`, error.message);
      await emergencyClose(client, pair);
    }
  }
}

function calculateSafeQuantity(pair, price, balance, riskPercent) {
  try {
    const pairConfig = state.pairConfigs[pair];
    const leverage = config.pairs[pair].leverage;
    const riskAmount = balance * (riskPercent / 100);
    const positionValue = riskAmount * leverage;
    let quantity = positionValue / price;
    quantity = Math.floor(quantity / pairConfig.stepSize) * pairConfig.stepSize;
    return quantity >= pairConfig.minQty ? parseFloat(quantity.toFixed(pairConfig.quantityPrecision)) : 0;
  } catch (error) {
    console.error(`❌ Erro ao calcular quantidade segura: ${error.message}`);
    return 0;
  }
}

async function setProtectionOrders(client, pair, side, entryPrice) {
  try {
    const pairConfig = state.pairConfigs[pair];
    const { takeProfit, stopLoss } = calculateTargets(
      entryPrice,
      side === 'BUY' ? 'LONG' : 'SHORT',
      config.riskManagement.takeProfit,
      config.riskManagement.stopLoss
    );

    const formattedTP = parseFloat(takeProfit.toFixed(pairConfig.pricePrecision));
    const formattedSL = parseFloat(stopLoss.toFixed(pairConfig.pricePrecision));

    await client.futuresOrder({
      symbol: pair,
      side: side === 'BUY' ? 'SELL' : 'BUY',
      type: 'TAKE_PROFIT_MARKET',
      stopPrice: formattedTP,
      closePosition: true
    });

    await client.futuresOrder({
      symbol: pair,
      side: side === 'BUY' ? 'SELL' : 'BUY',
      type: 'STOP_MARKET',
      stopPrice: formattedSL,
      closePosition: true
    });

    console.log(`🎯 Proteções ${pair} | TP: ${formattedTP} | SL: ${formattedSL}`);
  } catch (error) {
    console.error(`❌ Falha ao definir TP/SL em ${pair}: ${error.message}`);
  }
}

async function emergencyClose(client, pair) {
  try {
    const positions = await client.futuresPositionRisk({ symbol: pair });
    const position = positions.find(p => Math.abs(parseFloat(p.positionAmt)) > 0);

    if (position) {
      await client.futuresOrder({
        symbol: pair,
        side: parseFloat(position.positionAmt) > 0 ? 'SELL' : 'BUY',
        type: 'MARKET',
        quantity: Math.abs(parseFloat(position.positionAmt)),
        reduceOnly: true
      });
      state.activePositions.delete(pair);
      console.log(`🛑 ${pair} | Fechamento emergencial`);
    } else {
      state.activePositions.delete(pair);
    }
  } catch (error) {
    console.error(`❌ Falha ao fechar posição de emergência ${pair}: ${error.message}`);
  }
}

async function checkAndCleanupPositions(client) {
  const activePairs = Object.keys(config.pairs).filter(pair => config.pairs[pair].active);

  for (const pair of activePairs) {
    try {
      const positions = await client.futuresPositionRisk({ symbol: pair });
      const position = positions.find(p => Math.abs(parseFloat(p.positionAmt)) > 0);

      if (!position || Math.abs(parseFloat(position.positionAmt)) === 0) {
        const openOrders = await client.futuresOpenOrders({ symbol: pair });

        if (openOrders.length > 0) {
          for (const order of openOrders) {
            await client.futuresCancelOrder({ symbol: pair, orderId: order.orderId });
          }
          console.log(`🧹 ${pair} | Ordens pendentes canceladas`);
        }

        if (state.activePositions.has(pair)) {
          const now = new Date().toISOString();

          state.activePositions.delete(pair);
          console.log(`🔁 ${pair} | Liberado para nova entrada  ${now}` );
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar e limpar ${pair}:`, error.message);
    }
  }
}

module.exports = async (client, availableBalance, botCommand) => {
  if (botCommand === 'off') {
    state.botEnabled = false;
    console.log('⛔ Bot desligado');
    return;
  } else if (botCommand === 'on') {
    state.botEnabled = true;
    console.log('✅ Bot ligado');
  }

  await initializePairs(client);
  await executeStrategy(client, availableBalance);

  setInterval(async () => {
    if (!state.botEnabled) return;

    try {
      const availableBalance = await getFreeUSDT(client);
      await checkAndCleanupPositions(client);
      await executeStrategy(client, availableBalance);
    } catch (error) {
      console.error('❌ Erro ao buscar saldo:', error.message);
    }
  }, 2000);
};