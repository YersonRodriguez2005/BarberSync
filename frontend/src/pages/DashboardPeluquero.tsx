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

  // Ref para prevenir llamadas concurrentes
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
        setHistorial(prev => [...prev, ...res.data]);
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

  const citasPendientes = citas.filter(
    (c) => c.estado === "AGENDADA" || c.estado === "EN_PROGRESO"
  );
  const citasFinalizadasHoy = citas.filter((c) => c.estado === "FINALIZADA");
  const primerNombre = user?.nombre?.split(" ")[0] ?? "Barbero";

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          className="min-h-full flex flex-col"
          style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)" }}
        >
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* Header */}
          <div className="px-6 pt-14 pb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LuScissors className="text-amber-500 text-xs" />
                <span className="text-amber-500/70 text-xs tracking-[0.2em] uppercase font-semibold">
                  Panel Barbero
                </span>
              </div>
              <h1
                className="text-3xl font-black text-white leading-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Hola,{" "}
                <span className="text-amber-500 capitalize">{primerNombre}</span>
              </h1>
              <p className="text-zinc-600 text-xs mt-0.5">
                {citasPendientes.length} turno{citasPendientes.length !== 1 ? "s" : ""} pendiente
                {citasPendientes.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => history.push("/configuracion-horario")}
                className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500 active:border-amber-500 active:text-amber-400 transition-colors"
              >
                <LuSettings className="text-base" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500 active:border-red-900 active:text-red-400 transition-colors"
              >
                <LuLogOut className="text-base" />
              </button>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="px-6 mb-8 grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.2)",
              }}
            >
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Pendientes</p>
              <p
                className="text-3xl font-black"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {citasPendientes.length}
              </p>
            </div>
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Completados hoy</p>
              <p className="text-3xl font-black text-zinc-300">{citasFinalizadasHoy.length}</p>
            </div>
          </div>

          <div className="px-6 pb-10 space-y-8">
            {cargando ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Turnos pendientes */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <LuClock className="text-amber-500 text-sm" />
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                      Turnos pendientes
                    </h2>
                  </div>

                  {citasPendientes.length === 0 ? (
                    <div
                      className="p-6 rounded-2xl text-center"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <LuCalendarDays className="text-zinc-700 text-2xl mx-auto mb-2" />
                      <p className="text-zinc-600 text-sm">Sin turnos pendientes por ahora.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {citasPendientes.map((cita) => {
                        const enProgreso = cita.estado === "EN_PROGRESO";
                        return (
                          <div
                            key={cita.id}
                            className="p-5 rounded-2xl relative overflow-hidden"
                            style={{
                              background: enProgreso
                                ? "rgba(217,119,6,0.08)"
                                : "rgba(255,255,255,0.03)",
                              border: enProgreso
                                ? "1px solid rgba(217,119,6,0.3)"
                                : "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                              style={{
                                background: enProgreso
                                  ? "linear-gradient(180deg, #f59e0b, #d97706)"
                                  : "rgba(255,255,255,0.1)",
                              }}
                            />
                            <div className="pl-3">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p
                                    className="text-2xl font-black text-white mb-0.5"
                                    style={{ fontFamily: "'Georgia', serif" }}
                                  >
                                    {formatearHora(cita.inicio_esperado)}
                                  </p>
                                  <p className="text-zinc-300 font-semibold text-sm capitalize">
                                    {cita.cliente_nombre}
                                  </p>
                                </div>
                                <span
                                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                                  style={{
                                    background: enProgreso
                                      ? "rgba(217,119,6,0.15)"
                                      : "rgba(255,255,255,0.06)",
                                    color: enProgreso ? "#f59e0b" : "#666",
                                  }}
                                >
                                  {enProgreso ? "En corte" : "Agendada"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-xs font-mono px-2 py-1 rounded-lg"
                                  style={{ background: "rgba(0,0,0,0.3)", color: "#555" }}
                                >
                                  #{cita.codigo_verificacion}
                                </span>
                                {cita.estado === "AGENDADA" && (
                                  <button
                                    onClick={() => cambiarEstado(cita.id, "EN_PROGRESO")}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black active:scale-95 transition-transform"
                                    style={{
                                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                      boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                                    }}
                                  >
                                    <LuPlay className="text-xs" />
                                    Iniciar corte
                                  </button>
                                )}
                                {cita.estado === "EN_PROGRESO" && (
                                  <button
                                    onClick={() => cambiarEstado(cita.id, "FINALIZADA")}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black active:scale-95 transition-transform"
                                    style={{
                                      background: "linear-gradient(135deg, #4ade80, #16a34a)",
                                      boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                                    }}
                                  >
                                    <LuCircleCheck className="text-xs" />
                                    Finalizar
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

                {/* Historial General Paginado */}
                {historialCargado && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <LuUsers className="text-zinc-600 text-sm" />
                      <h2 className="text-sm font-bold text-zinc-600 uppercase tracking-widest">
                        Historial de Cortes
                      </h2>
                    </div>

                    {historial.length === 0 ? (
                      <div
                        className="p-6 rounded-2xl text-center"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <LuUsers className="text-zinc-700 text-2xl mx-auto mb-2" />
                        <p className="text-zinc-600 text-sm">Sin cortes finalizados aún.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {historial.map((cita) => (
                            <div
                              key={cita.id}
                              className="flex items-center justify-between px-4 py-3 rounded-2xl"
                              style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                                  style={{ background: "rgba(74,222,128,0.1)" }}
                                >
                                  <LuCircleCheck className="text-green-500 text-sm" />
                                </div>
                                <div>
                                  <p className="text-zinc-400 text-sm font-semibold capitalize">
                                    {cita.cliente_nombre}
                                  </p>
                                  <p className="text-zinc-700 text-xs">
                                    {formatearHora(cita.inicio_esperado)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-green-600 font-bold">Listo</span>
                            </div>
                          ))}
                        </div>

                        {/* Botón "Ver más" — reemplaza IonInfiniteScroll */}
                        {hayMasCitas ? (
                          <button
                            onClick={() => cargarHistorial(paginaActual + 1, true)}
                            disabled={cargandoMas}
                            className="w-full mt-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)",
                              color: "#666",
                            }}
                          >
                            {cargandoMas ? "Cargando..." : `Ver más · ${paginaActual} / ${Math.ceil(13 / 5)}`}
                          </button>
                        ) : (
                          <p className="text-center text-zinc-800 text-xs mt-5 tracking-[0.2em] uppercase">
                            — Fin del historial —
                          </p>
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