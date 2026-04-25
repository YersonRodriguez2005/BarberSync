import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  useIonToast,
} from '@ionic/react';
import {
  LuScissors,
  LuSave,
  LuChevronLeft,
  LuMoon,
  LuSun,
} from 'react-icons/lu';
import { usuariosService } from '../services/usuariosService';
import { useHistory } from 'react-router-dom';

const DIAS = [
  { id: 1, corto: 'LUN', largo: 'Lunes' },
  { id: 2, corto: 'MAR', largo: 'Martes' },
  { id: 3, corto: 'MIÉ', largo: 'Miércoles' },
  { id: 4, corto: 'JUE', largo: 'Jueves' },
  { id: 5, corto: 'VIE', largo: 'Viernes' },
  { id: 6, corto: 'SÁB', largo: 'Sábado' },
  { id: 0, corto: 'DOM', largo: 'Domingo' },
];

const ConfiguracionHorario: React.FC = () => {
  const [presentToast] = useIonToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        const data = await usuariosService.obtenerMisHorarios();
        setHorarios(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        presentToast({ message: 'Error cargando horarios', color: 'danger', duration: 3000 });
      } finally {
        setCargando(false);
      }
    };
    cargarHorarios();
  }, [presentToast]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (dia_semana: number, campo: string, valor: any) => {
    setHorarios(prev =>
      prev.map(h => h.dia_semana === dia_semana ? { ...h, [campo]: valor } : h)
    );
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await usuariosService.actualizarMisHorarios(horarios);
      presentToast({
        message: '¡Horario actualizado!',
        color: 'dark',
        duration: 2500,
        position: 'top',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      presentToast({ message: 'Error al guardar los cambios', color: 'danger', duration: 3000 });
    } finally {
      setGuardando(false);
    }
  };

  // Ordenar los horarios según el orden de DIAS
  const horariosOrdenados = DIAS.map(d =>
    horarios.find(h => h.dia_semana === d.id)
  ).filter(Boolean);

  const diasActivos = horarios.filter(h => h.trabaja).length;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          className="min-h-full flex flex-col"
          style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)' }}
        >
          {/* Header */}
          <div className="px-6 pt-14 pb-6">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => history.goBack()}
                className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500 active:border-amber-500 active:text-amber-400 transition-colors"
              >
                <LuChevronLeft className="text-base" />
              </button>

              <div className="flex items-center gap-2">
                <LuScissors className="text-amber-500 text-xs" />
                <span className="text-amber-500/70 text-xs tracking-[0.2em] uppercase font-semibold">
                  Mi Horario
                </span>
              </div>

              {/* Spacer para centrar el label */}
              <div className="w-11" />
            </div>

            <h1
              className="text-3xl font-black text-white leading-tight mb-1"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Disponibilidad
            </h1>
            <p className="text-zinc-600 text-xs">
              {diasActivos} día{diasActivos !== 1 ? 's' : ''} activo{diasActivos !== 1 ? 's' : ''} esta semana
            </p>
          </div>

          {/* Resumen visual de días */}
          <div className="px-6 mb-8">
            <div
              className="p-4 rounded-2xl flex justify-between"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {DIAS.map(d => {
                const horario = horarios.find(h => h.dia_semana === d.id);
                const activo = horario?.trabaja;
                return (
                  <div key={d.id} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">{d.corto}</span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                      style={{
                        background: activo
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : 'rgba(255,255,255,0.04)',
                        color: activo ? '#000' : '#333',
                        border: activo ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {activo ? '✓' : '·'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de días */}
          <div className="px-6 pb-36 space-y-3">
            {cargando ? (
              <>
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                ))}
              </>
            ) : (
              horariosOrdenados.map((horario) => {
                const diaInfo = DIAS.find(d => d.id === horario.dia_semana);
                const activo = horario.trabaja;

                return (
                  <div
                    key={horario.dia_semana}
                    className="p-5 rounded-2xl relative overflow-hidden transition-all"
                    style={{
                      background: activo
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.015)',
                      border: activo
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* Indicador lateral ámbar si está activo */}
                    {activo && (
                      <div
                        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                        style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }}
                      />
                    )}

                    <div className={activo ? 'pl-3' : ''}>
                      {/* Fila superior: nombre del día + toggle */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          {activo ? (
                            <LuSun className="text-amber-500 text-sm" />
                          ) : (
                            <LuMoon className="text-zinc-700 text-sm" />
                          )}
                          <span
                            className="font-black text-base"
                            style={{
                              fontFamily: "'Georgia', serif",
                              color: activo ? '#fff' : '#3f3f46',
                            }}
                          >
                            {diaInfo?.largo}
                          </span>
                        </div>

                        {/* Toggle custom */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={activo}
                            onChange={e => handleChange(horario.dia_semana, 'trabaja', e.target.checked)}
                          />
                          <div
                            className="w-12 h-6 rounded-full relative transition-all peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:transition-all"
                            style={{
                              background: activo
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                : 'rgba(255,255,255,0.08)',
                              boxShadow: activo ? '0 2px 12px rgba(217,119,6,0.3)' : 'none',
                            }}
                          />
                        </label>
                      </div>

                      {/* Controles de hora */}
                      {activo ? (
                        <div className="flex gap-3">
                          {/* Apertura */}
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 block">
                              Apertura
                            </label>
                            <div
                              className="flex items-center rounded-xl px-3 py-2.5"
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              <input
                                type="time"
                                value={horario.hora_apertura}
                                onChange={e => handleChange(horario.dia_semana, 'hora_apertura', e.target.value)}
                                className="w-full bg-transparent text-amber-400 font-black text-sm focus:outline-none"
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          </div>

                          {/* Separador */}
                          <div className="flex items-end pb-3">
                            <span className="text-zinc-700 font-black text-lg">—</span>
                          </div>

                          {/* Cierre */}
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 block">
                              Cierre
                            </label>
                            <div
                              className="flex items-center rounded-xl px-3 py-2.5"
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              <input
                                type="time"
                                value={horario.hora_cierre}
                                onChange={e => handleChange(horario.dia_semana, 'hora_cierre', e.target.value)}
                                className="w-full bg-transparent text-zinc-300 font-black text-sm focus:outline-none"
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] text-center py-1">
                          Día de descanso
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Botón flotante */}
          <div
            className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-6"
            style={{
              background: 'linear-gradient(to top, #0a0a0a 60%, transparent)',
            }}
          >
            <button
              disabled={cargando || guardando}
              onClick={handleGuardar}
              className="w-full py-4 rounded-2xl font-black text-sm tracking-wider text-black flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
              style={{
                background: guardando
                  ? 'rgba(217,119,6,0.5)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 8px 24px rgba(217,119,6,0.3)',
                letterSpacing: '0.1em',
              }}
            >
              <LuSave className="text-base" />
              {guardando ? 'GUARDANDO...' : 'GUARDAR HORARIO'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfiguracionHorario;