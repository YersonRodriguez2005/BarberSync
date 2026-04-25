// backend/controllers/citasController.js
const pool = require("../config/db");

// Función auxiliar para generar un ID de turno único y corto
const generarCodigoVerificacion = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "BARB-";
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

// Agendar una nueva cita
const agendarCita = async (req, res) => {
  const { peluquero_id, inicio_esperado, fin_esperado } = req.body;
  const cliente_id = req.user.id;

  try {
    // 1. Validar cruces (se mantiene igual)
    const cruces = await pool.query(
      `
      SELECT id FROM citas 
      WHERE peluquero_id = $1 
      AND estado IN ('AGENDADA', 'EN_PROGRESO')
      AND (inicio_esperado < $3 AND fin_esperado > $2)
    `,
      [peluquero_id, inicio_esperado, fin_esperado],
    );

    if (cruces.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "El horario seleccionado ya no está disponible." });
    }

    // 2. Generar el código único (se mantiene igual)
    let codigo_verificacion = generarCodigoVerificacion();

    // 3. Insertar la cita (Actualizado sin servicio_id)
    const nuevaCita = await pool.query(
      `
      INSERT INTO citas (codigo_verificacion, cliente_id, peluquero_id, inicio_esperado, fin_esperado) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, codigo_verificacion, inicio_esperado, fin_esperado, estado
    `,
      [
        codigo_verificacion,
        cliente_id,
        peluquero_id,
        inicio_esperado,
        fin_esperado,
      ],
    );

    res.status(201).json({
      message: "Cita agendada exitosamente",
      cita: nuevaCita.rows[0],
    });
  } catch (error) {
    console.error("Error agendando cita:", error);
    res.status(500).json({ message: "Error interno al agendar la cita" });
  }
};

// Cambiar estado de la cita (Solo para el peluquero)
const actualizarEstadoCita = async (req, res) => {
  const { cita_id } = req.params;
  const { nuevo_estado } = req.body; // Ej: 'EN_PROGRESO', 'FINALIZADA'

  // Validar rol (Solo el peluquero o admin debería hacer esto)
  if (req.user.rol === "CLIENTE") {
    return res
      .status(403)
      .json({ message: "No tienes permisos para realizar esta acción" });
  }

  try {
    const citaActualizada = await pool.query(
      `
      UPDATE citas SET estado = $1 WHERE id = $2 RETURNING id, estado, codigo_verificacion
    `,
      [nuevo_estado, cita_id],
    );

    if (citaActualizada.rows.length === 0) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res
      .status(200)
      .json({ message: "Estado actualizado", cita: citaActualizada.rows[0] });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ message: "Error interno al actualizar estado" });
  }
};

const obtenerMisCitas = async (req, res) => {
  const cliente_id = req.user.id;

  try {
    const citas = await pool.query(
      `
  SELECT 
    c.id, 
    c.peluquero_id,
    c.inicio_esperado, 
    c.fin_esperado,
    c.estado, 
    c.codigo_verificacion,
    u.nombre as peluquero_nombre
  FROM citas c
  JOIN usuarios u ON c.peluquero_id = u.id
  WHERE c.cliente_id = $1 AND c.estado NOT IN ('CANCELADA', 'FINALIZADA')
  ORDER BY c.inicio_esperado ASC
`,
      [req.user.id],
    );

    res.status(200).json(citas.rows);
  } catch (error) {
    console.error("Error obteniendo mis citas:", error);
    res.status(500).json({ message: "Error obteniendo citas" });
  }
};

const obtenerAgendaPeluquero = async (req, res) => {
  const peluquero_id = req.user.id;

  try {
    const citas = await pool.query(
      `
      SELECT c.id, c.codigo_verificacion, c.inicio_esperado, c.fin_esperado, c.estado, u.nombre as cliente_nombre, u.telefono as cliente_telefono
      FROM citas c
      JOIN usuarios u ON c.cliente_id = u.id
      WHERE c.peluquero_id = $1 
      ORDER BY c.inicio_esperado ASC
    `,
      [peluquero_id],
    );

    res.status(200).json(citas.rows);
  } catch (error) {
    console.error("Error obteniendo agenda:", error);
    res.status(500).json({ message: "Error obteniendo la agenda" });
  }
};

const obtenerDisponibilidad = async (req, res) => {
  const { peluquero_id, fecha } = req.query; // fecha formato 'YYYY-MM-DD'

  try {
    // Determinamos qué día de la semana es la fecha solicitada (0-6)
    // Usamos T00:00:00 para forzar la zona horaria local correcta
    const diaSemana = new Date(fecha + "T00:00:00").getDay();

    // 1. Consultar el horario del peluquero para ese día específico
    const horario = await pool.query(
      `SELECT hora_apertura, hora_cierre, trabaja FROM horarios_semana WHERE peluquero_id = $1 AND dia_semana = $2`,
      [peluquero_id, diaSemana],
    );

    // Si el peluquero configuró que no trabaja hoy (ej. Domingo)
    if (horario.rowCount === 0 || !horario.rows[0].trabaja) {
      return res.status(200).json({ trabaja: false, ocupadas: [] });
    }

    // 2. Consultar las citas ya agendadas (la lógica que ya tenías)
    const citas = await pool.query(
      `
      SELECT inicio_esperado FROM citas 
      WHERE peluquero_id = $1 AND DATE(inicio_esperado) = $2 AND estado IN ('AGENDADA', 'EN_PROGRESO')
    `,
      [peluquero_id, fecha],
    );

    const horasOcupadas = citas.rows.map((cita) => {
      const d = new Date(cita.inicio_esperado);
      return d.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    });

    // 3. Responder con el paquete completo de datos
    res.status(200).json({
      trabaja: true,
      apertura: horario.rows[0].hora_apertura.substring(0, 5), // Extrae '10:00'
      cierre: horario.rows[0].hora_cierre.substring(0, 5),
      ocupadas: horasOcupadas,
    });
  } catch (error) {
    console.error("Error obteniendo disponibilidad:", error);
    res.status(500).json({ message: "Error al consultar disponibilidad" });
  }
};

const cancelarCita = async (req, res) => {
  const cita_id = req.params.id;
  const cliente_id = req.user.id;

  try {
    // Actualizamos el estado asegurándonos de que la cita pertenezca a este cliente
    // y que solo se puedan cancelar citas que estén 'AGENDADA'
    const resultado = await pool.query(
      `
      UPDATE citas 
      SET estado = 'CANCELADA' 
      WHERE id = $1 AND cliente_id = $2 AND estado = 'AGENDADA'
      RETURNING id
    `,
      [cita_id, cliente_id],
    );

    if (resultado.rowCount === 0) {
      return res
        .status(404)
        .json({
          message:
            "No se pudo cancelar. La cita no existe o ya no está disponible.",
        });
    }

    res.status(200).json({ message: "Cita cancelada exitosamente" });
  } catch (error) {
    console.error("Error cancelando cita:", error);
    res.status(500).json({ message: "Error interno al cancelar la cita" });
  }
};

const reagendarCita = async (req, res) => {
  const cita_id = req.params.id;
  const cliente_id = req.user.id;
  const { inicio_esperado, fin_esperado } = req.body;

  try {
    // 1. Obtener el peluquero original de esta cita
    const citaInfo = await pool.query(
      "SELECT peluquero_id FROM citas WHERE id = $1 AND cliente_id = $2",
      [cita_id, cliente_id],
    );

    if (citaInfo.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "La cita no existe o no te pertenece." });
    }
    const peluquero_id = citaInfo.rows[0].peluquero_id;

    // 2. VERIFICACIÓN DE CHOQUE DE HORARIOS (Excluyendo esta misma cita)
    const choque = await pool.query(
      `
      SELECT id FROM citas 
      WHERE peluquero_id = $1 
      AND estado IN ('AGENDADA', 'EN_PROGRESO')
      AND id != $2 
      AND (inicio_esperado < $4 AND fin_esperado > $3)
    `,
      [peluquero_id, cita_id, inicio_esperado, fin_esperado],
    );

    if (choque.rows.length > 0) {
      return res
        .status(409)
        .json({
          message: "El horario seleccionado ya fue ocupado por otra persona.",
        });
    }

    // 3. Si está libre, aplicamos el cambio
    const resultado = await pool.query(
      `
      UPDATE citas 
      SET inicio_esperado = $1, fin_esperado = $2 
      WHERE id = $3
      RETURNING id, inicio_esperado, codigo_verificacion
    `,
      [inicio_esperado, fin_esperado, cita_id],
    );

    res
      .status(200)
      .json({
        message: "Cita reagendada exitosamente",
        cita: resultado.rows[0],
      });
  } catch (error) {
    console.error("Error reagendando cita:", error);
    res.status(500).json({ message: "Error interno al reagendar la cita" });
  }
};

const obtenerHistorialPeluquero = async (req, res) => {
  const peluquero_id = req.user.id;
  // Recibimos la página y el límite desde el frontend (por defecto página 1, 15 items)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    // 1. Obtenemos el total de citas finalizadas para saber si hay más páginas
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM citas WHERE peluquero_id = $1 AND estado = 'FINALIZADA'`,
      [peluquero_id],
    );
    const totalItems = parseInt(totalResult.rows[0].count);

    // 2. Obtenemos solo el "trozo" de citas solicitado
    const citas = await pool.query(
      `
      SELECT 
        c.id, 
        u.nombre AS cliente_nombre, 
        c.inicio_esperado, 
        c.codigo_verificacion 
      FROM citas c
      JOIN usuarios u ON c.cliente_id = u.id
      WHERE c.peluquero_id = $1 AND c.estado = 'FINALIZADA'
      ORDER BY c.inicio_esperado DESC
      LIMIT $2 OFFSET $3
    `,
      [peluquero_id, limit, offset],
    );

    res.status(200).json({
      data: citas.rows,
      meta: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        hasMore: page < Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo historial paginado:", error);
    res.status(500).json({ message: "Error interno al obtener el historial" });
  }
};

module.exports = {
  agendarCita,
  actualizarEstadoCita,
  obtenerMisCitas,
  obtenerAgendaPeluquero,
  obtenerDisponibilidad,
  cancelarCita,
  reagendarCita,
  obtenerHistorialPeluquero,
};
