import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardCliente from './pages/DashboardCliente';
import DashboardPeluquero from './pages/DashboardPeluquero';
import AgendarCita from './pages/AgendarCita';
import ConfiguracionHorario from './pages/ConfiguracionHorario';
import PerfilCliente from './pages/PerfilCliente';  
import ReagendarCita from './pages/ReagendarCita';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';

setupIonicReact();

// ✅ Función pura, se llama siempre en render (no en el módulo)
const getDashboard = (isAuthenticated: boolean, rol?: string) => {
  if (!isAuthenticated) return '/login';
  return rol === 'PELUQUERO' ? '/dashboard-peluquero' : '/dashboard-cliente';
};

const ProtectedRoute: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
  // ✅ Agregamos allowedRoles para proteger por rol también
  allowedRoles?: string[];
}> = ({ component: Component, allowedRoles, ...rest }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) return <Redirect to="/login" />;
        // Si la ruta tiene roles permitidos y el usuario no es uno de ellos,
        // lo mandamos a su dashboard correcto
        if (allowedRoles && !allowedRoles.includes(user?.rol)) {
          return <Redirect to={getDashboard(true, user?.rol)} />;
        }
        return <Component {...props} />;
      }}
    />
  );
};

const PublicRoute: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) return <Component {...props} />;
        // ✅ Se evalúa en cada render, con el user ya actualizado
        return <Redirect to={getDashboard(true, user?.rol)} />;
      }}
    />
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rutas públicas */}
        <PublicRoute exact path="/login" component={Login} />
        <PublicRoute exact path="/register" component={Register} />

        {/* ✅ Rutas protegidas con control de rol */}
        <ProtectedRoute
          exact
          path="/dashboard-cliente"
          component={DashboardCliente}
          allowedRoles={['CLIENTE']}
        />
        <ProtectedRoute
          exact
          path="/dashboard-peluquero"
          component={DashboardPeluquero}
          allowedRoles={['PELUQUERO']}
        />
        <ProtectedRoute
          exact
          path="/agendar"
          component={AgendarCita}
          allowedRoles={['CLIENTE']}
        />

        <ProtectedRoute
          exact
          path="/configuracion-horario"
          component={ConfiguracionHorario}
          allowedRoles={['PELUQUERO']}
        />

        <ProtectedRoute
          exact
          path="/perfil"
          component={PerfilCliente}
          allowedRoles={['CLIENTE']}
        />

        <ProtectedRoute
          exact
          path="/reagendar"
          component={ReagendarCita}
          allowedRoles={['CLIENTE']}
        />


        {/* ✅ Ruta raíz: se evalúa en render con el estado actual */}
        <Route exact path="/">
          <Redirect to={getDashboard(isAuthenticated, user?.rol)} />
        </Route>

        <Route exact path="/dashboard">
          <Redirect to={getDashboard(isAuthenticated, user?.rol)} />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </IonApp>
);

export default App;