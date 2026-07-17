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
  LuLoader,
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
        color: 'success',
        duration: 2500,
        position: 'top',
      });
      setTimeout(() => history.goBack(), 500); // Pequeña pausa antes de volver para mejor UX
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      presentToast({ message: 'Error al guardar los cambios', color: 'danger', duration: 3000 });
    } finally {
      setGuardando(false);
    }
  };

  const horariosOrdenados = DIAS.map(d =>
    horarios.find(h => h.dia_semana === d.id)
  ).filter(Boolean);

  const diasActivos = horarios.filter(h => h.trabaja).length;

  return (
    <IonPage>
      <IonContent scrollY={true} className="bg-[#0a0a0c]">
        <div className="relative min-h-full flex flex-col pb-10 overflow-x-hidden">
          
          {/* Luces Ambientales (Orbes GPU) */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />

          {/* ========================================================== */}
          {/* HEADER Y NAVEGACIÓN */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 pt-14 pb-6 flex items-center gap-4 animate-slide-up">
            <button
              onClick={() => history.goBack()}
              className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800/80 bg-[#121215] text-zinc-400 active:scale-95 active:text-amber-400 transition-all shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] flex-shrink-0"
            >
              <LuChevronLeft className="text-xl" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LuScissors className="text-amber-500 text-xs" />
                <span className="text-amber-500/70 text-xs tracking-[0.2em] uppercase font-semibold">
                  Mi Horario
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight font-serif tracking-tight">
                Disponibilidad
              </h1>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-36 space-y-6">
            
            {/* ========================================================== */}
            {/* RESUMEN VISUAL DE LA SEMANA (Glass Card) */}
            {/* ========================================================== */}
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Resumen Semanal</span>
                <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {diasActivos}/7 Días Activos
                </span>
              </div>
              <div className="flex justify-between items-center">
                {DIAS.map(d => {
                  const horario = horarios.find(h => h.dia_semana === d.id);
                  const activo = horario?.trabaja;
                  return (
                    <div key={d.id} className="flex flex-col items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${activo ? 'text-amber-400' : 'text-zinc-600'}`}>
                        {d.corto}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                          activo 
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-[#121215] text-zinc-700 border border-zinc-800 shadow-[inset_-1px_-1px_3px_rgba(255,255,255,0.02),inset_1px_1px_4px_rgba(0,0,0,0.8)]'
                        }`}
                      >
                        {activo ? '✓' : '·'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================== */}
            {/* LISTA DE DÍAS CONFIGURABLES */}
            {/* ========================================================== */}
            <div className="space-y-4">
              {cargando ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-24 rounded-3xl bg-zinc-900/60 border border-white/5" />
                  ))}
                </div>
              ) : (
                horariosOrdenados.map((horario, index) => {
                  const diaInfo = DIAS.find(d => d.id === horario.dia_semana);
                  const activo = horario.trabaja;
                  const delay = 150 + (index * 50);

                  return (
                    <div
                      key={horario.dia_semana}
                      className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 animate-slide-up ${
                        activo 
                          ? 'glass-card border-amber-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(245,158,11,0.05)]' 
                          : 'bg-zinc-900/30 border border-white/5 opacity-60 grayscale'
                      }`}
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      {/* Línea lateral decorativa si está activo */}
                      {activo && (
                        <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      )}

                      <div className={activo ? 'pl-2' : ''}>
                        {/* Cabecera del Día: Nombre y Toggle */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activo ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-600'}`}>
                              {activo ? <LuSun className="text-base" /> : <LuMoon className="text-base" />}
                            </div>
                            <span className={`font-serif text-lg font-black ${activo ? 'text-white' : 'text-zinc-500'}`}>
                              {diaInfo?.largo}
                            </span>
                          </div>

                          {/* Toggle Personalizado Neumórfico */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={activo}
                              onChange={e => handleChange(horario.dia_semana, 'trabaja', e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-[#121215] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-zinc-500 after:border-zinc-500 after:border after:rounded-full after:h-6 after:w-6 after:transition-all shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] peer-checked:after:bg-white peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:to-amber-600 peer-checked:shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                          </label>
                        </div>

                        {/* Controles de Selección de Hora */}
                        <div className={`transition-all duration-300 overflow-hidden ${activo ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                          <div className="flex gap-4">
                            {/* Input Apertura */}
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                                Apertura
                              </label>
                              <div className="soft-input-container !py-3">
                                <input
                                  type="time"
                                  value={horario.hora_apertura}
                                  onChange={e => handleChange(horario.dia_semana, 'hora_apertura', e.target.value)}
                                  className="w-full bg-transparent text-amber-400 font-mono font-bold text-sm focus:outline-none"
                                  style={{ colorScheme: 'dark' }}
                                />
                              </div>
                            </div>

                            {/* Separador */}
                            <div className="flex items-center justify-center pb-1">
                              <span className="text-zinc-600 font-black">—</span>
                            </div>

                            {/* Input Cierre */}
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                                Cierre
                              </label>
                              <div className="soft-input-container !py-3">
                                <input
                                  type="time"
                                  value={horario.hora_cierre}
                                  onChange={e => handleChange(horario.dia_semana, 'hora_cierre', e.target.value)}
                                  className="w-full bg-transparent text-zinc-300 font-mono font-bold text-sm focus:outline-none"
                                  style={{ colorScheme: 'dark' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* BOTTOM CTA FIJO (Botón de Guardar) */}
          {/* ========================================================== */}
          <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent backdrop-blur-sm z-30 transition-transform duration-300 translate-y-0">
            <button
              disabled={cargando || guardando}
              onClick={handleGuardar}
              className="soft-btn-primary h-14 w-full"
            >
              <span className="text-sm font-extrabold tracking-wider uppercase flex-1 text-center">
                {guardando ? 'Guardando...' : 'Guardar Horario'}
              </span>
              {!guardando && (
                <div className="bg-black/20 rounded-xl p-2 absolute right-2">
                  <LuSave className="text-lg" />
                </div>
              )}
              {guardando && (
                <div className="bg-black/20 rounded-xl p-2 absolute right-2">
                  <LuLoader className="text-lg animate-spin" />
                </div>
              )}
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfiguracionHorario;