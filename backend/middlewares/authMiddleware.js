// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // El frontend enviará el token en el header de la petición
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token provisto.' });
  }

  try {
    // El formato suele ser "Bearer eyJhbGci..." así que quitamos la palabra Bearer
    const tokenLimpio = token.replace('Bearer ', '');
    
    // Verificamos el token con nuestra clave secreta
    const decodificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    
    // Inyectamos los datos del usuario en la request para que el controlador los pueda usar
    req.user = decodificado; 
    
    next(); // Pasa al siguiente middleware o controlador
  } catch (error) {
    res.status(400).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = { verificarToken };