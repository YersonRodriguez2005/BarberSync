// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token provisto.' });
  }

  try {
    const tokenLimpio = token.replace('Bearer ', '');
    const decodificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    req.user = decodificado;
    next();
  } catch (error) {
    // FIX: 401 en vez de 400 — semánticamente correcto y más fácil de interceptar
    return res.status(401).json({ 
      message: error.name === 'TokenExpiredError' 
        ? 'Sesión expirada. Por favor inicia sesión nuevamente.' 
        : 'Token inválido.' 
    });
  }
};

module.exports = { verificarToken };