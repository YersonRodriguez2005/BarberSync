# ✂️ BarberApp — Sistema de Gestión y Agendamiento de Citas

> Plataforma móvil profesional para barberías. Gestión de turnos en tiempo real, notificaciones push automatizadas y panel de control para barberos — todo bajo una estética dark luxury diseñada para el ambiente del local.

<br>

## 📸 Capturas de Pantalla

<br>

| Dashboard Barbero | Configuración de Horario | Agenda del Cliente |
|:-----------------:|:------------------------:|:-----------------:|
| `./assets/dashboard-peluquero.png` | `./assets/configuracion-historial.png` | `./assets/dashboard-cliente.png` |

<br>

| Historial de Cortes | Agendar Turno |
|:-------------------:|:-------------:|
| `./assets/dashboard-peluquero-citas.png` | `./assets/agendar-cita.png` |

<br>

---

## 🗂️ Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Funcionalidades](#-funcionalidades)
- [Requisitos Funcionales](#-requisitos-funcionales)
- [Requisitos No Funcionales](#-requisitos-no-funcionales)
- [Reglas de Negocio](#-reglas-de-negocio)
- [Diseño de la Interfaz](#-diseño-de-la-interfaz)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Reference](#-api-reference)
- [Base de Datos](#-base-de-datos)

---

## 📋 Descripción General

**BarberApp** es una aplicación móvil cliente-servidor construida con **Ionic React** que resuelve el problema del agendamiento caótico en barberías. Permite a los clientes reservar turnos en bloques de tiempo estrictos y le da al barbero una herramienta de gestión en tiempo real para controlar su agenda del día.

### ¿Qué problema resuelve?

- ❌ Sin la app: turnos por WhatsApp, olvidos, clientes que no se presentan, desorden.
- ✅ Con la app: reservas online, código de verificación único por cita, notificación 5 minutos antes del turno, historial paginado de cortes realizados.

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| **Ionic React** | Framework móvil (iOS / Android) |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos utilitarios |
| **React Router** | Navegación entre vistas |
| **Lucide React** | Iconografía |

### Backend
| Tecnología | Uso |
|------------|-----|
| **Node.js + Express** | Servidor REST API |
| **PostgreSQL** | Base de datos relacional |
| **JWT** | Autenticación de sesiones |
| **bcrypt** | Hashing de contraseñas |
| **node-cron** | Worker para notificaciones push |
| **Firebase Cloud Messaging (FCM)** | Notificaciones push Android |
| **Apple Push Notification service (APNs)** | Notificaciones push iOS |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│              CLIENTE MÓVIL                  │
│         Ionic React (iOS / Android)         │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / REST
┌──────────────────▼──────────────────────────┐
│              BACKEND                        │
│            Node.js + Express                │
│                                             │
│  ┌─────────────┐    ┌────────────────────┐  │
│  │ Auth Routes │    │   Citas Routes     │  │
│  └─────────────┘    └────────────────────┘  │
│  ┌─────────────────────────────────────┐    │
│  │         Cron Job (node-cron)        │    │
│  │   Notificaciones Push (-5 min)      │    │
│  └─────────────────────────────────────┘    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│             PostgreSQL                      │
│  usuarios │ citas │ horarios_semana         │
└─────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades

### 👤 Para el Cliente
- 📅 **Consulta de disponibilidad en tiempo real** — visualiza los bloques horarios disponibles del barbero según su configuración semanal
- ✅ **Agendamiento de cita** — reserva un bloque de tiempo estricto con validación de cruces en el servidor
- 🔑 **Código de verificación único** — generado automáticamente al confirmar (formato `BARB-XXXX`)
- 🔔 **Notificación push automática** — recibe un aviso exactamente 5 minutos antes de su turno
- 🔄 **Reagendamiento** — cambia la hora de su cita con validación de disponibilidad
- ❌ **Cancelación controlada** — solo disponible si falta más de 1 hora para el turno

### ✂️ Para el Barbero
- 📊 **Dashboard en tiempo real** — vista de turnos pendientes del día ordenados cronológicamente
- ▶️ **Control de estados** — cambia el estado de cada cita: `AGENDADA → EN_PROGRESO → FINALIZADA`
- 📜 **Historial paginado** — consulta todos los cortes realizados con carga progresiva ("Ver más")
- ⚙️ **Configuración de horario semanal** — define los días y horas de atención por cada día de la semana
- 🔓 **Días de descanso** — activa o desactiva días de trabajo con toggle por día

---

## 📌 Requisitos Funcionales

### RF-01 — Autenticación de Usuarios
El sistema permite a los clientes y barberos registrarse e iniciar sesión con correo y contraseña. Las sesiones se manejan con JWT almacenado en el cliente.

### RF-02 — Consulta de Disponibilidad
El sistema muestra al cliente los bloques de tiempo libres del barbero para una fecha seleccionada. Los bloques ocupados (`AGENDADA` o `EN_PROGRESO`) y los días de descanso configurados por el barbero se muestran deshabilitados.

### RF-03 — Agendamiento de Cita y Generación de ID
Al agendar una cita, el sistema:
1. Valida la ausencia de cruces con otras citas activas (a nivel de BD con query de solapamiento)
2. Registra `inicio_esperado` y `fin_esperado` exactos
3. Genera un **código de verificación único** en formato `BARB-XXXX`
4. Retorna el código al cliente para que lo muestre en pantalla

### RF-04 — Notificación Preventiva (5 Minutos)
Un **Cron Job** evalúa continuamente las citas agendadas. Exactamente 5 minutos antes del `inicio_esperado`, el sistema dispara una notificación push al dispositivo del cliente con el mensaje de acercamiento al local. La latencia máxima admitida es de **10 segundos**.

### RF-05 — Panel de Gestión del Barbero
El dashboard muestra:
- Contador de turnos pendientes y completados del día
- Lista de citas `AGENDADA` y `EN_PROGRESO` con hora, nombre del cliente y código
- Historial general de citas `FINALIZADA` con paginación de 5 en 5 registros

### RF-06 — Verificación de ID de Cita
El barbero puede buscar o escanear el código presentado por el cliente para validar que corresponde a la cita del bloque actual.

### RF-07 — Finalización de la Cita
El barbero cambia el estado manualmente:
- `AGENDADA → EN_PROGRESO`: cuando el cliente se sienta
- `EN_PROGRESO → FINALIZADA`: cuando termina el corte

### RF-08 — Cancelación Estricta
El cliente solo puede cancelar si **falta más de 1 hora** para el inicio. Dentro del margen, la cancelación está bloqueada para evitar espacios vacíos injustificados.

### RF-09 — Configuración de Horario Semanal *(mejora implementada)*
El barbero configura su disponibilidad semanal desde la app: activa o desactiva días y define hora de apertura y cierre para cada día. Esta configuración es consultada en tiempo real al generar la vista de disponibilidad para el cliente.

---

## 🔒 Requisitos No Funcionales

### RNF-01 — Precisión del Tiempo *(Crítico)*
Toda validación de fechas y horas se realiza **exclusivamente en el backend**. El servidor actúa como única fuente de verdad. La hora del dispositivo del usuario no se usa para ninguna validación.

### RNF-02 — Rendimiento de Notificaciones
El retraso entre el momento de envío programado (−5 min) y la recepción por la API de mensajería (FCM / APNs) no debe superar los **10 segundos**.

### RNF-03 — Concurrencia en Agendamiento
El sistema maneja bloqueos a nivel de base de datos al agendar. Si dos usuarios intentan reservar el mismo bloque simultáneamente, solo se asigna al primero que llega al servidor. El segundo recibe un error `409 Conflict`.

```sql
-- Query de validación de cruces (nivel de BD)
SELECT id FROM citas 
WHERE peluquero_id = $1 
AND estado IN ('AGENDADA', 'EN_PROGRESO')
AND (inicio_esperado < $3 AND fin_esperado > $2)
```

### RNF-04 — Usabilidad Móvil
El código de verificación se muestra en pantalla en tamaño grande y legible para que el barbero pueda leerlo desde cierta distancia sin que el cliente entregue su teléfono.

### RNF-05 — Paginación del Historial *(mejora implementada)*
El historial de cortes se carga de a **5 registros por página** con metadatos de paginación (`totalItems`, `currentPage`, `totalPages`, `hasMore`). La carga adicional se activa con un botón "Ver más" explícito para evitar problemas de scroll infinito en listas cortas.

---

## 📐 Reglas de Negocio

| # | Regla |
|---|-------|
| **RN-01** | Una cita no puede sobreponerse en el tiempo con otra cita existente del mismo barbero |
| **RN-02** | El cliente solo puede cancelar si falta más de 1 hora para el inicio del turno |
| **RN-03** | El barbero no puede iniciar una cita cuyo horario aún no ha llegado, a menos que la anterior haya terminado |
| **RN-04** | El sistema no expone el teléfono ni el correo del cliente al barbero — solo nombre y código de turno |
| **RN-05** | Los días marcados como descanso en la configuración semanal no generan slots disponibles para el cliente |
| **RN-06** | El reagendamiento valida cruces excluyendo la propia cita que se está modificando |

---

## 🎨 Diseño de la Interfaz

La app sigue un sistema de diseño consistente llamado **Dark Luxury Barber** aplicado en todas las vistas.

### Sistema de Color

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#0a0a0a → #111` | Fondo principal (gradiente) |
| `accent-amber` | `#f59e0b → #d97706` | Acciones primarias, estados activos |
| `accent-green` | `#4ade80 → #16a34a` | Finalización, estados completados |
| `surface` | `rgba(255,255,255,0.03)` | Cards y contenedores |
| `border` | `rgba(255,255,255,0.06)` | Bordes sutiles |
| `text-primary` | `#ffffff` | Títulos y horas |
| `text-secondary` | `#71717a` (zinc-500) | Textos de soporte |

### Tipografía

- **Display / Horas**: `Georgia, serif` — peso `font-black` — para horas y nombres en dashboard
- **UI / Labels**: Sistema Tailwind — `tracking-[0.2em]` en labels de sección

### Componentes Clave

**Indicador lateral de estado**
```
┌─────────────────────────────┐
█ 10:20 AM          En corte  │  ← barra ámbar izquierda = EN_PROGRESO
█ Juan García                 │
█ #BARB-A3K2    [Finalizar]   │
└─────────────────────────────┘
```

**Toggle de día (ConfiguracionHorario)**
```
Lunes                    ●───  ← OFF = gris
Martes           ───────●     ← ON = gradiente ámbar con glow
```

**Resumen visual semanal**
```
LUN  MAR  MIÉ  JUE  VIE  SÁB  DOM
[✓]  [✓]  [·]  [✓]  [✓]  [✓]  [·]
ámbar             ámbar ámbar ámbar
```

### Mejoras de Diseño Aplicadas *(vs. versión inicial)*

- ✅ Header custom en `ConfiguracionHorario` consistente con el Dashboard (sin `IonHeader` genérico)
- ✅ Resumen visual de días como mapa de disponibilidad semanal en tiempo real
- ✅ Indicador lateral ámbar en días activos (mismo patrón que citas `EN_PROGRESO`)
- ✅ Toggle rehecho con gradiente ámbar y `box-shadow` glow al activarse
- ✅ Inputs de hora con `colorScheme: 'dark'` para respetar el tema en el picker nativo
- ✅ Botón flotante con gradiente ámbar consistente con el resto de CTAs primarios
- ✅ Ícono `LuSun` / `LuMoon` por día según estado activo/descanso

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js `>= 18`
- PostgreSQL `>= 14`
- Ionic CLI: `npm install -g @ionic/cli`
- Cuenta de Firebase con FCM habilitado

### Backend

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/barberapp.git
cd barberapp/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# → Editar .env con tus credenciales

# Crear tablas en PostgreSQL
psql -U postgres -d barberapp -f schema.sql

# Iniciar servidor
npm run dev
```

### Frontend

```bash
cd barberapp/frontend

# Instalar dependencias
npm install

# Ejecutar en navegador (desarrollo)
ionic serve

# Ejecutar en dispositivo Android
ionic cap run android

# Ejecutar en dispositivo iOS
ionic cap run ios
```

---

## 🔑 Variables de Entorno

Crear un archivo `.env` en `/backend` con los siguientes valores:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barberapp
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_jwt_aqui
```

---

## 📁 Estructura del Proyecto

```
barberapp/
├── backend/
│   ├── config/
│   │   └── db.js                    # Conexión PostgreSQL
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── citasController.js       # Lógica de negocio de citas
│   │   └── usuariosController.js
│   ├── middlewares/
│   │   └── authMiddleware.js        # Verificación JWT
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── citasRoutes.js
│   │   └── usuariosRoutes.js
│   ├── services/
│   │   └── notificacionService.js   # Cron job de push notifications
│   └── index.js                     # Entry point
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.tsx
        ├── pages/
        │   ├── DashboardPeluquero.tsx
        │   ├── ConfiguracionHorario.tsx
        │   ├── MisCitas.tsx
        │   └── AgendarCita.tsx
        ├── services/
        │   ├── api.ts               # Axios instance
        │   ├── citasService.ts
        │   └── usuariosService.ts
        └── App.tsx
```

---

## 📡 API Reference

Todas las rutas (excepto auth) requieren el header:
```
Authorization: Bearer <token>
```

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/registro` | Registrar usuario |
| `POST` | `/api/login` | Iniciar sesión |

### Citas

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| `POST` | `/api/` | Agendar nueva cita | Cliente |
| `GET` | `/api/mis-citas` | Citas activas del cliente | Cliente |
| `GET` | `/api/disponibilidad?peluquero_id=&fecha=` | Slots disponibles | Cliente |
| `PUT` | `/api/:id/reagendar` | Reagendar cita | Cliente |
| `PATCH` | `/api/:id/cancelar` | Cancelar cita | Cliente |
| `GET` | `/api/agenda` | Agenda del día | Barbero |
| `PATCH` | `/api/:cita_id/estado` | Cambiar estado de cita | Barbero |
| `GET` | `/api/historial-peluquero?page=&limit=` | Historial paginado | Barbero |

### Usuarios

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| `GET` | `/api/mis-horarios` | Obtener horario semanal | Barbero |
| `PUT` | `/api/mis-horarios` | Actualizar horario semanal | Barbero |
| `GET` | `/api/peluqueros` | Listar barberos disponibles | Cliente |

---

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Usuarios (clientes y barberos)
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100) NOT NULL,
  correo      VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  telefono    VARCHAR(20),
  rol         VARCHAR(20) DEFAULT 'CLIENTE', -- 'CLIENTE' | 'PELUQUERO'
  fcm_token   TEXT,                          -- Token para push notifications
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Citas
CREATE TABLE citas (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_verificacion  VARCHAR(20) UNIQUE NOT NULL,
  cliente_id           UUID REFERENCES usuarios(id),
  peluquero_id         UUID REFERENCES usuarios(id),
  inicio_esperado      TIMESTAMP NOT NULL,
  fin_esperado         TIMESTAMP NOT NULL,
  estado               VARCHAR(20) DEFAULT 'AGENDADA',
  -- Estados: AGENDADA | EN_PROGRESO | FINALIZADA | CANCELADA
  notificacion_enviada BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- Horarios semanales del barbero
CREATE TABLE horarios_semana (
  id             SERIAL PRIMARY KEY,
  peluquero_id   UUID REFERENCES usuarios(id),
  dia_semana     INTEGER NOT NULL, -- 0=Dom, 1=Lun, ..., 6=Sáb
  trabaja        BOOLEAN DEFAULT TRUE,
  hora_apertura  TIME NOT NULL,
  hora_cierre    TIME NOT NULL,
  UNIQUE (peluquero_id, dia_semana)
);
```

### Estados de una Cita

```
AGENDADA ──── [Barbero: Iniciar] ───► EN_PROGRESO ──── [Barbero: Finalizar] ───► FINALIZADA
    │
    └── [Cliente: Cancelar (si falta > 1h)] ───► CANCELADA
```

---

## 🔐 Seguridad

- Todas las peticiones viajan bajo **HTTPS / TLS 1.2+**
- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- Sesiones manejadas con **JWT** con expiración configurable
- El barbero **no accede** al teléfono ni correo del cliente — solo nombre y código de turno
- Las validaciones de tiempo y estado se realizan **únicamente en el servidor**

---

## 📄 Documento de Requisitos

El documento completo de Especificación de Requisitos de Software (SRS) del proyecto se encuentra en:

```
/docs/Especificación_de_Requisitos_de_Software.pdf
```

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commitea tus cambios: `git commit -m 'feat: descripción del cambio'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

<div align="center">

*Desarrollado por Nexo Digital*

<img src="./assets/logo-nexo-digital.png" alt="Nexo Digital" width="250" />

<br>

**Hecho con ✂️ para barberías que toman en serio su tiempo.**

</div>