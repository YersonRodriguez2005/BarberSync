import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { LuUser, LuMail, LuLock, LuSave, LuChevronLeft, LuLoader, LuScissors } from 'react-icons/lu';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuariosService } from '../services/usuariosService';

const PerfilCliente: React.FC = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, login } = useAuth();
  const [presentToast] = useIonToast();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { nombre, email };
      if (password.trim() !== '') {
        payload.password = password;
      }

      const res = await usuariosService.actualizarPerfil(payload);
      
      const userData = { ...user, nombre: res.user.nombre, email: res.user.email };
      localStorage.setItem('user', JSON.stringify(userData));
      
      presentToast({ message: 'Perfil actualizado con éxito', color: 'success', duration: 3000, position: 'top' });
      setPassword('');
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'Error al actualizar el perfil';
      presentToast({ message: mensaje, color: 'danger', duration: 3000 });
    } finally {
      setCargando(false);
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={true} className="bg-[#0a0a0c]">
        <div className="relative min-h-full flex flex-col pb-10 overflow-x-hidden">
          
          {/* ========================================================== */}
          {/* ILUMINACIÓN AMBIENTAL (Orbes GPU) */}
          {/* ========================================================== */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-zinc-600/5 rounded-full blur-[80px] pointer-events-none" />

          {/* ========================================================== */}
          {/* HEADER Y NAVEGACIÓN */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 pt-14 pb-8 flex items-center gap-4 animate-slide-up">
            <button
              onClick={() => history.goBack()}
              className="flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-800/80 bg-[#121215] text-zinc-400 active:scale-95 active:text-amber-400 transition-all shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)] flex-shrink-0"
            >
              <LuChevronLeft className="text-xl" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LuScissors className="text-amber-500 text-xs" />
                <span className="text-amber-500/70 text-xs tracking-[0.2em] uppercase font-semibold">
                  Ajustes
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight font-serif tracking-tight">
                Mi Perfil
              </h1>
            </div>
          </div>

          {/* ========================================================== */}
          {/* FORMULARIO (Glass Card + Soft Inset Inputs) */}
          {/* ========================================================== */}
          <div className="relative z-10 px-6 pb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="glass-card p-6 border-white/5">
              
              <div className="flex justify-center mb-8">
                <div className="relative w-24 h-24 rounded-full bg-[#121215] border border-zinc-800 flex items-center justify-center shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.02),inset_2px_2px_6px_rgba(0,0,0,0.8)]">
                  <LuUser className="text-4xl text-amber-500/50" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#121215] shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                </div>
              </div>

              <form onSubmit={handleGuardar} className="space-y-5">
                
                {/* Campo Nombre */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                    Nombre Completo
                  </label>
                  <div className="soft-input-container h-14">
                    <LuUser className="text-amber-500 text-lg flex-shrink-0 transition-transform duration-200 group-focus-within:scale-110" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder-zinc-600 text-sm font-medium"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                {/* Campo Email */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                    Correo Electrónico
                  </label>
                  <div className="soft-input-container h-14 opacity-70">
                    <LuMail className="text-zinc-500 text-lg flex-shrink-0" />
                    <input
                      type="email"
                      required
                      readOnly
                      value={email}
                      className="w-full bg-transparent outline-none text-zinc-400 placeholder-zinc-600 text-sm font-medium cursor-not-allowed"
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1.5 ml-2 font-medium">
                    El correo electrónico no puede modificarse.
                  </p>
                </div>

                {/* Campo Contraseña */}
                <div className="pt-2">
                  <div className="flex justify-between items-end mb-1.5 ml-1 pr-1">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Nueva Contraseña
                    </label>
                    <span className="text-amber-500/70 text-[10px] font-medium italic">Opcional</span>
                  </div>
                  <div className="soft-input-container h-14">
                    <LuLock className="text-amber-500 text-lg flex-shrink-0 transition-transform duration-200 group-focus-within:scale-110" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder-zinc-600 text-sm font-medium"
                      placeholder="Dejar en blanco para conservar"
                    />
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={cargando}
                    className="soft-btn-primary h-14 w-full"
                  >
                    <span className="text-sm font-extrabold tracking-wider uppercase">
                      {cargando ? 'Guardando...' : 'Guardar Cambios'}
                    </span>
                    {!cargando ? (
                      <div className="bg-black/20 rounded-xl p-2">
                        <LuSave className="text-lg" />
                      </div>
                    ) : (
                      <div className="bg-black/20 rounded-xl p-2">
                        <LuLoader className="text-lg animate-spin" />
                      </div>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default PerfilCliente;