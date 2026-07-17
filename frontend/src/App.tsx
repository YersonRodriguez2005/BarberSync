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

// Función pura para determinar el dashboard según el rol
const getDashboard = (isAuthenticated: boolean, rol?: string): string => {
  if (!isAuthenticated) return '/login';
  return rol === 'PELUQUERO' ? '/dashboard-peluquero' : '/dashboard-cliente';
};

interface ProtectedRouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  allowedRoles,
  ...rest
}) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) return <Redirect to="/login" />;
        
        // Validación de rol estricta
        if (allowedRoles && user?.rol && !allowedRoles.includes(user.rol)) {
          return <Redirect to={getDashboard(true, user.rol)} />;
        }
        return <Component {...props} />;
      }}
    />
  );
};

interface PublicRouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) return <Component {...props} />;
        return <Redirect to={getDashboard(true, user?.rol)} />;
      }}
    />
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <IonReactRouter>
      <IonRouterOutlet className="bg-[#0a0a0c]">
        {/* --- RUTAS PÚBLICAS --- */}
        <PublicRoute exact path="/login" component={Login} />
        <PublicRoute exact path="/register" component={Register} />

        {/* --- RUTAS PROTEGIDAS POR ROL --- */}
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

        {/* --- REDIRECCIONES DE RAÍZ --- */}
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