import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  
  // Solicitar permisos al usuario
  requestPermission: async () => {
    await LocalNotifications.requestPermissions();
  },

  // Programar una notificación local
  scheduleReminder: async (idCita: number, fechaInicio: Date, codigo: string) => {
    // Calculamos el tiempo: fecha de inicio menos 5 minutos
    const notificationTime = new Date(fechaInicio.getTime() - 5 * 60000);

    // Si la hora ya pasó (ej: agendó para dentro de 2 minutos), no programar
    if (notificationTime <= new Date()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "¡Tu turno se acerca! ✂️",
          body: `Faltan 5 min para tu cita. Tu código es: ${codigo}`,
          id: idCita,
          schedule: { at: notificationTime },
          sound: 'default',
          attachments: [],
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }
};