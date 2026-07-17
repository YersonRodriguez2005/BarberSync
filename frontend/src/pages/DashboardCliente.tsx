import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
  useIonAlert,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import {
  LuCalendarPlus,
  LuClock,
  LuUser,
  LuCalendarDays,
  LuLogOut,
  LuTrash2,
  LuScissors,
  LuHash,
  LuSettings,
  LuCalendarClock,
  LuSparkles,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { citasService } from "../services/citasService";
import { useHistory } from "react-router-dom";

const DashboardCliente: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [ctaHabilitado, setCtaHabilitado] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarCitas = async () => {
    setCargando(true);
    try {
      const citasResponse = await citasService.obtenerMisCitas();
      setCitas(citasResponse);
    } catch (error) {
      console.error("Error al cargar citas", error);
    } finally {
      setCargando(false);
    }
  };

  useIonViewWillEnter(() => {
    setCtaHabilitado(false);
    cargarCitas();
  });

  useIonViewDidEnter(() => {
    setTimeout(() => setCtaHabilitado(true), 350);
  });

  const handleRefresh = async (event: CustomEvent) => {
    await cargarCitas();
    event.detail.complete();
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/login");
  };

  const handleCancelar = (citaId: string) => {
    presentAlert({
      header: "¿Cancelar cita?",
      message: "Esta acción liberará tu espacio y no se puede deshacer.",
      buttons: [
        { text: "Volver", role: "cancel" },
        {
          text: "Sí, cancelar",
          role: "confirm",
          cssClass: "text-red-500 font-bold",
          handler: async () => {
            try {
              setCargando(true);
              await citasService.cancelarCita(citaId);
              presentToast({
                message: "Cita cancelada correctamente",
                duration: 2000,
                color: "dark",
              });
              cargarCitas();
            } catch {
              presentToast({
                message: "Error al cancelar la cita",
                duration: 3000,
                color: "danger",
              });
            } finally {
              setCargando(false);
            }
          },
        },
      ],
    });
  };

  const formatearFecha = (fechaString: string) => {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return new Date(fechaString).toLocaleDateString("es-CO", opciones);
  };

  const formatearHora = (fechaString: string) => {
    return new Date(fechaString).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearFechaCorta = (fechaString: string) => {
    const opciones: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(fechaString).toLocaleDateString("es-CO", opciones);
  };

  const proximaCita = citas.length > 0 ? citas[0] : null;
  const citasFuturas = citas.length > 1 ? citas.slice(1) : [];
  const primerNombre = user?.nombre?.split(" ")[0] ?? "Cliente";

  return (
    <IonPage>
      <IonContent scrollY={true} className="bg-[#0a0a0c]">
        <div className="relative min-h-full flex flex-col pb-36 overflow-x-hidden">
          
          {/* Iluminación Ambiental (Orbes GPU) */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />
          <div className="absolute top-96 -left-20 w-72 h-72 bg-amber-900/10 rounded-full blur-[80px] pointer-events-none" />

          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* ========================================================== */}
          {/* HEADER: Bienvenida y Botones Neumórficos */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 pt-14 pb-6 flex justify-between items-start animate-slide-up">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <LuScissors className="text-amber-400 text-xs animate-pulse" />
                </div>
                <span className="text-amber-400/80 text-[11px] tracking-[0.2em] uppercase font-bold">
                  BarberSync
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight font-serif">
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 capitalize">{primerNombre}</span>
              </h1>
              <p className="text-zinc-500 text-xs mt-1 font-medium">
                {citas.length === 0
                  ? "Sin reservas activas en este momento"
                  : `${citas.length} ${citas.length === 1 ? "reserva activa" : "reservas activas"}`}
              </p>
            </div>

            {/* Controles rápidos con elevación Soft UI */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => history.push("/perfil")}
                aria-label="Perfil y Configuración"
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
          {/* CONTENIDO PRINCIPAL (Skeletons, Empty State o Citas) */}
          {/* ========================================================== */}
          <div className="relative z-10 flex-1 px-6 space-y-6">
            {cargando ? (
              /* Skeletons Neumórficos */
              <div className="space-y-4 animate-pulse">
                <div className="w-full h-64 rounded-3xl bg-zinc-900/60 border border-white/5" />
                <div className="w-full h-20 rounded-2xl bg-zinc-900/40 border border-white/5" />
                <div className="w-full h-20 rounded-2xl bg-zinc-900/30 border border-white/5" />
              </div>
            ) : citas.length === 0 ? (
              
              /* ESTADO VACÍO (Glass Card + Soft UI Icon) */
              <div className="glass-card p-10 flex flex-col items-center justify-center text-center my-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/20 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                  <LuCalendarPlus className="text-amber-500 text-3xl animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 font-serif">
                  Tu agenda está libre
                </h3>
                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                  Reserva tu turno ahora y asegura tu corte sin esperas, filas ni pérdidas de tiempo.
                </p>
              </div>

            ) : (
              <>
                {/* ====================================================== */}
                {/* TARJETA PRÓXIMA CITA (Glassmorphism Premium + Inset) */}
                {/* ====================================================== */}
                <div className="glass-card p-6 relative overflow-hidden border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.1)] animate-slide-up" style={{ animationDelay: "100ms" }}>
                  
                  {/* Resplandor interno de la tarjeta */}
                  <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Cabecera de Tarjeta: Etiqueta y Reloj */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-[0.15em] uppercase px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-sm">
                      <LuSparkles className="text-xs animate-spin-slow" />
                      <span>Próximo Turno</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono bg-black/40 px-3 py-1 rounded-full border border-white/5">
                      <LuClock className="text-amber-500" />
                      <span>Confirmada</span>
                    </div>
                  </div>

                  {/* Fecha y Hora Principal */}
                  <div className="mb-6">
                    <p className="text-white text-xl sm:text-2xl font-black capitalize leading-tight mb-2 font-serif">
                      {formatearFecha(proximaCita.inicio_esperado)}
                    </p>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 tracking-tight">
                        {formatearHora(proximaCita.inicio_esperado)}
                      </span>
                      <div className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium bg-zinc-800/80 px-3 py-1 rounded-xl border border-white/5">
                        <LuUser className="text-amber-400 text-sm" />
                        <span className="capitalize">{proximaCita.peluquero_nombre}</span>
                      </div>
                    </div>
                  </div>

                  {/* CÓDIGO DE TURNO (Hundido en Soft UI Inset para contraste digital) */}
                  <div className="p-4 rounded-2xl bg-[#0d0d11] border border-zinc-800/80 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <LuHash className="text-amber-500 text-xs" />
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                          Código de Verificación
                        </span>
                      </div>
                      <p className="text-white text-2xl sm:text-3xl font-black tracking-[0.25em] font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                        {proximaCita.codigo_verificacion}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <LuScissors className="text-amber-400 text-2xl" />
                    </div>
                  </div>

                  {/* Botones de Acción (Neumorfismo Suave) */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => history.push(`/reagendar`, { cita: proximaCita })}
                      className="flex items-center justify-center gap-2 h-12 rounded-2xl text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 active:bg-amber-500/20 active:scale-[0.98] transition-all shadow-md"
                    >
                      <LuCalendarClock className="text-base" />
                      <span>Reagendar</span>
                    </button>

                    <button
                      onClick={() => handleCancelar(proximaCita.id)}
                      className="flex items-center justify-center gap-2 h-12 rounded-2xl text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/20 bg-rose-500/10 active:bg-rose-500/20 active:scale-[0.98] transition-all shadow-md"
                    >
                      <LuTrash2 className="text-base" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>

                {/* ====================================================== */}
                {/* CITAS FUTURAS (Lista en Glass Pills) */}
                {/* ====================================================== */}
                {citasFuturas.length > 0 && (
                  <div className="space-y-3 pt-2 animate-slide-up" style={{ animationDelay: "200ms" }}>
                    <div className="flex items-center gap-2 px-1">
                      <LuCalendarDays className="text-amber-500 text-base" />
                      <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                        Otras reservas programadas
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {citasFuturas.map((cita) => (
                        <div
                          key={cita.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-lg transition-all hover:border-white/10"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <LuScissors className="text-amber-400 text-base" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold capitalize">
                                {formatearFechaCorta(cita.inicio_esperado)}
                              </p>
                              <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1 font-medium">
                                <LuUser className="text-amber-500/80 text-xs" />
                                <span>{cita.peluquero_nombre}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs font-black tracking-wider px-2.5 py-1.5 rounded-lg font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                              {cita.codigo_verificacion}
                            </span>

                            <button
                              onClick={() => history.push(`/reagendar`, { cita })}
                              aria-label="Reagendar"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800/80 text-amber-400 active:scale-95 active:bg-zinc-700 transition-all"
                            >
                              <LuCalendarClock className="text-base" />
                            </button>

                            <button
                              onClick={() => handleCancelar(cita.id)}
                              aria-label="Cancelar"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800/80 text-rose-400 active:scale-95 active:bg-rose-950/40 transition-all"
                            >
                              <LuTrash2 className="text-base" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ========================================================== */}
          {/* BOTTOM CTA FIJO (Barra de Vidrio Esmerilado Difuminado) */}
          {/* ========================================================== */}
          <div className="fixed bottom-0 left-0 right-0 p-6 pt-8 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent backdrop-blur-sm z-30">
            <button
              onClick={() => history.replace("/agendar")}
              disabled={!ctaHabilitado}
              className="soft-btn-primary h-14 shadow-2xl"
            >
              <span className="text-sm font-extrabold tracking-wider uppercase">
                Agendar nuevo corte
              </span>
              <div className="bg-black/20 rounded-xl p-2 transition-transform duration-200 group-hover:scale-105">
                <LuCalendarPlus className="text-lg" />
              </div>
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default DashboardCliente;