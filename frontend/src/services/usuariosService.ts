import api from './api';

export const usuariosService = {
  // Función que llama a nuestro backend para traer los usuarios con rol 'PELUQUERO'
  obtenerPeluqueros: async () => {
    const response = await api.get('/peluqueros');
    return response.data;
  },
  obtenerMisHorarios: async () => {
    const response = await api.get('/mis-horarios');
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actualizarMisHorarios: async (horarios: any[]) => {
    const response = await api.put('/mis-horarios', { horarios });
    return response.data;
  },
  actualizarPerfil: async (datos: { nombre: string, email: string, password?: string }) => {
    // Asegúrate de que la ruta coincida con la que creaste en el backend
    const response = await api.put('/perfil', datos);
    return response.data;
  }
};