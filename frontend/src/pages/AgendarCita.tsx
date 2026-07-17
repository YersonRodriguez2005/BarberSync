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
  LuLoader,
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
    const ultimoTurnoPosible = tiempoCierre - 10; 

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
      const year = fechaSel!.getFullYear();
      const month = String(fechaSel!.getMonth() + 1).padStart(2, "0");
      const day = String(fechaSel!.getDate()).padStart(2, "0");
      const [horas, minutos] = horaSel!.split(":");

      const inicioString = `${year}-${month}-${day}T${horas}:${minutos}:00`;

      const minutosTotal = parseInt(horas) * 60 + parseInt(minutos) + 10;
      const finH = String(Math.floor(minutosTotal / 60)).padStart(2, "0");
      const finM = String(minutosTotal % 60).padStart(2, "0");
      const finString = `${year}-${month}-${day}T${finH}:${finM}:00`;

      await NotificationService.requestPermission();
      const res = await citasService.agendarCita({
        peluquero_id: peluqueroSel.id,
        inicio_esperado: inicioString,
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
      history.replace("/dashboard-cliente");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensaje = error.response?.data?.message || "Error al agendar el turno. Intenta de nuevo.";
      presentToast({ message: mensaje, duration: 4000, color: "danger" });
    } finally {
      setCargando(false);
    }
  };

  const paso = !peluqueroSel ? 1 : !fechaSel ? 2 : 3;

  return (
    <IonPage>
      <IonContent scrollY={true} className="bg-[#0a0a0c]">
        <div className="relative min-h-full flex flex-col overflow-x-hidden">
          
          {/* Luces Ambientales (Orbes GPU) */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />
          <div className="absolute top-[40%] -left-20 w-72 h-72 bg-zinc-600/5 rounded-full blur-[80px] pointer-events-none" />

          {/* ========================================================== */}
          {/* HEADER Y NAVEGACIÓN */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 pt-14 pb-6 flex items-center gap-4 animate-slide-up">
            <button
              onClick={() => history.replace('/dashboard-cliente')}
              className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800/80 bg-[#121215] text-zinc-400 active:scale-95 active:text-amber-400 transition-all shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] flex-shrink-0"
            >
              <LuChevronLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight font-serif tracking-tight">
                Nueva Cita
              </h1>
              <p className="text-amber-500/80 font-bold text-xs uppercase tracking-widest mt-1">
                Paso {paso} de 3
              </p>
            </div>
          </div>

          {/* Barra de Progreso Neumórfica (Inset shadow) */}
          <div className="relative z-10 px-6 mb-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="h-1.5 bg-[#121215] rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                style={{
                  width: `${(paso / 3) * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b, #d97706)",
                }}
              />
            </div>
          </div>

          <div className="relative z-10 pb-44 space-y-10">
            {/* ========================================================== */}
            {/* PASO 1: SELECCIÓN DE PELUQUERO */}
            {/* ========================================================== */}
            <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="px-6 flex items-center gap-3 mb-5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-md ${paso >= 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                  1
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LuUser className="text-amber-500" /> ¿Con quién?
                </h2>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {peluqueros.map((pel) => {
                  const seleccionado = peluqueroSel?.id === pel.id;
                  return (
                    <div
                      key={pel.id}
                      onClick={() => setPeluqueroSel(pel)}
                      className={`snap-center flex-shrink-0 w-32 p-4 rounded-3xl text-center transition-all duration-300 cursor-pointer ${
                        seleccionado 
                          ? "bg-amber-500/10 border border-amber-500/40 shadow-[0_10px_25px_rgba(217,119,6,0.15)] scale-100" 
                          : "bg-zinc-900/40 border border-white/5 backdrop-blur-sm active:scale-95 scale-95 opacity-80"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] ${
                        seleccionado ? "bg-amber-500/20 text-amber-400" : "bg-[#121215] text-zinc-600"
                      }`}>
                        <LuScissors className="text-2xl" />
                      </div>
                      <p className={`font-bold text-sm leading-tight capitalize ${seleccionado ? "text-amber-400" : "text-zinc-400"}`}>
                        {pel.nombre}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ========================================================== */}
            {/* PASO 2: SELECCIÓN DE FECHA */}
            {/* ========================================================== */}
            <section className={`animate-slide-up transition-opacity duration-500 ${!peluqueroSel ? "opacity-30 pointer-events-none grayscale" : ""}`} style={{ animationDelay: '200ms' }}>
              <div className="px-6 flex items-center gap-3 mb-5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-md ${paso >= 2 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                  2
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LuCalendarDays className="text-amber-500" /> Elige la fecha
                </h2>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {proximosDias.map((dia, idx) => {
                  const { nombre, numero } = formatearDia(dia);
                  const seleccionado = fechaSel?.getDate() === dia.getDate() && fechaSel?.getMonth() === dia.getMonth();
                  return (
                    <div
                      key={idx}
                      onClick={() => setFechaSel(dia)}
                      className={`snap-center flex-shrink-0 w-20 py-4 rounded-3xl text-center transition-all duration-300 cursor-pointer ${
                        seleccionado
                          ? "bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-400 shadow-[0_8px_20px_rgba(217,119,6,0.3)] scale-100"
                          : "bg-[#121215] border border-zinc-800/80 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] scale-95 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase mb-1 ${seleccionado ? "text-amber-950" : "text-zinc-500"}`}>
                        {nombre}
                      </p>
                      <p className={`text-2xl font-black ${seleccionado ? "text-black" : "text-white"}`}>
                        {numero}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ========================================================== */}
            {/* PASO 3: SELECCIÓN DE HORA */}
            {/* ========================================================== */}
            <section className={`px-6 animate-slide-up transition-opacity duration-500 ${!fechaSel ? "opacity-30 pointer-events-none grayscale" : ""}`} style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-md ${paso >= 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    3
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <LuClock className="text-amber-500" /> Hora exacta
                  </h2>
                </div>
                {cargandoHoras && (
                  <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <LuLoader className="animate-spin text-sm" /> Buscando...
                  </div>
                )}
              </div>

              {!diaLaboral ? (
                <div className="glass-card p-8 text-center border-dashed border-2 border-zinc-800/80 bg-zinc-900/20">
                  <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                    <LuCoffee className="text-3xl text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">El peluquero descansa este día.<br/>Por favor, selecciona otra fecha.</p>
                </div>
              ) : horasVisibles.length === 0 && fechaSel ? (
                <div className="glass-card p-6 text-center border-amber-500/30 bg-amber-500/5">
                  <p className="text-amber-500 text-sm font-bold">No hay horarios disponibles para hoy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {horasVisibles.map((hora) => {
                    const ocupada = horasOcupadas.includes(hora);
                    const seleccionada = horaSel === hora;

                    return (
                      <button
                        key={hora}
                        disabled={ocupada}
                        onClick={() => setHoraSel(hora)}
                        className={`py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                          ocupada
                            ? "bg-zinc-900/30 border border-transparent text-zinc-700 line-through cursor-not-allowed opacity-50"
                            : seleccionada
                            ? "bg-gradient-to-r from-amber-400 to-amber-600 border border-amber-400 text-black shadow-[0_4px_15px_rgba(217,119,6,0.3)] scale-105"
                            : "bg-[#121215] border border-zinc-800/80 text-zinc-300 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] active:scale-95 hover:border-zinc-600"
                        }`}
                      >
                        {hora}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ========================================================== */}
          {/* BOTTOM CTA FIJO (Resumen y Confirmación) */}
          {/* ========================================================== */}
          <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent backdrop-blur-sm z-30 transition-transform duration-300 translate-y-0">
            
            {/* Resumen de Selección Dinámico (Glass Card compacta) */}
            {puedeAgendar && (
              <div className="glass-card mb-4 p-3.5 flex items-center justify-between border-amber-500/30 bg-amber-500/10 animate-slide-up shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <LuScissors className="text-amber-400 text-sm" />
                  </div>
                  <span className="text-amber-400 text-sm font-bold capitalize">
                    {peluqueroSel?.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-amber-500/80 text-xs font-mono font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <LuCalendarDays className="text-sm" />
                  <span>
                    {fechaSel?.getDate()}/{(fechaSel?.getMonth() ?? 0) + 1} · {horaSel}
                  </span>
                </div>
              </div>
            )}

            <button
              disabled={!puedeAgendar || cargando}
              onClick={handleAgendar}
              className="soft-btn-primary h-14 w-full"
            >
              <span className="text-sm font-extrabold tracking-wider uppercase">
                {cargando ? "Asegurando turno..." : "Confirmar Turno"}
              </span>
              {puedeAgendar && !cargando && (
                <div className="bg-black/20 rounded-xl p-2">
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