// backend/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de Usuario (Por defecto será CLIENTE)
const register = async (req, res) => {
  const { nombre, email, telefono, password } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const userExist = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // 2. Encriptar la contraseña (10 rondas de salt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insertar el nuevo usuario en la base de datos
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, rol',
      [nombre, email, telefono, hashedPassword, 'CLIENTE']
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
  }
};

// Inicio de Sesión
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar al usuario por correo
    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' }); // Evitar dar pistas de si falló el correo o la clave
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la BD
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar el Token JWT
    // Incluimos el ID y el ROL para que el frontend sepa qué pantallas mostrar
    const token = jwt.sign(
      { id: user.rows[0].id, rol: user.rows[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // El token expira en 7 días
    );

    // 4. Enviar respuesta exitosa (excluimos la contraseña del objeto user)
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.rows[0].id,
        nombre: user.rows[0].nombre,
        email: user.rows[0].email,
        rol: user.rows[0].rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
  }
};

const actualizarPerfil = async (req, res) => {
  const usuarioId = req.user.id;
  const { nombre, email, password } = req.body;

  try {
    // 1. Verificar que el nuevo email no esté en uso por otro usuario
    if (email) {
      const emailExiste = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, usuarioId]);
      if (emailExiste.rows.length > 0) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso por otra cuenta.' });
      }
    }

    // 2. Construir la consulta de actualización dinámicamente
    let query = 'UPDATE usuarios SET nombre = $1, email = $2';
    let values = [nombre, email];
    
    // Si el usuario envió una nueva contraseña, la encriptamos y la añadimos a la consulta
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = $3';
      values.push(hashedPassword);
    }

    query += ` WHERE id = $${values.length + 1} RETURNING id, nombre, email, rol`;
    values.push(usuarioId);

    const result = await pool.query(query, values);

    // Retornamos los datos actualizados al frontend
    res.status(200).json({ 
      message: 'Perfil actualizado con éxito',
      user: result.rows[0] 
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error interno al actualizar el perfil' });
  }
};

module.exports = {
  register,
  login,
  actualizarPerfil
};