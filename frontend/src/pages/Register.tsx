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

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post("register", { nombre, email, telefono, password });
      const respLogin = await api.post("/login", { email, password });
      login(respLogin.data.token, respLogin.data.user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message || "Error al registrar usuario.";
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      icon: <LuUser className="text-amber-600 text-base flex-shrink-0" />,
      type: "text",
      placeholder: "Nombre completo",
      value: nombre,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setNombre(e.target.value),
    },
    {
      icon: <LuMail className="text-amber-600 text-base flex-shrink-0" />,
      type: "email",
      placeholder: "Correo electrónico",
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setEmail(e.target.value),
    },
    {
      icon: <LuPhone className="text-amber-600 text-base flex-shrink-0" />,
      type: "tel",
      placeholder: "Teléfono",
      value: telefono,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTelefono(e.target.value),
    },
    {
      icon: <LuLock className="text-amber-600 text-base flex-shrink-0" />,
      type: "password",
      placeholder: "Contraseña",
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPassword(e.target.value),
    },
  ];

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          className="flex flex-col min-h-full px-6 pt-12 pb-10"
          style={{
            background: "linear-gradient(160deg, #0a0a0a 60%, #1a1209 100%)",
          }}
        >
          {/* Back button */}
          <button
            onClick={() => history.push("/login")}
            className="flex items-center gap-1 text-zinc-500 text-sm mb-10 w-fit active:text-amber-500 transition-colors"
          >
            <LuChevronLeft />
            <span>Volver</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-700/40 mb-5"
            >
              <LuScissors className="text-amber-500 text-xs" />
              <span className="text-amber-500/80 text-xs font-semibold tracking-[0.2em] uppercase">
                Nueva cuenta
              </span>
            </div>

            <h1
              className="text-4xl font-black text-white leading-tight mb-2"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}
            >
              Únete a la{" "}
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1px rgba(217,119,6,0.7)" }}
              >
                familia.
              </span>
            </h1>
            <p className="text-zinc-500 text-sm">
              Agenda sin filas. Vive sin esperas.
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-6">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/50"
                style={{ height: "58px" }}
              >
                {field.icon}
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent outline-none text-white placeholder-zinc-600 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full flex items-center justify-between px-6 rounded-2xl font-bold text-black active:scale-95 transition-transform disabled:opacity-60 mb-4"
            style={{
              height: "58px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 8px 32px rgba(217,119,6,0.35)",
            }}
          >
            <span className="text-sm tracking-wide">
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </span>
            <div className="bg-black/15 rounded-xl p-1.5">
              <LuChevronRight className="text-lg" />
            </div>
          </button>

          {/* Fine print */}
          <p className="text-center text-zinc-600 text-xs leading-relaxed px-4">
            Al registrarte aceptas nuestros{" "}
            <span className="text-amber-600">términos de servicio</span> y{" "}
            <span className="text-amber-600">política de privacidad</span>.
          </p>

          {/* Already have account */}
          <div className="flex items-center gap-3 mt-8 mb-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600 text-xs">¿Ya tienes cuenta?</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <button
            onClick={() => history.push("/login")}
            className="w-full flex items-center justify-center border border-zinc-800 rounded-2xl text-zinc-400 text-sm font-medium active:bg-zinc-900 transition-colors"
            style={{ height: "52px" }}
          >
            <span className="text-amber-500 font-bold">Iniciar sesión</span>
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;