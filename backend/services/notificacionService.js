const cron = require("node-cron");
const pool = require("../config/db");

const iniciarCronNotificaciones = () => {
  // Se ejecuta cada minuto (* * * * *)
  cron.schedule("* * * * *", async () => {
    console.log("--- Revisando citas para notificar (Ventana de 5 min) ---");

    try {
      // 1. Buscar citas que inicien en aproximadamente 5 minutos
      // Usamos un intervalo para capturar cualquier cita en el rango del próximo minuto
      const citasPendientes = await pool.query(`
  SELECT c.id, u.nombre, u.fcm_token, c.inicio_esperado, c.codigo_verificacion
  FROM citas c
  JOIN usuarios u ON c.cliente_id = u.id
  WHERE c.estado = 'AGENDADA'
  AND c.notificacion_enviada = false
  AND u.fcm_token IS NOT NULL -- Solo si el usuario tiene un token registrado
  AND c.inicio_esperado <= (CURRENT_TIMESTAMP + INTERVAL '5 minutes')
  AND c.inicio_esperado > CURRENT_TIMESTAMP
`);

      for (const cita of citasPendientes.rows) {
        console.log(
          `🔔 Enviando notificación a ${cita.nombre} para su cita de las ${cita.inicio_esperado}`,
        );

        // AQUÍ IRÍA LA LÓGICA DE FIREBASE O SMS
        // enviarPush(cita.token_dispositivo, "¡Es tu turno!", "Acércate a la barbería...");

        // 2. Marcar como enviada inmediatamente
        await pool.query(
          "UPDATE citas SET notificacion_enviada = true WHERE id = $1",
          [cita.id],
        );
      }
    } catch (error) {
      console.error("Error en el cron de notificaciones:", error);
    }
  });
};

module.exports = { iniciarCronNotificaciones };
