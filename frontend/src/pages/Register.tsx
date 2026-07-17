import React, { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import {
  LuScissors,
  LuLock,
  LuMail,
  LuUser,
  LuPhone,
  LuChevronRight,
  LuChevronLeft,
  LuLoader,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { login } = useAuth();

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      await api.post("/register", { nombre, email, telefono, password });
      const respLogin = await api.post("/login", { email, password });
      login(respLogin.data.token, respLogin.data.user);
      
      const destino = respLogin.data.user.rol === "PELUQUERO" ? "/dashboard-peluquero" : "/dashboard-cliente";
      window.location.replace(destino);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensajeError = error.response?.data?.message || "Error al registrar usuario. Verifique los datos ingresados.";
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      icon: <LuUser className="text-amber-500 text-lg flex-shrink-0" />,
      type: "text",
      placeholder: "Nombre completo",
      value: nombre,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value),
    },
    {
      icon: <LuMail className="text-amber-500 text-lg flex-shrink-0" />,
      type: "email",
      placeholder: "Correo electrónico",
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    },
    {
      icon: <LuPhone className="text-amber-500 text-lg flex-shrink-0" />,
      type: "tel",
      placeholder: "Teléfono móvil",
      value: telefono,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value),
    },
    {
      icon: <LuLock className="text-amber-500 text-lg flex-shrink-0" />,
      type: "password",
      placeholder: "Contraseña segura",
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    },
  ];

  return (
    <IonPage>
      <IonContent scrollY={true} className="bg-[#0a0a0c]">
        <div className="relative flex flex-col min-h-full px-6 pt-10 pb-8 overflow-hidden">
          
          {/* Luz ambiental de fondo (GPU accelerated glowing orb) */}
          <div className="absolute top-10 -left-20 w-80 h-80 bg-amber-600/10 rounded-full blur-[80px] pointer-events-none animate-glow-pulse" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-amber-900/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Botón Volver (Glass Pill compacta) */}
          <div className="relative z-10 mb-8 animate-slide-up">
            <button
              type="button"
              onClick={() => history.push("/login")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md text-zinc-400 text-xs font-semibold uppercase tracking-wider active:scale-95 hover:text-amber-400 transition-all shadow-lg"
            >
              <LuChevronLeft className="text-base" />
              <span>Volver</span>
            </button>
          </div>

          {/* Cabecera Hero */}
          <div className="relative z-10 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
              <LuScissors className="text-amber-400 text-xs animate-pulse" />
              <span className="text-amber-400 text-[11px] font-bold tracking-[0.2em] uppercase">
                Nueva cuenta
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-2 tracking-tight font-serif">
              Únete a la <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                familia.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Agenda sin filas. Vive sin esperas.
            </p>
          </div>

          {/* Formulario en Tarjeta Glassmorphism */}
          <div className="relative z-10 glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <form onSubmit={handleRegister} className="space-y-3.5">
              {fields.map((field, idx) => (
                <div key={idx} className="soft-input-container h-14">
                  {field.icon}
                  <input
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500 text-sm font-medium"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              ))}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="soft-btn-primary h-14"
                >
                  <span className="text-sm font-extrabold tracking-wider uppercase">
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
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

          {/* Letra pequeña de términos */}
          <p className="relative z-10 text-center text-zinc-500 text-xs leading-relaxed px-4 mb-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            Al registrarte aceptas nuestros{" "}
            <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-2">términos de servicio</span> y{" "}
            <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-2">política de privacidad</span>.
          </p>

          {/* Divisor */}
          <div className="relative z-10 flex items-center gap-4 my-2 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
            <span className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">¿Ya tienes cuenta?</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
          </div>

          {/* Botón de Iniciar Sesión (Glass Pill) */}
          <div className="relative z-10 mt-4 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <button
              type="button"
              onClick={() => history.push("/login")}
              className="glass-pill-btn w-full h-14"
            >
              <span className="text-zinc-400">¿Ya eres cliente?</span>
              <span className="text-amber-400 font-bold ml-1 underline decoration-amber-500/30 underline-offset-4">
                Iniciar sesión
              </span>
            </button>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;