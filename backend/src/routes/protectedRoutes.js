

// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const db = require('../database/conexao');
// const createBinanceClient = require('../utils/binanceClient');

// router.get('/dashboard', authMiddleware, (req, res) => {
//   res.status(200).json({
//     message: `Bem-vindo, ${req.user.username}!`,
//     user: req.user,
//   });
// });

// router.get('/saldo', authMiddleware, async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT api_key, secret_key FROM users WHERE id = $1',
//       [req.user.id]
//     );

//     const userKeys = result.rows[0];
//     if (!userKeys) {
//       return res.status(404).json({ message: 'Chaves não encontradas' });
//     }

//     const client = createBinanceClient(userKeys.api_key, userKeys.secret_key);
//     const account = await client.futuresAccountInfo();

//     res.status(200).json({
//       saldoDisponivel: parseFloat(account.availableBalance).toFixed(2),
//       saldoTotal: parseFloat(account.totalWalletBalance).toFixed(2)
//     });
//   } catch (error) {
//     console.error('Erro ao buscar saldo:', error.message);
//     res.status(500).json({ message: 'Erro ao acessar a Binance' });
//   }
// });

// router.post('/user/keys', authMiddleware, async (req, res) => {
//   const userId = req.user.id;
//   const { apiKey, secretKey } = req.body;

//   if (!apiKey || !secretKey) {
//     return res.status(400).json({ message: 'Chaves ausentes no corpo da requisição' });
//   }

//   try {
//     await db.query(
//       'UPDATE users SET api_key = $1, secret_key = $2 WHERE id = $3',
//       [apiKey, secretKey, userId]
//     );
//     res.json({ message: 'Chaves atualizadas com sucesso!' });
//   } catch (err) {
//     console.error('Erro ao salvar chaves:', err);
//     res.status(500).json({ error: 'Erro ao salvar as chaves' });
//   }
// });

// module.exports = router;


const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../database/conexao');
const createBinanceClient = require('../utils/binanceClient');

// Rota protegida simples
router.get('/dashboard', authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Bem-vindo, ${req.user.username}!`,
    user: req.user,
  });
});

// Rota para buscar saldo na Binance
router.get('/saldo', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT api_key, secret_key FROM users WHERE id = $1',
      [req.user.id]
    );

    const userKeys = result.rows[0];
    if (!userKeys) {
      return res.status(404).json({ message: 'Chaves não encontradas' });
    }

    const client = createBinanceClient(userKeys.api_key, userKeys.secret_key);
    const account = await client.futuresAccountInfo();

    res.status(200).json({
      saldoDisponivel: parseFloat(account.availableBalance).toFixed(2),
      saldoTotal: parseFloat(account.totalWalletBalance).toFixed(2)
    });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error.message);
    res.status(500).json({ message: 'Erro ao acessar a Binance' });
  }
});

// Atualizar chaves do usuário
router.post('/user/keys', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { apiKey, secretKey } = req.body;

  try {
    await db.query(
      'UPDATE users SET api_key = $1, secret_key = $2 WHERE id = $3',
      [apiKey, secretKey, userId]
    );
    res.json({ message: 'Chaves atualizadas com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar as chaves' });
  }
});

// NOVA ROTA - Obter config.js
router.get('/config', authMiddleware, (req, res) => {
  const configPath = path.join(__dirname, '../bot/config.js');
  try {
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar config.js' });
  }
});

// NOVA ROTA - Atualizar config.js
router.post('/config', authMiddleware, (req, res) => {
  const configPath = path.join(__dirname, '../bot/config.js');
  const newConfig = req.body;

  const configContent = `module.exports = ${JSON.stringify(newConfig, null, 2)};\n`;

  fs.writeFile(configPath, configContent, 'utf8', (err) => {
    if (err) {
      console.error('Erro ao salvar config.js:', err);
      return res.status(500).json({ message: 'Erro ao salvar config.js' });
    }
    res.json({ message: 'Configurações atualizadas com sucesso!' });
  });
});

// Retorna configurações do bot
router.get('/config', authMiddleware, (req, res) => {
  const config = require('../bot/config');
  res.json(config);
});


module.exports = router;
