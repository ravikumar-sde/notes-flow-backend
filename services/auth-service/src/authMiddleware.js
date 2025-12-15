const jwt = require('jsonwebtoken');
const config = require('./config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch (err) {
    console.error('JWT verification failed', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;

