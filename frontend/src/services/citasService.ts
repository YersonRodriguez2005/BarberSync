import api from './api';

export const citasService = {
  obtenerMisCitas: async () => {
    const response = await api.get('/mis-citas');
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agendarCita: async (datosCita: any) => {
    const response = await api.post('/', datosCita);
    return response.data;
  },
  obtenerAgendaPeluquero: async () => {
    const response = await api.get('/agenda');
    return response.data;
  },
  actualizarEstadoCita: async (citaId: string, nuevoEstado: string) => {
    const response = await api.patch(`/${citaId}/estado`, { nuevo_estado: nuevoEstado });
    return response.data;
  },
  obtenerDisponibilidad: async (peluqueroId: string, fecha: string) => {
    const response = await api.get(`/disponibilidad?peluquero_id=${peluqueroId}&fecha=${fecha}`);
    return response.data; // Retorna algo como ["09:00", "14:30"]
  },
  cancelarCita: async (citaId: string) => {
    const response = await api.patch(`/${citaId}/cancelar`);
    return response.data;
  },
  reagendarCita: async (citaId: string, datos: { inicio_esperado: string, fin_esperado: string }) => {
    const response = await api.put(`${citaId}/reagendar`, datos);
    return response.data;
  },
  obtenerHistorialPeluquero: async (page: number = 1, limit: number = 5) => {
    const response = await api.get(`/historial-peluquero?page=${page}&limit=${limit}`);
    return response.data;
  },
};