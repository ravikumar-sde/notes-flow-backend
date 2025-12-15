const express = require('express');
const { register, login, me } = require('./authController');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

module.exports = router;

