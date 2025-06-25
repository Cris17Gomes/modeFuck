// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/conexao');

//POST http://localhost:3000/api/auth/register

exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password ) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  try {
    const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    return res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};


// POST http://localhost:3000/api/auth/login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Senha incorreta' });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};




// // backend/src/controllers/authController.js
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const db = require('../../database/conexao');

// exports.register = async (req, res) => {
//   const { username, password, apiKey, secretKey } = req.body;

//   if (!username || !password || !apiKey || !secretKey) {
//     return res.status(400).json({ message: 'Dados incompletos' });
//   }

//   try {
//     // Verifica se o usuário já existe
//     const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);
//     if (existingUser.rows.length > 0) {
//       return res.status(409).json({ message: 'Usuário já existe' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insere no banco
//     await db.query(
//       'INSERT INTO users (username, password, api_key, secret_key) VALUES ($1, $2, $3, $4)',
//       [username, hashedPassword, apiKey, secretKey]
//     );

//     res.status(201).json({ message: 'Usuário registrado com sucesso' });
//   } catch (error) {
//     console.error('Erro ao registrar usuário:', error);
//     res.status(500).json({ message: 'Erro interno no servidor' });
//   }
// };

// exports.login = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
//     const user = result.rows[0];

//     if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Senha incorreta' });

//     const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.status(200).json({ token });
//   } catch (error) {
//     console.error('Erro ao fazer login:', error);
//     res.status(500).json({ message: 'Erro interno no servidor' });
//   }
// };

