import React, { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { LuScissors, LuLock, LuMail, LuChevronRight } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

const handleLogin = async () => {
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
    const mensajeError = error.response?.data?.message || "Error al iniciar sesión";
    alert(mensajeError);
  } finally {
    setLoading(false);
  }
};

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div
          className="flex flex-col min-h-full px-6 pt-16 pb-10"
          style={{ background: "linear-gradient(160deg, #0a0a0a 60%, #1a1209 100%)" }}
        >
          {/* Decorative top bar */}
          <div className="flex items-center gap-2 mb-16">
            <div className="h-px flex-1 bg-amber-700/30" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-700/40">
              <LuScissors className="text-amber-500 text-xs" />
              <span className="text-amber-500/80 text-xs font-semibold tracking-[0.2em] uppercase">
                BarberSync
              </span>
            </div>
            <div className="h-px flex-1 bg-amber-700/30" />
          </div>

          {/* Hero text */}
          <div className="mb-12">
            <h1
              className="text-5xl font-black text-white leading-none mb-3"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: "-1px" }}
            >
              Bienvenido
              <br />
              <span
                className="text-transparent"
                style={{
                  WebkitTextStroke: "1px rgba(217,119,6,0.6)",
                }}
              >
                de vuelta.
              </span>
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Tu tiempo es sagrado. Tu corte, también.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3 mb-6">
            <div
              className="flex items-center gap-3 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur"
              style={{ height: "58px" }}
            >
              <LuMail className="text-amber-600 text-base flex-shrink-0" />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full bg-transparent outline-none text-white placeholder-zinc-600 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div
              className="flex items-center gap-3 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur"
              style={{ height: "58px" }}
            >
              <LuLock className="text-amber-600 text-base flex-shrink-0" />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full bg-transparent outline-none text-white placeholder-zinc-600 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-between px-6 rounded-2xl font-bold text-black active:scale-95 transition-transform disabled:opacity-60"
            style={{
              height: "58px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 8px 32px rgba(217,119,6,0.35)",
            }}
          >
            <span className="text-sm tracking-wide">
              {loading ? "Ingresando..." : "Ingresar"}
            </span>
            <div className="bg-black/15 rounded-xl p-1.5">
              <LuChevronRight className="text-lg" />
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600 text-xs">ó</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Register link */}
          <button
            onClick={() => history.push("/register")}
            className="w-full flex items-center justify-center gap-2 border border-zinc-800 rounded-2xl text-zinc-400 text-sm font-medium active:bg-zinc-900 transition-colors"
            style={{ height: "52px" }}
          >
            ¿Sin cuenta?{" "}
            <span className="text-amber-500 font-bold">Regístrate gratis</span>
          </button>

          {/* Bottom decorative text */}
          <p className="text-center text-zinc-700 text-xs mt-auto pt-8 tracking-widest uppercase">
            Est. 2024 · Premium Grooming
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;