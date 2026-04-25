import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { LuUser, LuMail, LuLock, LuSave, LuChevronLeft } from 'react-icons/lu';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuariosService } from '../services/usuariosService';

const PerfilCliente: React.FC = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, login } = useAuth(); // Usaremos 'login' para actualizar el contexto con los nuevos datos
  const [presentToast] = useIonToast();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar datos actuales del usuario al montar
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
      // Enviamos password solo si el usuario escribió algo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { nombre, email };
      if (password.trim() !== '') {
        payload.password = password;
      }

      const res = await usuariosService.actualizarPerfil(payload);
      
      // Actualizamos el contexto global para que el Header y el Dashboard muestren el nuevo nombre
      // Suponiendo que tu AuthContext guarda un token, si el backend te devuelve un nuevo token, guárdalo aquí.
      // Si no, simplemente actualizamos el objeto 'user' en el LocalStorage y estado.
      const userData = { ...user, nombre: res.user.nombre, email: res.user.email };
      localStorage.setItem('user', JSON.stringify(userData));
      
      presentToast({ message: 'Perfil actualizado con éxito', color: 'success', duration: 3000 });
      setPassword('');
      
      // Opcional: Redirigir atrás
      // history.push('/dashboard-cliente');

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
      <IonContent scrollY={true}>
        <div className="min-h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)' }}>
          
          <div className="px-6 pt-14 pb-6 flex items-center gap-4">
            <button
              onClick={() => history.goBack()}
              className="w-10 h-10 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 active:text-amber-500 transition-colors flex-shrink-0"
            >
              <LuChevronLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Mi Perfil
              </h1>
              <p className="text-zinc-600 text-xs">Actualiza tus datos personales</p>
            </div>
          </div>

          <div className="px-6 pb-10">
            <form onSubmit={handleGuardar} className="space-y-6">
              
              {/* Campo Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                <div className="relative flex items-center">
                  <LuUser className="absolute left-4 text-zinc-500 text-lg" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-amber-500 focus:bg-zinc-900 transition-all"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                <div className="relative flex items-center">
                  <LuMail className="absolute left-4 text-zinc-500 text-lg" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-amber-500 focus:bg-zinc-900 transition-all"
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex justify-between">
                  <span>Nueva Contraseña</span>
                  <span className="text-zinc-700 text-[10px]">(Opcional)</span>
                </label>
                <div className="relative flex items-center">
                  <LuLock className="absolute left-4 text-zinc-500 text-lg" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-amber-500 focus:bg-zinc-900 transition-all"
                    placeholder="Dejar en blanco para no cambiar"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-8 flex items-center justify-center gap-2 rounded-2xl font-bold text-black active:scale-95 transition-transform disabled:opacity-50"
                style={{
                  height: '58px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 8px 32px rgba(217,119,6,0.3)',
                }}
              >
                <LuSave className="text-lg" />
                <span>{cargando ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>

            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PerfilCliente;