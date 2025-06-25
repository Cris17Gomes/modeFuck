// // backend/src/routes/authRoutes.js
// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');


// router.post('/register', authController.register);
// router.post('/login', authController.login);

// module.exports = router;


// backend/src/routes/authRoutes.js
// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// router.post('/register', authController.register);
// router.post('/login', authController.login);

// // (opcional) rota para testar variáveis .env
// router.get('/env-check', (req, res) => {
//   res.json({
//     API_KEY: process.env.API_KEY,
//     SECRET_KEY: process.env.SECRET_KEY,
//     JWT_SECRET: process.env.JWT_SECRET
//   });
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/env-check', (req, res) => {
  res.json({
    API_KEY: process.env.API_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    JWT_SECRET: process.env.JWT_SECRET
  });
});

module.exports = router;
