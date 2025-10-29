"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";

interface BarChartCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

// Paleta de colores de marca (celestes) - mismo que chartTemplates.ts
const COLORS = ["#9ECCDB", "#0498C8", "#007DA6", "#025C7A", "#023D52"];
const AXIS_COLOR = "#132933"; // labelColor de BRAND_CONFIG
const TITLE_COLOR = "#212121"; // titleColor de BRAND_CONFIG
const BAR_COLOR = "#00A9E0"; // bar.color de BRAND_CONFIG

// Calculate dynamic height based on data length
function calculateHeight(dataLength: number, baseHeight: number = 200): number {
  return Math.max(baseHeight, 28 * Math.max(1, dataLength) + 40);
}

export function BarChartCard({ payload }: BarChartCardProps) {
  const chartData = payload?.data || [];
  const title = payload?.metric || "Gráfico";
  
  // Metadata para determinar qué campos usar
  const metadata = payload?.metadata || {};
  const xField = metadata.xField || "count";
  const yField = metadata.yField || "category";
  const xTitle = metadata.xTitle || "Tickets cerrados";
  const yTitle = metadata.yTitle || "Categoría";
  const colorField = metadata.colorField;
  const sortBy = metadata.sortBy || "-x";
  
  // Sort data if needed (sortBy: "-x" means descending by xField)
  const sortedData = [...chartData].sort((a, b) => {
    if (sortBy === "-x") {
      return (b[xField] || 0) - (a[xField] || 0);
    }
    return (a[xField] || 0) - (b[xField] || 0);
  });
  
  // Calcular tamaño dinámico - mismo cálculo que chartTemplates.ts
  const dataLength = sortedData.length;
  const dynamicHeight = calculateHeight(dataLength);
  const dynamicWidth = Math.min(800, Math.max(400, 50 + dataLength * 8));

  return (
    <div className="inline-block rounded-2xl border p-4 shadow-sm bg-white mb-4" style={{ width: `${dynamicWidth + 260}px` }}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12, fill: AXIS_COLOR }}
            label={{ 
              value: xTitle, 
              position: 'insideBottom', 
              offset: -5,
              style: { fontSize: '13px', fill: TITLE_COLOR, fontWeight: 'normal' }
            }}
            domain={[0, 'dataMax']}
          />
          <YAxis 
            type="category" 
            dataKey={yField} 
            width={120}
            tick={{ fontSize: 12, fill: AXIS_COLOR }}
            axisLine={false}
            label={{ 
              value: yTitle, 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: '13px', fill: TITLE_COLOR, fontWeight: 'normal' }
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}`, xTitle]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(label: any) => `${yTitle}: ${label}`}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0',
              fontSize: '12px'
            }}
            labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}
          />
          <Bar dataKey={xField} radius={[0, 8, 8, 0]}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {sortedData.map((entry: any, index: number) => {
              // Use colorField if specified, otherwise use yField for color
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const colorKeyValue = colorField ? (entry as any)[colorField] : (entry as any)[yField];
              const colorIndex = typeof colorKeyValue === 'string' 
                ? colorKeyValue.charCodeAt(0) % COLORS.length 
                : index % COLORS.length;
              // If no colorField, use single color from BRAND_CONFIG
              const fillColor = colorField ? COLORS[colorIndex] : BAR_COLOR;
              return <Cell key={`cell-${index}`} fill={fillColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartCard;

