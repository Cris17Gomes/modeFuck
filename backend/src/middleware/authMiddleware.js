// // backend/src/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Salva info do user para uso nas rotas protegidas
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Token inválido' });
//   }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
