import React, { useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
  useIonToast,
} from "@ionic/react";
import {
  LuCircleCheck,
  LuClock,
  LuPlay,
  LuUsers,
  LuLogOut,
  LuScissors,
  LuCalendarDays,
  LuSettings,
  LuHash,
  LuLoader,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { citasService } from "../services/citasService";
import { useHistory } from "react-router-dom";

const DashboardPeluquero: React.FC = () => {
  const { user, logout } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [historial, setHistorial] = useState<any[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMasCitas, setHayMasCitas] = useState(true);
  const [historialCargado, setHistorialCargado] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);

  const cargandoHistorialRef = useRef(false);
  const [presentToast] = useIonToast();
  const history = useHistory();

  const cargarAgenda = async () => {
    setCargando(true);
    try {
      const data = await citasService.obtenerAgendaPeluquero();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCitas(data.filter((c: any) => c.estado !== "CANCELADA"));
    } catch (error) {
      console.error("Error al cargar agenda", error);
      presentToast({ message: "Error cargando agenda", duration: 2000, color: "danger" });
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async (page: number, append: boolean = false) => {
    if (cargandoHistorialRef.current) return;
    cargandoHistorialRef.current = true;
    if (append) setCargandoMas(true);

    try {
      const res = await citasService.obtenerHistorialPeluquero(page);
      if (!res || !res.data || !res.meta) return;

      if (append) {
        setHistorial((prev) => [...prev, ...res.data]);
      } else {
        setHistorial(res.data);
      }
      setPaginaActual(res.meta.currentPage);
      setHayMasCitas(res.meta.hasMore);
    } catch (error) {
      console.error("Error cargando historial:", error);
      presentToast({ message: "Error cargando historial", duration: 2000, color: "danger" });
    } finally {
      setHistorialCargado(true);
      setCargandoMas(false);
      cargandoHistorialRef.current = false;
    }
  };

  useIonViewWillEnter(() => {
    setHistorialCargado(false);
    setHistorial([]);
    setPaginaActual(1);
    setHayMasCitas(true);
    cargarAgenda();
    cargarHistorial(1, false);
  });

  const handleRefresh = async (event: CustomEvent) => {
    setHistorial([]);
    setPaginaActual(1);
    setHayMasCitas(true);
    setHistorialCargado(false);
    await Promise.all([cargarAgenda(), cargarHistorial(1, false)]);
    event.detail.complete();
  };

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const cambiarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      await citasService.actualizarEstadoCita(citaId, nuevoEstado);
      presentToast({ message: "Estado actualizado", duration: 2000, color: "dark" });
      cargarAgenda();
      if (nuevoEstado === "FINALIZADA") {
        setHistorial([]);
        setPaginaActual(1);
        setHayMasCitas(true);
        setHistorialCargado(false);
        cargarHistorial(1, false);
      }
    } catch {
      presentToast({ message: "Error al actualizar el estado", duration: 2000, color: "danger" });
    }
  };

  const formatearHora = (fechaString: string) =>
    new Date(fechaString).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const citasPendientes = citas.filter((c) => c.estado === "AGENDADA" || c.estado === "EN_PROGRESO");
  const citasFinalizadasHoy = citas.filter((c) => c.estado === "FINALIZADA");
  const primerNombre = user?.nombre?.split(" ")[0] ?? "Barbero";

  return (
    <IonPage>
      <IonContent scrollY={true} className="bg-[#0a0a0c]">
        <div className="relative min-h-full flex flex-col pb-10 overflow-x-hidden">
          
          {/* Iluminación Ambiental (Orbes GPU) */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />
          <div className="absolute top-64 -left-32 w-80 h-80 bg-zinc-600/5 rounded-full blur-[80px] pointer-events-none" />

          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* ========================================================== */}
          {/* HEADER NEUMÓRFICO */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 pt-14 pb-6 flex justify-between items-start animate-slide-up">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <LuScissors className="text-amber-400 text-xs" />
                </div>
                <span className="text-amber-400/80 text-[11px] tracking-[0.2em] uppercase font-bold">
                  Panel Barbero
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight font-serif">
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 capitalize">{primerNombre}</span>
              </h1>
              <p className="text-zinc-500 text-xs mt-1 font-medium flex items-center gap-1.5">
                <LuClock className="text-amber-500/70" />
                {citasPendientes.length} turno{citasPendientes.length !== 1 ? "s" : ""} en cola
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => history.push("/configuracion-horario")}
                aria-label="Configurar Horario"
                className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800/80 bg-[#121215] text-zinc-400 active:scale-95 active:text-amber-400 transition-all shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)]"
              >
                <LuSettings className="text-lg" />
              </button>
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800/80 bg-[#121215] text-zinc-500 active:scale-95 active:border-red-900/50 active:text-red-400 transition-all shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)]"
              >
                <LuLogOut className="text-lg" />
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* STATS RÁPIDAS (Glass Cards) */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 mb-8 grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="p-4 rounded-3xl bg-amber-500/5 backdrop-blur-md border border-amber-500/20 shadow-[0_8px_16px_rgba(217,119,6,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20"><LuCalendarDays className="text-3xl text-amber-500" /></div>
              <p className="text-amber-500/70 text-xs mb-1 uppercase tracking-widest font-bold">Pendientes</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-600">
                {citasPendientes.length}
              </p>
            </div>
            
            <div className="p-4 rounded-3xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><LuCircleCheck className="text-3xl text-zinc-400" /></div>
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold">Completados</p>
              <p className="text-3xl font-black text-zinc-300">
                {citasFinalizadasHoy.length}
              </p>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-10 space-y-8">
            {cargando ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-3xl bg-zinc-900/60 border border-white/5" />
                ))}
              </div>
            ) : (
              <>
                {/* ========================================================== */}
                {/* LISTA DE TURNOS (Con diferenciación visual de Estado) */}
                {/* ========================================================== */}
                <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <LuClock className="text-amber-500 text-base" />
                    <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                      Turnos en Cola
                    </h2>
                  </div>

                  {citasPendientes.length === 0 ? (
                    <div className="glass-card p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-zinc-800">
                      <LuCalendarDays className="text-zinc-600 text-4xl mb-3" />
                      <p className="text-zinc-400 text-sm font-medium">Agenda despejada. Sin turnos pendientes.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {citasPendientes.map((cita) => {
                        const enProgreso = cita.estado === "EN_PROGRESO";
                        
                        return (
                          <div
                            key={cita.id}
                            className={`glass-card p-5 relative overflow-hidden transition-all duration-300 ${
                              enProgreso ? "border-amber-500/40 shadow-[0_15px_35px_rgba(217,119,6,0.15)] bg-amber-500/[0.03]" : "border-white/5"
                            }`}
                          >
                            {/* Línea acento lateral */}
                            <div
                              className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                              style={{
                                background: enProgreso ? "linear-gradient(180deg, #fbbf24, #d97706)" : "rgba(255,255,255,0.1)",
                              }}
                            />
                            
                            <div className="pl-3">
                              {/* Fila 1: Hora, Nombre y Status Badge */}
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="text-2xl font-black text-white mb-0.5 font-serif tracking-tight">
                                    {formatearHora(cita.inicio_esperado)}
                                  </p>
                                  <p className="text-zinc-300 font-semibold text-sm capitalize">
                                    {cita.cliente_nombre}
                                  </p>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                                    enProgreso 
                                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse" 
                                      : "bg-zinc-800/80 border border-white/5 text-zinc-400"
                                  }`}
                                >
                                  {enProgreso ? "En Corte" : "Agendada"}
                                </span>
                              </div>

                              {/* Fila 2: Código Neumórfico y Botón Acción */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d0d11] border border-zinc-800/80 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_5px_rgba(0,0,0,0.8)]">
                                  <LuHash className="text-amber-600/50 text-sm" />
                                  <span className="text-sm font-mono font-bold tracking-[0.1em] text-zinc-300">
                                    {cita.codigo_verificacion}
                                  </span>
                                </div>

                                {cita.estado === "AGENDADA" && (
                                  <button
                                    onClick={() => cambiarEstado(cita.id, "EN_PROGRESO")}
                                    className="soft-btn-primary !w-auto !px-5 !py-2.5 !rounded-xl text-xs flex-1"
                                  >
                                    <LuPlay className="text-base" />
                                    <span>Iniciar</span>
                                  </button>
                                )}
                                
                                {cita.estado === "EN_PROGRESO" && (
                                  <button
                                    onClick={() => cambiarEstado(cita.id, "FINALIZADA")}
                                    className="relative flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white overflow-hidden transition-all duration-200 active:scale-95 bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_8px_20px_rgba(16,185,129,0.3)] border border-emerald-400/30"
                                  >
                                    <LuCircleCheck className="text-base" />
                                    <span>Finalizar</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* ========================================================== */}
                {/* HISTORIAL GENERAL (Glass Pills) */}
                {/* ========================================================== */}
                {historialCargado && (
                  <section className="animate-slide-up" style={{ animationDelay: "300ms" }}>
                    <div className="flex items-center gap-2 mb-4 px-1 mt-6">
                      <LuUsers className="text-zinc-600 text-base" />
                      <h2 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest">
                        Historial de Cortes
                      </h2>
                    </div>

                    {historial.length === 0 ? (
                      <div className="glass-card p-6 text-center border-white/5 opacity-70">
                        <p className="text-zinc-500 text-sm">Aún no has finalizado cortes.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {historial.map((cita) => (
                            <div
                              key={cita.id}
                              className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-zinc-900/30 backdrop-blur-sm border border-white/5 shadow-md"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                                  <LuCircleCheck className="text-emerald-500 text-sm" />
                                </div>
                                <div>
                                  <p className="text-zinc-300 text-sm font-bold capitalize">
                                    {cita.cliente_nombre}
                                  </p>
                                  <p className="text-zinc-500 text-xs font-mono mt-0.5">
                                    {formatearHora(cita.inicio_esperado)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/5">
                                Listo
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Botón Ver Más Neumórfico */}
                        {hayMasCitas ? (
                          <button
                            onClick={() => cargarHistorial(paginaActual + 1, true)}
                            disabled={cargandoMas}
                            className="glass-pill-btn w-full mt-5"
                          >
                            {cargandoMas ? (
                              <>
                                <LuLoader className="animate-spin text-lg text-amber-500" />
                                <span>Cargando...</span>
                              </>
                            ) : (
                              <span>Ver más cortes ({paginaActual})</span>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-4 mt-8 opacity-50">
                            <div className="h-px flex-1 bg-zinc-800" />
                            <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
                              Fin del registro
                            </span>
                            <div className="h-px flex-1 bg-zinc-800" />
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DashboardPeluquero;