# Customer Service Chat - Frontend

Frontend moderno desarrollado con Next.js 15, TypeScript y Tailwind CSS para el sistema de chat de servicio al cliente con integración de Amazon Bedrock Agent.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Scripts Disponibles](#-scripts-disponibles)
- [Componentes Principales](#-componentes-principales)
- [Autenticación](#-autenticación)
- [Integración con API](#-integración-con-api)
- [Despliegue](#-despliegue)
- [Docker](#-docker)
- [Troubleshooting](#-troubleshooting)
- [Contribución](#-contribución)

## 🎯 Descripción

Este frontend proporciona una interfaz de usuario moderna y responsive para interactuar con el sistema de chat de servicio al cliente. La aplicación incluye:

- **Chat en tiempo real** con el agente de Bedrock
- **Autenticación OAuth 2.0** con AWS Cognito
- **Gestión de usuarios** para administradores
- **Visualización de métricas** y estadísticas
- **Sistema de invitaciones** para nuevos usuarios
- **Diseño responsive** optimizado para desktop y mobile

## ✨ Características Principales

### Interfaz de Chat
- ✅ Chat en tiempo real con el agente de Bedrock
- ✅ Historial de conversación persistente
- ✅ Soporte para mensajes estructurados (tickets, contactos)
- ✅ Visualización de métricas y gráficos
- ✅ Indicadores de carga y estado
- ✅ Auto-scroll inteligente
- ✅ Manejo robusto de errores

### Autenticación
- ✅ OAuth 2.0 con AWS Cognito
- ✅ Login con Hosted UI de Cognito
- ✅ Gestión de sesión con cookies HttpOnly
- ✅ Protección de rutas privadas
- ✅ Redirección automática en caso de sesión expirada
- ✅ Logout seguro

### Gestión de Usuarios (Admin)
- ✅ Lista de usuarios con filtros
- ✅ Invitación de nuevos usuarios por email
- ✅ Gestión de roles y permisos
- ✅ Aceptación de invitaciones
- ✅ Verificación de estado de usuarios

### Visualización de Datos
- ✅ Gráficos interactivos con Recharts
- ✅ Tarjetas de métricas (Big Numbers)
- ✅ Gráficos de barras, líneas y pie
- ✅ Visualización de tickets y contactos
- ✅ Parsing inteligente de respuestas del agente

### UX/UI
- ✅ Diseño moderno con Tailwind CSS
- ✅ Componentes reutilizables
- ✅ Iconos con Lucide React
- ✅ Modales y diálogos con Headless UI
- ✅ Responsive design
- ✅ Dark mode ready (preparado para futuras mejoras)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│              Next.js 15 App Router              │
│  ┌──────────────────────────────────────────┐  │
│  │  Pages & Routes                          │  │
│  │  - / (Chat)                              │  │
│  │  - /login/callback (OAuth)               │  │
│  │  - /admin/users (User Management)        │  │
│  │  - /invite/accept (Invitation)           │  │
│  │  - /metrics (Metrics Dashboard)          │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Components                               │  │
│  │  - ChatInterface                          │  │
│  │  - Sidebar                                │  │
│  │  - MessageVisual                          │  │
│  │  - Chart Components                       │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Context & State                         │  │
│  │  - AuthContext (User Session)            │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  API Client                               │  │
│  │  - Axios with interceptors                │  │
│  │  - Automatic token refresh                │  │
│  │  - Error handling                         │  │
│  └──────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST
                   │
        ┌──────────▼──────────┐
        │  FastAPI Backend    │
        │  (Port 8000)        │
        └─────────────────────┘
```

## 🛠️ Tecnologías

### Core
- **Next.js** 15.5.5 - Framework React con App Router
- **React** 19.1.0 - Biblioteca de UI
- **TypeScript** 5.x - Type safety

### Estilos
- **Tailwind CSS** 4.x - Framework de utilidades CSS
- **PostCSS** - Procesador de CSS

### UI Components
- **Headless UI** 2.2.9 - Componentes accesibles sin estilos
- **Lucide React** 0.545.0 - Iconos modernos
- **Recharts** 3.3.0 - Gráficos y visualizaciones

### HTTP & Data
- **Axios** 1.12.2 - Cliente HTTP
- **React Markdown** 10.1.0 - Renderizado de markdown

### AWS Integration
- **AWS SDK v3** - Secrets Manager integration

### Desarrollo
- **ESLint** 9.x - Linter
- **TypeScript** - Type checking

## 📁 Estructura del Proyecto

```
customer-service-chat-frontend/
├── public/                      # Assets estáticos
│   ├── favicon.ico
│   ├── logo-*.png
│   └── ...
│
├── scripts/                     # Scripts de utilidad
│   ├── load-secrets.js         # Carga secretos de AWS
│   ├── setup-aws-secret.sh     # Setup de secretos
│   └── update-aws-secret.sh    # Actualización de secretos
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página principal (Chat)
│   │   ├── globals.css         # Estilos globales
│   │   │
│   │   ├── login/              # Autenticación
│   │   │   └── callback/
│   │   │       └── page.tsx    # OAuth callback
│   │   │
│   │   ├── admin/              # Panel de administración
│   │   │   └── users/
│   │   │       └── page.tsx    # Gestión de usuarios
│   │   │
│   │   ├── invite/             # Invitaciones
│   │   │   └── accept/
│   │   │       └── page.tsx    # Aceptar invitación
│   │   │
│   │   ├── metrics/            # Métricas
│   │   │   └── page.tsx        # Dashboard de métricas
│   │   │
│   │   └── access-denied/      # Acceso denegado
│   │       └── page.tsx
│   │
│   ├── components/             # Componentes React
│   │   ├── chat/              # Componentes de chat
│   │   │   ├── ChatInterface.tsx      # Interfaz principal
│   │   │   ├── ChatMessage.tsx        # Mensaje individual
│   │   │   ├── MessageVisual.tsx      # Visualización de mensajes
│   │   │   ├── TicketCard.tsx         # Tarjeta de ticket
│   │   │   ├── ContactCard.tsx        # Tarjeta de contacto
│   │   │   ├── BigNumberCard.tsx      # Métrica grande
│   │   │   ├── BarChartCard.tsx       # Gráfico de barras
│   │   │   ├── LineChartCard.tsx      # Gráfico de líneas
│   │   │   └── PieChartCard.tsx       # Gráfico circular
│   │   │
│   │   ├── sidebar/           # Sidebar
│   │   │   └── Sidebar.tsx    # Barra lateral
│   │   │
│   │   └── ui/                # Componentes UI genéricos
│   │       ├── Header.tsx     # Header de la aplicación
│   │       └── InviteModal.tsx # Modal de invitación
│   │
│   ├── context/               # React Context
│   │   └── AuthContext.tsx    # Contexto de autenticación
│   │
│   ├── lib/                   # Utilidades y helpers
│   │   ├── api.ts             # Cliente API (Axios)
│   │   ├── auth-user.ts       # Utilidades de autenticación
│   │   ├── responseParser.ts  # Parser de respuestas del agente
│   │   └── chartTemplates.ts  # Plantillas de gráficos
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Definiciones de tipos
│   │
│   └── config/                # Configuración
│       └── secrets.ts         # Configuración de secretos
│
├── next.config.ts             # Configuración de Next.js
├── tsconfig.json              # Configuración de TypeScript
├── eslint.config.mjs          # Configuración de ESLint
├── postcss.config.mjs         # Configuración de PostCSS
├── tailwind.config.ts         # Configuración de Tailwind
├── package.json               # Dependencias y scripts
├── amplify.yml                # Configuración de AWS Amplify
└── README.md                  # Este archivo
```

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **npm** 9.x o superior (o **yarn** / **pnpm**)
- **AWS Account** (para Secrets Manager, opcional en desarrollo)
- **Backend API** ejecutándose (puerto 8000 por defecto)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd customer-service-chat-frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Verificar Instalación

```bash
node --version  # Debe ser 18.x o superior
npm --version   # Debe ser 9.x o superior
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# AWS Cognito Configuration
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/login/callback

# AWS Secrets Manager (opcional, para producción)
AWS_SECRETS_MANAGER_SECRET_NAME=your-secret-name
AWS_REGION=us-east-1
```

**Nota:** Las variables que comienzan con `NEXT_PUBLIC_` son expuestas al cliente. No incluyas secretos en estas variables.

### Configuración de AWS Secrets Manager (Producción)

El proyecto incluye scripts para cargar secretos desde AWS Secrets Manager:

```bash
# Configurar secretos (primera vez)
./scripts/setup-aws-secret.sh

# Actualizar secretos
./scripts/update-aws-secret.sh
```

Los secretos se cargan automáticamente antes de `dev` y `build` mediante el script `load-secrets.js`.

### Configuración de Next.js

El archivo `next.config.ts` está configurado con:
- Turbopack habilitado para desarrollo más rápido
- Configuración de imágenes
- Headers de seguridad

### Configuración de Tailwind CSS

Tailwind está configurado en `tailwind.config.ts` con:
- Rutas de contenido configuradas
- Tema personalizado
- Plugins necesarios

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev
```

O con yarn:
```bash
yarn dev
```

La aplicación estará disponible en: `http://localhost:3000`

**Nota:** El script `predev` carga automáticamente los secretos de AWS antes de iniciar el servidor.

### Producción

#### Build Local

```bash
# Construir aplicación
npm run build

# Iniciar servidor de producción
npm start
```

#### Build con Verificación de Tipos

```bash
# Verificar tipos TypeScript
npm run type-check

# Build con verificación
npm run build
```

### Linting

```bash
# Ejecutar linter
npm run lint

# Corregir automáticamente
npm run lint -- --fix
```

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con Turbopack |
| `npm run build` | Construye la aplicación para producción |
| `npm start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run load-secrets` | Carga secretos de AWS Secrets Manager |

## 🧩 Componentes Principales

### ChatInterface

Componente principal del chat. Maneja:
- Envío y recepción de mensajes
- Gestión del historial de conversación
- Parsing de respuestas estructuradas
- Visualización de métricas y gráficos
- Manejo de errores y estados de carga

**Uso:**
```tsx
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return <ChatInterface />;
}
```

### Sidebar

Barra lateral con:
- Información del agente
- Prueba de conexión
- Limpiar chat
- Perfil de usuario
- Logout

### MessageVisual

Componente inteligente que renderiza diferentes tipos de mensajes:
- Texto plano
- Tickets estructurados
- Contactos
- Gráficos y métricas
- Markdown

### Chart Components

Componentes de visualización:
- `BigNumberCard` - Números grandes destacados
- `BarChartCard` - Gráficos de barras
- `LineChartCard` - Gráficos de líneas
- `PieChartCard` - Gráficos circulares

Todos utilizan Recharts para renderizado.

## 🔐 Autenticación

### Flujo de Autenticación

1. **Usuario accede a la aplicación**
   - Si no está autenticado, redirige a `/login`

2. **Login con Cognito**
   - Redirige a Cognito Hosted UI
   - Usuario se autentica

3. **Callback de OAuth**
   - Cognito redirige a `/login/callback?code=...`
   - Frontend envía código a backend `/auth/exchange`
   - Backend establece cookie HttpOnly

4. **Sesión activa**
   - `AuthContext` mantiene estado del usuario
   - Requests incluyen cookie automáticamente
   - Protección de rutas privadas

### AuthContext

Proporciona:
- Estado del usuario autenticado
- Funciones de login/logout
- Verificación de autenticación
- Información de roles y permisos

**Uso:**
```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }
  
  return <div>Hola, {user?.email}</div>;
}
```

### Protección de Rutas

Las rutas privadas verifican autenticación automáticamente mediante middleware o verificación en el componente.

## 🔌 Integración con API

### Cliente API

El cliente API (`src/lib/api.ts`) utiliza Axios con:
- Configuración base URL desde variables de entorno
- Interceptores para manejo de errores 401
- Cookies automáticas (withCredentials)
- Timeout configurado (180 segundos para respuestas del agente)

### Endpoints Utilizados

#### Chat
```typescript
import { chatApi } from '@/lib/api';

// Enviar mensaje
const response = await chatApi.sendMessage({
  message: "¿Cuántos tickets hay?",
  session_id: "optional-session-id"
});

// Obtener info del agente
const info = await chatApi.getAgentInfo();

// Probar conexión
const test = await chatApi.testConnection();
```

#### Autenticación
```typescript
import { authApi } from '@/lib/api';

// Obtener usuario actual
const user = await authApi.getCurrentUser();

// Logout
await authApi.logout();
```

#### Usuarios (Admin)
```typescript
import { usersApi } from '@/lib/api';

// Listar usuarios
const users = await usersApi.listUsers();

// Invitar usuario
await usersApi.inviteUser({ email: "user@example.com" });
```

### Manejo de Errores

El cliente API incluye interceptores que:
- Detectan errores 401 (no autorizado)
- Redirigen automáticamente a login
- Emiten eventos personalizados para manejo global

## 🚢 Despliegue

### AWS Amplify

El proyecto incluye `amplify.yml` para despliegue automático:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm run load-secrets
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Pasos:**
1. Conectar repositorio a AWS Amplify
2. Configurar variables de entorno en la consola
3. Configurar secretos en AWS Secrets Manager
4. Deploy automático en cada push

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

Configurar variables de entorno en el dashboard de Vercel.

### Docker

```bash
# Construir imagen
docker build -t customer-service-chat-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8000 \
  customer-service-chat-frontend
```

### Build Estático (Export)

Para generar un build estático:

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  // ... otras configuraciones
};
```

Luego:
```bash
npm run build
# Los archivos estáticos estarán en /out
```

## 🐳 Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
```

## 🔧 Troubleshooting

### Error: "Module not found"

**Solución:**
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "API connection failed"

**Solución:**
1. Verifica que el backend esté ejecutándose
2. Verifica `NEXT_PUBLIC_API_URL` en `.env.local`
3. Verifica CORS en el backend
4. Revisa la consola del navegador para errores específicos

### Error: "Cognito redirect failed"

**Solución:**
1. Verifica que `NEXT_PUBLIC_COGNITO_DOMAIN` sea correcto
2. Verifica que `NEXT_PUBLIC_OAUTH_REDIRECT_URI` coincida con la configuración en Cognito
3. Verifica que el callback URL esté en la lista de URLs permitidas en Cognito

### Error: "Secrets not loaded"

**Solución:**
1. Verifica credenciales AWS:
   ```bash
   aws configure list
   ```
2. Verifica que el secreto exista:
   ```bash
   aws secretsmanager describe-secret --secret-id your-secret-name
   ```
3. Verifica permisos IAM para Secrets Manager

### Error: "Build failed"

**Solución:**
1. Verifica errores de TypeScript:
   ```bash
   npm run type-check
   ```
2. Verifica errores de ESLint:
   ```bash
   npm run lint
   ```
3. Limpia caché de Next.js:
   ```bash
   rm -rf .next
   npm run build
   ```

### Hot Reload no funciona

**Solución:**
1. Verifica que estés usando `npm run dev` (no `npm start`)
2. Reinicia el servidor de desarrollo
3. Limpia caché:
   ```bash
   rm -rf .next
   ```

### Problemas con CORS

**Solución:**
1. Verifica que el backend tenga configurado CORS correctamente
2. Verifica que `NEXT_PUBLIC_API_URL` use el mismo protocolo (http/https)
3. En desarrollo, asegúrate de que ambos (frontend y backend) usen localhost

## 📝 Mejores Prácticas

### TypeScript
- Siempre tipa tus componentes y funciones
- Usa los tipos definidos en `src/types/index.ts`
- Evita `any`, usa `unknown` si es necesario

### Componentes
- Mantén componentes pequeños y enfocados
- Usa composición sobre herencia
- Extrae lógica compleja a hooks personalizados

### Estilos
- Usa Tailwind CSS para estilos
- Evita estilos inline cuando sea posible
- Usa clases de utilidad de Tailwind

### API Calls
- Siempre maneja errores
- Usa loading states
- Implementa retry logic para requests críticos

### Performance
- Usa `next/image` para imágenes
- Implementa lazy loading cuando sea apropiado
- Optimiza bundle size con dynamic imports

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo

- Usa TypeScript estricto
- Sigue las convenciones de Next.js
- Escribe componentes funcionales
- Usa hooks de React
- Mantén componentes pequeños y reutilizables