# Estructura del Proyecto Frontend

## 📁 Estructura de Directorios

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal (chat)
│   ├── metrics/
│   │   └── page.tsx             # Página de métricas (testing)
│   └── globals.css               # Estilos globales
│
├── components/                   # Componentes React
│   ├── chat/                    # 🎯 Componentes de chat
│   │   ├── ChatInterface.tsx    # Interfaz principal del chat
│   │   ├── ChatMessage.tsx      # Renderizado de mensajes
│   │   ├── TicketCard.tsx       # Card para tickets
│   │   ├── ContactCard.tsx      # Card para contactos
│   │   ├── VisualCard.tsx       # Card para visualizaciones
│   │   └── README.md            # Documentación del módulo
│   ├── ui/                      # Componentes de UI
│   │   └── Header.tsx          # Encabezado de la app
│   ├── sidebar/                 # Sidebar
│   │   └── Sidebar.tsx          # Barra lateral
│   └── README.md                # Documentación general
│
├── lib/                          # Utilidades y helpers
│   ├── api.ts                   # API client
│   ├── resolveRef.ts            # Resolver $ref en chartSpec
│   ├── responseParser.ts        # Parser de respuestas Bedrock
│   └── README.md                # Documentación
│
└── types/                        # TypeScript types
    └── index.ts                 # Definiciones de tipos
```

## 🎯 Organización por Funcionalidad

### Chat Module (`components/chat/`)

Todos los componentes relacionados con el chat están agrupados:

- **ChatInterface.tsx** - Orquesta la lógica del chat
- **ChatMessage.tsx** - Renderiza cada mensaje (usuario/asistente)
- **TicketCard.tsx** - Card colapsable para tickets
- **ContactCard.tsx** - Card para información de contactos
- **VisualCard.tsx** - Card para gráficos Vega-Lite

**Principio**: Co-locación. Componentes que siempre se usan juntos están juntos.

### Lib Utilities (`lib/`)

Funciones reutilizables:

- **api.ts** - Comunicación con backend
- **resolveRef.ts** - Resuelve `$ref` en especificaciones de Vega
- **responseParser.ts** - Parsea respuestas del agente en componentes renderizables

## 🔄 Flujo de Datos

```
Usuario envía mensaje
    ↓
ChatInterface → Backend API
    ↓
Backend responde con texto + JSONs
    ↓
responseParser.ts extrae:
    - Texto conversacional
    - Tickets
    - Contactos
    - Visualizaciones (chartSpec)
    ↓
ChatMessage renderiza según tipo:
    - Conversación → texto
    - Tickets → TicketCard[]
    - Contactos → ContactCard[]
    - Charts → VisualCard[]
```

## 📦 Importaciones

### Estandarizadas

```typescript
// Componentes de chat
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TicketCard } from '@/components/chat/TicketCard';
import { VisualCard } from '@/components/chat/VisualCard';

// Utilidades
import { parseBedrockResponse } from '@/lib/responseParser';
import { resolveRef } from '@/lib/resolveRef';
import { chatApi } from '@/lib/api';

// Types
import { ChatMessage, Ticket, Contact } from '@/types';
```

## ✨ Características Principales

### 1. Parsing Inteligente
`responseParser.ts` es capaz de:
- Extraer múltiples bloques JSON embebidos
- Separar texto conversacional de datos estructurados
- Detectar y agrupar tickets, contactos y visualizaciones
- Manejar respuestas combinadas (texto + múltiples gráficos)

### 2. Visualizaciones Múltiples
Soporta múltiples gráficos en una sola respuesta:
```typescript
// El agente puede devolver:
const response = {
  chartData: [chart1, chart2, chart3]  // Array de gráficos
}
```

### 3. Cards Modulares
- **TicketCard**: Expandible, muestra información completa
- **ContactCard**: Datos de contacto con enlaces
- **VisualCard**: Gráficos Vega-Lite interactivos

## 🎨 Estilos

- Tailwind CSS para estilos
- Componentes independientes
- Responsive design
- Consistent spacing y colores

## 📝 Convenciones

1. **Named Exports**: Preferible para mejor tree-shaking
2. **TypeScript Strict**: Tipado fuerte en interfaces
3. **Co-locación**: Componentes relacionados juntos
4. **Documentación**: READMEs en cada carpeta importante

## 🚀 Próximas Mejoras

- [ ] Tests unitarios para componentes
- [ ] Tests de integración para flujo completo
- [ ] Storybook para componentes UI
- [ ] Optimización de bundle size
- [ ] Lazy loading de visualizaciones

