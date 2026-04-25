import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  LuUser,
  LuCalendarDays,
  LuClock,
  LuChevronLeft,
  LuScissors,
  LuChevronRight,
  LuCoffee,
} from "react-icons/lu";
import { useHistory } from "react-router-dom";
import { citasService } from "../services/citasService";
import { NotificationService } from "../services/notificationService";
import { usuariosService } from "../services/usuariosService";

const AgendarCita: React.FC = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [peluqueros, setPeluqueros] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [peluqueroSel, setPeluqueroSel] = useState<any>(null);
  const [fechaSel, setFechaSel] = useState<Date | null>(null);
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

  // NUEVOS ESTADOS PARA HORARIO DINÁMICO
  const [diaLaboral, setDiaLaboral] = useState<boolean>(true);
  const [horarioApertura, setHorarioApertura] = useState<string>("10:00");
  const [horarioCierre, setHorarioCierre] = useState<string>("20:00");

  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [cargando, setCargando] = useState(false);

  // LÓGICA DINÁMICA DE HORAS
  const generarHorasDisponibles = () => {
    if (!diaLaboral) return [];

    const horas = [];
    const [aperturaH, aperturaM] = horarioApertura.split(":").map(Number);
    const [cierreH, cierreM] = horarioCierre.split(":").map(Number);
    const intervaloMinutos = 10;

    let tiempoActual = aperturaH * 60 + aperturaM;
    const tiempoCierre = cierreH * 60 + cierreM;
    const ultimoTurnoPosible = tiempoCierre - 30; // Restamos 30 min del cierre

    while (tiempoActual <= ultimoTurnoPosible) {
      const hStr = String(Math.floor(tiempoActual / 60)).padStart(2, "0");
      const mStr = String(tiempoActual % 60).padStart(2, "0");
      horas.push(`${hStr}:${mStr}`);
      tiempoActual += intervaloMinutos;
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
      const [h, m] = hora.split(":").map(Number);
      return h * 60 + m > ahora.getHours() * 60 + ahora.getMinutes();
    });
  })();

  useIonViewWillEnter(() => {
    const cargarDatos = async () => {
      try {
        const data = await usuariosService.obtenerPeluqueros();
        setPeluqueros(data);
      } catch (error) {
        console.error("Error cargando peluqueros", error);
      }
    };
    cargarDatos();
  });

  useEffect(() => {
    if (peluqueroSel && fechaSel) {
      const consultarDisponibilidad = async () => {
        setCargandoHoras(true);
        setHoraSel(null);
        try {
          const year = fechaSel.getFullYear();
          const month = String(fechaSel.getMonth() + 1).padStart(2, "0");
          const day = String(fechaSel.getDate()).padStart(2, "0");
          const fechaString = `${year}-${month}-${day}`;

          const data = await citasService.obtenerDisponibilidad(
            peluqueroSel.id,
            fechaString,
          );

          if (Array.isArray(data)) {
            setDiaLaboral(true);
            setHorasOcupadas(data);
          } else if (data && typeof data === "object") {
            setDiaLaboral(data.trabaja);
            if (data.trabaja) {
              setHorarioApertura(data.apertura);
              setHorarioCierre(data.cierre);
              setHorasOcupadas(data.ocupadas || []);
            } else {
              setHorasOcupadas([]);
            }
          } else {
            setHorasOcupadas([]);
          }
        } catch (error) {
          console.error("Error consultando disponibilidad", error);
          setHorasOcupadas([]);
        } finally {
          setCargandoHoras(false);
        }
      };
      consultarDisponibilidad();
    }
  }, [peluqueroSel, fechaSel]);

  const proximosDias = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatearDia = (fecha: Date) => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return { nombre: dias[fecha.getDay()], numero: fecha.getDate() };
  };

  const puedeAgendar = peluqueroSel && fechaSel && horaSel && diaLaboral;

  const handleAgendar = async () => {
    if (!puedeAgendar) return;
    setCargando(true);
    try {
      // FIX: Construir el string de fecha en hora local, NO con toISOString()
      const year = fechaSel!.getFullYear();
      const month = String(fechaSel!.getMonth() + 1).padStart(2, "0");
      const day = String(fechaSel!.getDate()).padStart(2, "0");
      const [horas, minutos] = horaSel!.split(":");

      // Formato ISO local sin conversión UTC: "2025-04-25T10:00:00"
      const inicioString = `${year}-${month}-${day}T${horas}:${minutos}:00`;

      // Calcular fin sumando 30 min al string, no al objeto Date
      const minutosTotal = parseInt(horas) * 60 + parseInt(minutos) + 30;
      const finH = String(Math.floor(minutosTotal / 60)).padStart(2, "0");
      const finM = String(minutosTotal % 60).padStart(2, "0");
      const finString = `${year}-${month}-${day}T${finH}:${finM}:00`;

      await NotificationService.requestPermission();
      const res = await citasService.agendarCita({
        peluquero_id: peluqueroSel.id,
        inicio_esperado: inicioString, // "2025-04-25T10:00:00" sin Z
        fin_esperado: finString,
      });

      if (res.cita) {
        await NotificationService.scheduleReminder(
          res.cita.id,
          new Date(res.cita.inicio_esperado),
          res.cita.codigo_verificacion,
        );
      }

      presentToast({
        message: "¡Cita agendada con éxito!",
        duration: 3000,
        color: "success",
        position: "top",
      });
      history.push("/dashboard-cliente");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        "Error al agendar el turno. Intenta de nuevo.";
      presentToast({ message: mensaje, duration: 4000, color: "danger" });
    } finally {
      setCargando(false);
    }
  };

  const paso = !peluqueroSel ? 1 : !fechaSel ? 2 : 3;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          className="min-h-full flex flex-col"
          style={{
            background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)",
          }}
        >
          {/* Header */}
          <div className="px-6 pt-14 pb-6 flex items-center gap-4">
            <button
              onClick={() => history.push("/dashboard-cliente")}
              className="w-10 h-10 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 active:text-amber-500 transition-colors flex-shrink-0"
            >
              <LuChevronLeft className="text-lg" />
            </button>
            <div>
              <h1
                className="text-2xl font-black text-white leading-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Nueva Cita
              </h1>
              <p className="text-zinc-600 text-xs">Paso {paso} de 3</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 mb-8">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(paso / 3) * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b, #d97706)",
                }}
              />
            </div>
          </div>

          <div className="px-6 pb-36 space-y-10">
            {/* PASO 1: Peluquero */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{
                    background:
                      paso >= 1
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : "rgba(255,255,255,0.05)",
                    color: paso >= 1 ? "#000" : "#555",
                  }}
                >
                  1
                </div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <LuUser className="text-amber-500 text-sm" />
                  ¿Con quién?
                </h2>
              </div>

              <div
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {peluqueros.map((pel) => {
                  const seleccionado = peluqueroSel?.id === pel.id;
                  return (
                    <div
                      key={pel.id}
                      onClick={() => setPeluqueroSel(pel)}
                      className="flex-shrink-0 w-28 p-4 rounded-2xl text-center transition-all active:scale-95 cursor-pointer"
                      style={{
                        background: seleccionado
                          ? "rgba(217,119,6,0.12)"
                          : "rgba(255,255,255,0.03)",
                        border: seleccionado
                          ? "1.5px solid rgba(217,119,6,0.5)"
                          : "1.5px solid rgba(255,255,255,0.06)",
                        boxShadow: seleccionado
                          ? "0 4px 20px rgba(217,119,6,0.15)"
                          : "none",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{
                          background: seleccionado
                            ? "rgba(217,119,6,0.2)"
                            : "rgba(255,255,255,0.05)",
                        }}
                      >
                        <LuScissors
                          className={`text-xl ${
                            seleccionado ? "text-amber-500" : "text-zinc-600"
                          }`}
                        />
                      </div>
                      <p
                        className={`font-bold text-xs leading-tight ${
                          seleccionado ? "text-amber-400" : "text-zinc-400"
                        }`}
                      >
                        {pel.nombre}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PASO 2: Fecha */}
            <section
              className={!peluqueroSel ? "opacity-30 pointer-events-none" : ""}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{
                    background:
                      paso >= 2
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : "rgba(255,255,255,0.05)",
                    color: paso >= 2 ? "#000" : "#555",
                  }}
                >
                  2
                </div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <LuCalendarDays className="text-amber-500 text-sm" />
                  Elige la fecha
                </h2>
              </div>

              <div
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {proximosDias.map((dia, idx) => {
                  const { nombre, numero } = formatearDia(dia);
                  const seleccionado =
                    fechaSel?.getDate() === dia.getDate() &&
                    fechaSel?.getMonth() === dia.getMonth();
                  return (
                    <div
                      key={idx}
                      onClick={() => setFechaSel(dia)}
                      className="flex-shrink-0 w-16 py-4 rounded-2xl text-center transition-all active:scale-95 cursor-pointer"
                      style={{
                        background: seleccionado
                          ? "linear-gradient(145deg, #f59e0b, #d97706)"
                          : "rgba(255,255,255,0.03)",
                        border: seleccionado
                          ? "1.5px solid #f59e0b"
                          : "1.5px solid rgba(255,255,255,0.06)",
                        boxShadow: seleccionado
                          ? "0 4px 20px rgba(217,119,6,0.3)"
                          : "none",
                      }}
                    >
                      <p
                        className={`text-xs font-bold uppercase mb-1 ${
                          seleccionado ? "text-black/60" : "text-zinc-600"
                        }`}
                      >
                        {nombre}
                      </p>
                      <p
                        className={`text-xl font-black ${
                          seleccionado ? "text-black" : "text-white"
                        }`}
                      >
                        {numero}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PASO 3: Hora */}
            <section
              className={!fechaSel ? "opacity-30 pointer-events-none" : ""}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{
                      background:
                        paso >= 3
                          ? "linear-gradient(135deg, #f59e0b, #d97706)"
                          : "rgba(255,255,255,0.05)",
                      color: paso >= 3 ? "#000" : "#555",
                    }}
                  >
                    3
                  </div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <LuClock className="text-amber-500 text-sm" />
                    Hora exacta
                  </h2>
                </div>
                {cargandoHoras && (
                  <span className="text-amber-500 text-xs animate-pulse font-medium">
                    Consultando...
                  </span>
                )}
              </div>

              {!diaLaboral ? (
                <div
                  className="p-6 rounded-2xl text-center text-sm font-medium flex flex-col items-center justify-center gap-3"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                    color: "#888",
                  }}
                >
                  <LuCoffee className="text-3xl text-zinc-600" />
                  El peluquero descansa este día.
                </div>
              ) : horasVisibles.length === 0 && fechaSel ? (
                <div
                  className="p-4 rounded-2xl text-center text-sm font-medium"
                  style={{
                    background: "rgba(217,119,6,0.08)",
                    border: "1px solid rgba(217,119,6,0.2)",
                    color: "#d97706",
                  }}
                >
                  No hay horarios disponibles para hoy. Selecciona otra fecha.
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
                          background: ocupada
                            ? "rgba(255,255,255,0.02)"
                            : seleccionada
                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                            : "rgba(255,255,255,0.04)",
                          border: ocupada
                            ? "1px solid rgba(255,255,255,0.04)"
                            : seleccionada
                            ? "1px solid #f59e0b"
                            : "1px solid rgba(255,255,255,0.08)",
                          color: ocupada
                            ? "#333"
                            : seleccionada
                            ? "#000"
                            : "#aaa",
                          textDecoration: ocupada ? "line-through" : "none",
                          boxShadow: seleccionada
                            ? "0 4px 16px rgba(217,119,6,0.3)"
                            : "none",
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

          {/* CTA fijo */}
          <div
            className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4"
            style={{
              background: "linear-gradient(to top, #0a0a0a 70%, transparent)",
            }}
          >
            {/* Resumen de selección */}
            {puedeAgendar && (
              <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl mb-3"
                style={{
                  background: "rgba(217,119,6,0.08)",
                  border: "1px solid rgba(217,119,6,0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <LuScissors className="text-amber-500 text-sm" />
                  <span className="text-amber-400 text-xs font-medium capitalize">
                    {peluqueroSel?.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LuCalendarDays className="text-zinc-500 text-sm" />
                  <span className="text-zinc-400 text-xs">
                    {fechaSel?.getDate()}/{(fechaSel?.getMonth() ?? 0) + 1} ·{" "}
                    {horaSel}
                  </span>
                </div>
              </div>
            )}

            <button
              disabled={!puedeAgendar || cargando}
              onClick={handleAgendar}
              className="w-full flex items-center justify-between px-6 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{
                height: "58px",
                background: puedeAgendar
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "rgba(255,255,255,0.05)",
                color: puedeAgendar ? "#000" : "#444",
                boxShadow: puedeAgendar
                  ? "0 8px 32px rgba(217,119,6,0.4)"
                  : "none",
              }}
            >
              <span className="text-sm tracking-wide">
                {cargando ? "Procesando..." : "Confirmar Turno"}
              </span>
              {puedeAgendar && !cargando && (
                <div className="bg-black/15 rounded-xl p-1.5">
                  <LuChevronRight className="text-lg" />
                </div>
              )}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AgendarCita;
