import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { LuCalendarDays, LuClock, LuChevronLeft, LuCalendarClock, LuCoffee, LuScissors } from 'react-icons/lu';
import { useHistory, useLocation } from 'react-router-dom';
import { citasService } from '../services/citasService';
import { NotificationService } from '../services/notificationService';

const ReagendarCita: React.FC = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const location = useLocation<{ cita: any }>();
  const citaActual = location.state?.cita;
  const [presentToast] = useIonToast();

  const [fechaSel, setFechaSel] = useState<Date | null>(null);
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  
  const [diaLaboral, setDiaLaboral] = useState<boolean>(true);
  const [horarioApertura, setHorarioApertura] = useState<string>('10:00');
  const [horarioCierre, setHorarioCierre] = useState<string>('20:00');

  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Si alguien entra a la ruta directamente sin una cita, lo devolvemos
  useEffect(() => {
    if (!citaActual) history.replace('/dashboard-cliente');
  }, [citaActual, history]);

  const generarHorasDisponibles = () => {
    if (!diaLaboral) return [];
    const horas = [];
    const [aperturaH, aperturaM] = horarioApertura.split(':').map(Number);
    const [cierreH, cierreM] = horarioCierre.split(':').map(Number);
    let tiempoActual = aperturaH * 60 + aperturaM;
    const ultimoTurnoPosible = (cierreH * 60 + cierreM) - 30;

    while (tiempoActual <= ultimoTurnoPosible) {
      const hStr = String(Math.floor(tiempoActual / 60)).padStart(2, '0');
      const mStr = String(tiempoActual % 60).padStart(2, '0');
      horas.push(`${hStr}:${mStr}`);
      tiempoActual += 10;
    }
    return horas;
  };

  const todasLasHoras = generarHorasDisponibles();

  const horasVisibles = (() => {
    if (!fechaSel || !diaLaboral) return [];
    const ahora = new Date();
    const esHoy =
      fechaSel.getDate() === ahora.getDate() &&
      fechaSel.getMonth() === ahora.getMonth() &&
      fechaSel.getFullYear() === ahora.getFullYear();
    if (!esHoy) return todasLasHoras;
    return todasLasHoras.filter((hora) => {
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m > ahora.getHours() * 60 + ahora.getMinutes();
    });
  })();

  useEffect(() => {
    if (citaActual && fechaSel) {
      const consultarDisponibilidad = async () => {
        setCargandoHoras(true);
        setHoraSel(null); 
        try {
          const year = fechaSel.getFullYear();
          const month = String(fechaSel.getMonth() + 1).padStart(2, '0');
          const day = String(fechaSel.getDate()).padStart(2, '0');
          const fechaString = `${year}-${month}-${day}`;

          const data = await citasService.obtenerDisponibilidad(citaActual.peluquero_id, fechaString);
          
          if (Array.isArray(data)) {
            setDiaLaboral(true);
            setHorasOcupadas(data);
          } else if (data && typeof data === 'object') {
            setDiaLaboral(data.trabaja);
            if (data.trabaja) {
              setHorarioApertura(data.apertura);
              setHorarioCierre(data.cierre);
              setHorasOcupadas(data.ocupadas || []);
            } else {
              setHorasOcupadas([]);
            }
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setHorasOcupadas([]); 
        } finally {
          setCargandoHoras(false);
        }
      };
      consultarDisponibilidad();
    }
  }, [citaActual, fechaSel]);

  const proximosDias = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatearDia = (fecha: Date) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return { nombre: dias[fecha.getDay()], numero: fecha.getDate() };
  };

  const puedeAgendar = fechaSel && horaSel && diaLaboral;

  const handleReagendar = async () => {
    if (!puedeAgendar || !citaActual) return;
    setCargando(true);
    try {
      const fechaInicio = new Date(fechaSel!);
      const [horas, minutos] = horaSel!.split(':');
      fechaInicio.setHours(parseInt(horas), parseInt(minutos), 0, 0);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMinutes(fechaFin.getMinutes() + 30);

      const res = await citasService.reagendarCita(citaActual.id, {
        inicio_esperado: fechaInicio.toISOString(),
        fin_esperado: fechaFin.toISOString(),
      });

      // Reprogramar notificación local
      if (res.cita) {
        await NotificationService.scheduleReminder(
          res.cita.id,
          new Date(res.cita.inicio_esperado),
          res.cita.codigo_verificacion
        );
      }

      presentToast({ message: '¡Turno reagendado con éxito!', duration: 3000, color: 'success', position: 'top' });
      history.push('/dashboard-cliente');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'Error al reagendar. Intenta de nuevo.';
      presentToast({ message: mensaje, duration: 4000, color: 'danger' });
    } finally {
      setCargando(false);
    }
  };

  if (!citaActual) return null;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)' }}>
          
          <div className="px-6 pt-14 pb-6 flex items-center gap-4">
            <button
              onClick={() => history.push('/dashboard-cliente')}
              className="w-10 h-10 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 active:text-amber-500 transition-colors flex-shrink-0"
            >
              <LuChevronLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Reagendar
              </h1>
              <p className="text-zinc-600 text-xs">Modifica la fecha de tu reserva</p>
            </div>
          </div>

          <div className="px-6 pb-36 space-y-10">
            {/* Información del Barbero actual bloqueado */}
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                 <LuScissors className="text-amber-500 text-xl" />
               </div>
               <div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Peluquero actual</p>
                 <p className="text-white font-medium capitalize">{citaActual.peluquero_nombre}</p>
               </div>
            </div>

            {/* SECCIÓN: Fecha */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <LuCalendarDays className="text-amber-500 text-sm" /> Nueva fecha
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {proximosDias.map((dia, idx) => {
                  const { nombre, numero } = formatearDia(dia);
                  const seleccionado = fechaSel?.getDate() === dia.getDate() && fechaSel?.getMonth() === dia.getMonth();
                  return (
                    <div
                      key={idx}
                      onClick={() => setFechaSel(dia)}
                      className="flex-shrink-0 w-16 py-4 rounded-2xl text-center transition-all active:scale-95 cursor-pointer"
                      style={{
                        background: seleccionado ? 'linear-gradient(145deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.03)',
                        border: seleccionado ? '1.5px solid #f59e0b' : '1.5px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p className={`text-xs font-bold uppercase mb-1 ${seleccionado ? 'text-black/60' : 'text-zinc-600'}`}>{nombre}</p>
                      <p className={`text-xl font-black ${seleccionado ? 'text-black' : 'text-white'}`}>{numero}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECCIÓN: Hora */}
            <section className={!fechaSel ? 'opacity-30 pointer-events-none' : ''}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <LuClock className="text-amber-500 text-sm" /> Nuevo horario
                </h2>
                {cargandoHoras && <span className="text-amber-500 text-xs animate-pulse font-medium">Buscando...</span>}
              </div>

              {!diaLaboral ? (
                 <div className="p-6 rounded-2xl text-center text-sm font-medium flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', color: '#888' }}>
                   <LuCoffee className="text-3xl text-zinc-600" /> El peluquero descansa este día.
                 </div>
              ) : horasVisibles.length === 0 && fechaSel ? (
                <div className="p-4 rounded-2xl text-center text-sm font-medium" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', color: '#d97706' }}>
                  No hay horarios disponibles.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {horasVisibles.map((hora) => {
                    const ocupada = horasOcupadas.includes(hora);
                    const seleccionada = horaSel === hora;
                    return (
                      <button
                        key={hora}
                        disabled={ocupada}
                        onClick={() => setHoraSel(hora)}
                        className="py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                        style={{
                          background: ocupada ? 'rgba(255,255,255,0.02)' : seleccionada ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.04)',
                          border: ocupada ? '1px solid rgba(255,255,255,0.04)' : seleccionada ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                          color: ocupada ? '#333' : seleccionada ? '#000' : '#aaa',
                          textDecoration: ocupada ? 'line-through' : 'none',
                        }}
                      >
                        {hora}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #0a0a0a 70%, transparent)' }}>
            <button
              disabled={!puedeAgendar || cargando}
              onClick={handleReagendar}
              className="w-full flex items-center justify-center px-6 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{
                height: '58px',
                background: puedeAgendar ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
                color: puedeAgendar ? '#000' : '#444',
              }}
            >
              <LuCalendarClock className="text-lg mr-2" />
              <span className="text-sm tracking-wide">{cargando ? 'Procesando...' : 'Confirmar Reagendamiento'}</span>
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReagendarCita;