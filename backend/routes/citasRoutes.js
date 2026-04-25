// backend/routes/citasRoutes.js
const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/authMiddleware");
const {
  agendarCita,
  actualizarEstadoCita,
  obtenerMisCitas,
  obtenerAgendaPeluquero,
  obtenerDisponibilidad,
  cancelarCita,
  reagendarCita,
  obtenerHistorialPeluquero
} = require("../controllers/citasController");

router.use(verificarToken);
router.post("/", agendarCita);
router.patch("/:cita_id/estado", actualizarEstadoCita);
router.get("/mis-citas", obtenerMisCitas);
router.get("/agenda", obtenerAgendaPeluquero);
router.get("/disponibilidad", obtenerDisponibilidad);
router.patch('/:id/cancelar', cancelarCita);
router.put('/:id/reagendar', reagendarCita);
router.get('/historial-peluquero', verificarToken, obtenerHistorialPeluquero);

module.exports = router;
