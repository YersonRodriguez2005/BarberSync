// backend/controllers/usuariosController.js
const pool = require('../config/db');

const obtenerPeluqueros = async (req, res) => {
  try {
    // Buscamos solo a los usuarios que tengan el rol exacto de 'PELUQUERO'
    const result = await pool.query(
      "SELECT id, nombre FROM usuarios WHERE rol = 'PELUQUERO'"
    );
    
    // Retornamos la lista al frontend
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error obteniendo peluqueros:', error);
    res.status(500).json({ message: 'Error interno al obtener la lista de peluqueros' });
  }
};

// Obtener el horario del peluquero logueado
const obtenerMisHorarios = async (req, res) => {
  try {
    const horarios = await pool.query(
      'SELECT dia_semana, hora_apertura, hora_cierre, trabaja FROM horarios_semana WHERE peluquero_id = $1 ORDER BY dia_semana ASC',
      [req.user.id]
    );
    res.status(200).json(horarios.rows);
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({ message: 'Error interno al obtener horarios' });
  }
};

// Actualizar el horario completo (Usando Transacciones SQL)
const actualizarMisHorarios = async (req, res) => {
  const peluquero_id = req.user.id;
  const { horarios } = req.body; // Esperamos un arreglo con los 7 días

  const client = await pool.connect(); // Usamos un cliente específico para la transacción
  try {
    await client.query('BEGIN'); // Iniciamos la transacción

    for (const h of horarios) {
      // Hacemos un UPSERT (Actualizar si existe, insertar si no) por seguridad
      await client.query(`
        INSERT INTO horarios_semana (peluquero_id, dia_semana, hora_apertura, hora_cierre, trabaja)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (peluquero_id, dia_semana) 
        DO UPDATE SET hora_apertura = EXCLUDED.hora_apertura, hora_cierre = EXCLUDED.hora_cierre, trabaja = EXCLUDED.trabaja
      `, [peluquero_id, h.dia_semana, h.hora_apertura, h.hora_cierre, h.trabaja]);
    }

    await client.query('COMMIT'); // Guardamos los cambios
    res.status(200).json({ message: 'Horarios actualizados correctamente' });
  } catch (error) {
    await client.query('ROLLBACK'); // Si falla un día, deshacemos todo
    console.error('Error actualizando horarios:', error);
    res.status(500).json({ message: 'Error al guardar los horarios' });
  } finally {
    client.release();
  }
};

module.exports = {
  obtenerPeluqueros,
  obtenerMisHorarios,
  actualizarMisHorarios
};