# modeFuck

Bot 100% funcional para trading de futuros na Binance com entradas **aleatórias** e configuráveis.

---

## 🚀 Visão Geral

O `modeFuck` é um robô trader que:
- Consome diretamente a **API de Futuros da Binance**
- Realiza **entradas aleatórias** (BUY ou SELL) em pares ativados
- Permite configurar:
  - Alavancagem por par
  - Take Profit (TP)
  - Stop Loss (SL)
  - Valor investido por trade
- Gerencia posições abertas e evita duplicidade
- Opera em modo `ISOLATED` com pares configuráveis
- foi 100% criado por mim e ajustando com chatGPT
---

## 🧠 Estrutura

- **Backend:** Totalmente funcional com rotas protegidas para controle do bot.
- **Bot Core:** Estratégia automática com proteção e gerenciamento de risco.
- **Frontend:** Em desenvolvimento.

---

## ⚙️ Exemplo de Configuração (`config.js`)

```js
module.exports = {
  botActive: true,
  randomPorcentage: 0.51, // SELL acima de 0.51, BUY abaixo
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
