# Customer Service Chat - Frontend

Frontend React/Next.js para el sistema de chat de servicio al cliente.

## 🚀 Características

- **Next.js 15** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Axios** para comunicación con API
- **Componentes reutilizables** y modulares

## 📁 Estructura del Proyecto

```
customer-service-chat-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página principal
│   │   └── globals.css         # Estilos globales
│   ├── components/
│   │   ├── chat/               # Componentes de chat
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   └── ContactCard.tsx
│   │   ├── sidebar/            # Componentes de sidebar
│   │   │   └── Sidebar.tsx
│   │   └── ui/                 # Componentes de UI
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── api.ts              # Cliente API
│   │   └── responseParser.ts   # Parser de respuestas
│   └── types/
│       └── index.ts            # Tipos TypeScript
├── public/                     # Assets estáticos
├── package.json
└── README.md
```

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Crear archivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔗 Configuración de API

El frontend se comunica con el backend FastAPI a través de:
- **URL Base:** `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- **Endpoints principales:**
  - `POST /api/chat` - Enviar mensaje
  - `GET /api/agent/info` - Información del agente
  - `POST /api/agent/test-connection` - Probar conexión

## 🎨 Características de UI

### Chat Interface
- ✅ Mensajes en tiempo real
- ✅ Soporte para tickets y contactos estructurados
- ✅ Indicador de carga
- ✅ Auto-scroll
- ✅ Manejo de errores

### Sidebar
- ✅ Información del agente
- ✅ Prueba de conexión
- ✅ Limpiar chat
- ✅ Perfil de usuario

### Responsive Design
- ✅ Diseño adaptable
- ✅ Componentes modulares
- ✅ Tailwind CSS para estilos

## 🔄 Migración desde Streamlit

Este frontend reemplaza completamente la UI de Streamlit:
- ✅ **ChatInterface** → Reemplaza `app.py`
- ✅ **Sidebar** → Reemplaza `sidebar.py`
- ✅ **TicketCard/ContactCard** → Reemplaza `components.py`
- ✅ **Parser de respuestas** → Migrado de Python a TypeScript

## 🐳 Docker (Opcional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter
- `npm run type-check` - Verificación de tipos