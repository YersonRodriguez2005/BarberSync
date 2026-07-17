import React, { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { LuScissors, LuLock, LuMail, LuChevronRight, LuLoader } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const resp = await api.post("/login", { email, password });
      const { token, user } = resp.data;
      login(token, user);
      const destino = user.rol === "PELUQUERO" ? "/dashboard-peluquero" : "/dashboard-cliente";
      
      window.location.replace(destino);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensajeError = error.response?.data?.message || "Error al iniciar sesión. Verifique sus credenciales.";
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} className="bg-[#0a0a0c]">
        <div className="relative flex flex-col min-h-full px-6 pt-14 pb-8 overflow-hidden">
          
          {/* Luz ambiental de fondo (GPU accelerated glowing orb) */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/15 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-900/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Barra superior de marca con efecto vidrio */}
          <div className="relative z-10 flex items-center gap-3 mb-12 animate-slide-up">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-amber-500/20" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <LuScissors className="text-amber-400 text-sm animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
                BarberSync
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-700/40 to-amber-500/20" />
          </div>

          {/* Texto Hero */}
          <div className="relative z-10 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-2 tracking-tight font-serif">
              Bienvenido <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                de vuelta.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Tu tiempo es sagrado. Tu corte, también.
            </p>
          </div>

          {/* Formulario en Tarjeta Glassmorphism */}
          <div className="relative z-10 glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="soft-input-container h-14">
                <LuMail className="text-amber-500 text-lg flex-shrink-0 transition-transform duration-200 group-focus-within:scale-110" />
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  className="w-full bg-transparent outline-none text-white placeholder-zinc-500 text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="soft-input-container h-14">
                <LuLock className="text-amber-500 text-lg flex-shrink-0 transition-transform duration-200 group-focus-within:scale-110" />
                <input
                  type="password"
                  required
                  placeholder="Contraseña"
                  className="w-full bg-transparent outline-none text-white placeholder-zinc-500 text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="soft-btn-primary h-14"
                >
                  <span className="text-sm font-extrabold tracking-wider uppercase">
                    {loading ? "Verificando..." : "Ingresar"}
                  </span>
                  <div className="bg-black/20 rounded-xl p-2 transition-transform duration-200 group-hover:translate-x-1">
                    {loading ? (
                      <LuLoader className="text-lg animate-spin" />
                    ) : (
                      <LuChevronRight className="text-lg" />
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Divisor Neumórfico */}
          <div className="relative z-10 flex items-center gap-4 my-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
            <span className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">ó</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
          </div>

          {/* Enlace a Registro (Glass Pill) */}
          <div className="relative z-10 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <button
              type="button"
              onClick={() => history.push("/register")}
              className="glass-pill-btn w-full h-14"
            >
              <span>¿Sin cuenta?</span>
              <span className="text-amber-400 font-bold ml-1 underline decoration-amber-500/30 underline-offset-4">
                Regístrate gratis
              </span>
            </button>
          </div>

          {/* Pie de página */}
          <p className="relative z-10 text-center text-zinc-600 text-[11px] mt-auto pt-6 tracking-[0.2em] uppercase font-mono animate-slide-up" style={{ animationDelay: "500ms" }}>
            Est. 2024 · Premium Grooming
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;