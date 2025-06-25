
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const authRoutes = require('./routes/authRoutes');
// const protectedRoutes = require('./routes/protectedRoutes');
// //const { checkConnection } = require('../bot/connection');
// const startModeFuckBot = require('./bot/modeFuck');
// const config = require('./bot/config');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Rotas
// app.use('/api/auth', authRoutes);
// app.use('/api/protected', protectedRoutes);


// // Inicialização
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, async () => {
//   console.log(`🚀 Servidor Express rodando em http://localhost:${PORT}`);

//   if (!config.botActive) {
//     console.log('⛔ Bot está DESLIGADO em config.js');
//     return;
//   }

//   const { connected, availableBalance } = await checkConnection();
//   if (!connected) {
//     console.log('🚫 Bot não iniciado por problemas de conexão com Binance');
//     return;
//   }

//   console.log('🤖 Bot trader iniciado...');
//   await startModeFuckBot(availableBalance);
// });

// backend/src/server.js
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const authRoutes = require('./routes/authRoutes');
// const protectedRoutes = require('./routes/protectedRoutes');
// const startModeFuckBot = require('./bot/modeFuck');
// const config = require('./bot/config');
// const { checkConnection } = require('./bot/connection'); // descomentei e corrigi caminho

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Rotas
// app.use('/api/auth', authRoutes);
// app.use('/api/protected', protectedRoutes);

// // Inicialização
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, async () => {
//   console.log(`🚀 Servidor Express rodando em http://localhost:${PORT}`);

//   if (!config.botActive) {
//     console.log('⛔ Bot está DESLIGADO em config.js');
//     return;
//   }

//   const { connected, availableBalance } = await checkConnection();
//   if (!connected) {
//     console.log('🚫 Bot não iniciado por problemas de conexão com Binance');
//     return;
//   }

//   console.log('🤖 Bot trader iniciado...');
//   await startModeFuckBot(availableBalance);
// });


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const startModeFuckBot = require('./bot/modeFuck');
const config = require('./bot/config');
const { checkConnection, client } = require('./bot/connection');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor Express rodando em http://localhost:${PORT}`);

  if (!config.botActive) {
    console.log('⛔ Bot está DESLIGADO em config.js');
    return;
  }

  const { connected, availableBalance } = await checkConnection();
  if (!connected) {
    console.log('🚫 Bot não iniciado por problemas de conexão com Binance');
    return;
  }

  console.log('🤖 Bot trader iniciado...');
  await startModeFuckBot(client, availableBalance, 'on');
});