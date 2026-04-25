const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const citasRoutes = require('./routes/citasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const { iniciarCronNotificaciones } = require('./services/notificacionService');
iniciarCronNotificaciones();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', citasRoutes);
app.use('/api', usuariosRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});