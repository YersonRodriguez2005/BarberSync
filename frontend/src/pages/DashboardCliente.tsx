import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
  useIonAlert,
  useIonToast,
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
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { citasService } from "../services/citasService";
import { useHistory } from "react-router-dom";

const DashboardCliente: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

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
    cargarCitas();
  });

  const handleRefresh = async (event: CustomEvent) => {
    await cargarCitas();
    event.detail.complete();
  };

  const handleLogout = () => {
    logout();
    history.push("/login");
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
      <IonContent scrollY={true}>
        <div
          className="min-h-full flex flex-col"
          style={{
            background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)",
          }}
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
                  BarberSync
                </span>
              </div>
              <h1
                className="text-3xl font-black text-white leading-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Hola,{" "}
                <span className="text-amber-500 capitalize">
                  {primerNombre}
                </span>
              </h1>
              <p className="text-zinc-600 text-xs mt-0.5">
                {citas.length === 0
                  ? "Sin reservas activas"
                  : `${citas.length} ${citas.length === 1 ? "reserva" : "reservas"} activa${citas.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {/* Boton de configuración usuario */}
            <button
              onClick={() => history.push("/perfil")}
              className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 active:text-amber-500 transition-colors"
            >
              <LuSettings className="text-xl" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500 active:border-red-900 active:text-red-400 transition-colors"
            >
              <LuLogOut className="text-base" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-6 pb-32">
            {cargando ? (
              <div className="space-y-4">
                <div
                  className="w-full rounded-3xl bg-zinc-900 animate-pulse"
                  style={{ height: "220px" }}
                />
                <div
                  className="w-full rounded-2xl bg-zinc-900/60 animate-pulse"
                  style={{ height: "80px" }}
                />
                <div
                  className="w-full rounded-2xl bg-zinc-900/40 animate-pulse"
                  style={{ height: "80px" }}
                />
              </div>
            ) : citas.length === 0 ? (
              /* Estado vacío */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800"
                  style={{ background: "rgba(217,119,6,0.08)" }}
                >
                  <LuCalendarPlus className="text-amber-600 text-2xl" />
                </div>
                <h3
                  className="text-xl font-black text-white mb-2"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Sin citas próximas
                </h3>
                <p className="text-zinc-600 text-sm max-w-xs leading-relaxed">
                  Reserva tu turno ahora y asegura tu corte sin esperas ni
                  filas.
                </p>
              </div>
            ) : (
              <>
                {/* Próxima cita - Tarjeta premium */}
                <div
                  className="rounded-3xl overflow-hidden mb-5 relative"
                  style={{
                    background:
                      "linear-gradient(145deg, #1a1209 0%, #0f0a04 100%)",
                    border: "1px solid rgba(217,119,6,0.25)",
                    boxShadow: "0 20px 60px rgba(217,119,6,0.12)",
                  }}
                >
                  {/* Gold accent line top */}
                  <div
                    className="w-full h-0.5"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #d97706, transparent)",
                    }}
                  />

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-5">
                      <span
                        className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border"
                        style={{
                          color: "#d97706",
                          borderColor: "rgba(217,119,6,0.3)",
                          background: "rgba(217,119,6,0.08)",
                        }}
                      >
                        Próxima cita
                      </span>
                      <LuClock className="text-zinc-600 text-base" />
                    </div>

                    <div className="mb-5">
                      <p
                        className="text-white text-xl font-black capitalize leading-tight mb-1"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {formatearFecha(proximaCita.inicio_esperado)}
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-3xl font-black"
                          style={{
                            background:
                              "linear-gradient(135deg, #f59e0b, #d97706)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {formatearHora(proximaCita.inicio_esperado)}
                        </span>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                          <LuUser className="text-xs" />
                          <span className="capitalize">
                            {proximaCita.peluquero_nombre}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Código de turno */}
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <LuHash className="text-amber-600 text-xs" />
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                            Código de turno
                          </p>
                        </div>
                        <p
                          className="text-white text-3xl font-black tracking-[0.25em]"
                          style={{ fontFamily: "monospace" }}
                        >
                          {proximaCita.codigo_verificacion}
                        </p>
                      </div>
                      <LuScissors className="text-zinc-700 text-3xl" />
                    </div>

                    {/* Reagendar */}
                    <button
                      onClick={() =>
                        history.push(`/reagendar`, { cita: proximaCita })
                      }
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-900/50 bg-amber-900/10 active:bg-amber-900/30 transition-colors"
                      style={{ height: "44px" }}
                    >
                      <LuCalendarClock className="text-sm" />
                      Reagendar
                    </button>

                    {/* Cancelar */}
                    <button
                      onClick={() => handleCancelar(proximaCita.id)}
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl text-red-400/80 text-xs font-bold uppercase tracking-wider border border-red-900/30 active:bg-red-950/30 transition-colors"
                      style={{ height: "44px" }}
                    >
                      <LuTrash2 className="text-sm" />
                      Cancelar cita
                    </button>
                  </div>
                </div>

                {/* Citas futuras */}
                {citasFuturas.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <LuCalendarDays className="text-amber-600 text-sm" />
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                        Próximas reservas
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {citasFuturas.map((cita) => (
                        <div
                          key={cita.id}
                          className="flex items-center justify-between p-4 rounded-2xl"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(217,119,6,0.1)" }}
                            >
                              <LuScissors className="text-amber-600 text-sm" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold capitalize">
                                {formatearFechaCorta(cita.inicio_esperado)}
                              </p>
                              <p className="text-zinc-600 text-xs mt-0.5 flex items-center gap-1">
                                <LuUser className="text-xs" />
                                {cita.peluquero_nombre}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className="text-xs font-black tracking-wider px-2 py-1 rounded-lg"
                              style={{
                                fontFamily: "monospace",
                                color: "#d97706",
                                background: "rgba(217,119,6,0.1)",
                              }}
                            >
                              {cita.codigo_verificacion}
                            </span>

                            <button
                              onClick={() =>
                                history.push(`/reagendar`, { cita })
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-amber-600 active:text-amber-400 active:bg-amber-950/30 transition-colors"
                            >
                              <LuCalendarClock className="text-sm" />
                            </button>

                            <button
                              onClick={() => handleCancelar(cita.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-600 active:text-red-400 active:bg-red-950/30 transition-colors"
                            >
                              <LuTrash2 className="text-sm" />
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

          {/* Bottom CTA — Fijo */}
          <div
            className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4"
            style={{
              background: "linear-gradient(to top, #0a0a0a 70%, transparent)",
            }}
          >
            <button
              onClick={() => history.push("/agendar")}
              className="w-full flex items-center justify-between px-6 rounded-2xl font-bold text-black active:scale-95 transition-transform"
              style={{
                height: "58px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 8px 32px rgba(217,119,6,0.4)",
              }}
            >
              <span className="text-sm tracking-wide">Agendar nuevo corte</span>
              <div className="bg-black/15 rounded-xl p-1.5">
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
