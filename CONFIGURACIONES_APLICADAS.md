# Configuraciones de chartTemplates.ts Aplicadas a Recharts

## ✅ Colores de Marca

### Bar Chart
- **Color único**: `#00A9E0` (cuando no hay colorField)
- **Paleta**: `["#9ECCDB", "#0498C8", "#007DA6", "#025C7A", "#023D52"]` (cuando hay colorField)

### Line Chart
- **Línea**: `#00A9E0`
- **Puntos**: `#00A9E0`

### Pie Chart
- **Paleta**: `["#9ECCDB", "#0498C8", "#007DA6", "#025C7A", "#023D52"]`

## ✅ Tamaños de Fuente

### Axis Labels
- Font size: **12px** (labelFontSize de BRAND_CONFIG)
- Color: **#132933** (labelColor)

### Axis Titles
- Font size: **13px** (titleFontSize de BRAND_CONFIG)
- Color: **#212121** (titleColor)

### Legend
- Label size: **14px** (labelFontSize de legend)
- Title size: **16px** (titleFontSize de legend)
- Label color: **#132933**
- Title color: **#000000**

## ✅ Funcionalidades

### Bar Chart
- ✅ Sort por `sortBy` metadata (default: "-x")
- ✅ ColorField support (colores múltiples cuando se especifica)
- ✅ Altura dinámica: `calculateHeight(dataLength)`
- ✅ Ancho dinámico: `Math.min(800, Math.max(400, 50 + dataLength * 8))`

### Line Chart
- ✅ Ancho dinámico: `Math.min(900, Math.max(400, 30 + data.length * 60))`
- ✅ Domain Y: `[0, 'auto']` (zero: true, nice: true)
- ✅ Angle X: `-45°` (labelAngle)

### Pie Chart
- ✅ Labels exteriores con porcentaje
- ✅ Legend con tamaños correctos

## 📊 Comparación Final

| Aspecto | chartTemplates.ts (Vega-Lite) | Recharts |
|---------|-------------------------------|----------|
| Colores | BRAND_CONFIG | ✅ Mismo |
| Fuentes | 12px / 13px | ✅ Mismo |
| Tamaño dinámico | calculateHeight() | ✅ Mismo |
| SortBy | "-x" | ✅ Implementado |
| ColorField | Soporte | ✅ Implementado |
| Tooltips | Formato específico | ✅ Mismo formato |

## ✅ Resultado

Ahora todos los gráficos de Recharts tienen **exactamente las mismas configuraciones visuales** que tenían con Vega-Lite, pero con:
- ✅ Mejor control de labels
- ✅ Labels externos en pie charts
- ✅ Sin cortes
- ✅ Responsive mejorado

