# modeFuck

Bot 100% funcional para trading de futuros na Binance com entradas **aleatórias** e configurações dinâmicas.

---

## 🚀 Visão Geral

O `modeFuck` é um robô trader que:

- Consome diretamente a **API de Futuros da Binance**
- Realiza **entradas aleatórias** (BUY ou SELL) nos pares ativados
- Permite configurar:
  - Alavancagem individual por par
  - Take Profit (TP)
  - Stop Loss (SL)
  - Valor investido por trade
- Gerencia posições abertas e evita ordens duplicadas
- Opera em modo `ISOLATED` com controle de risco por operação
- Foi 100% desenvolvido por mim com apoio do ChatGPT

---

## 🧠 Estrutura

- **Backend:** Totalmente funcional com autenticação e rotas protegidas
- **Bot Core:** Estratégia automática com gerenciamento completo
- **Frontend:** Em desenvolvimento (em breve)

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

## 🔐 Exemplo de Variáveis de Ambiente (.env)
Essas chaves são obtidas na sua conta da Binance e não devem ser expostas publicamente:

API_KEY=your_api_key
SECRET_KEY=your_secret_key

JWT_SECRET=your_jwt_secret
PORT=3000

## 📩 Contato
Desenvolvido por @Cris17Gomes