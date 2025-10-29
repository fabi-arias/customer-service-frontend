"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

const AXIS_COLOR = "#212121"; // labelColor de BRAND_CONFIG
const TITLE_COLOR = "#000000"; // titleColor de BRAND_CONFIG
const LINE_COLOR = "#00A9E0"; // line.color de BRAND_CONFIG
const POINT_COLOR = "#048FBF"; // point.color de BRAND_CONFIG

export function LineChartCard({ payload }: LineChartCardProps) {
  const chartData = payload?.data || [];
  const title = payload?.metric || "Gráfico";
  
  // Metadata para determinar qué campos usar
  const metadata = payload?.metadata || {};
  const xField = metadata.xField || "date";
  const yField = metadata.yField || "count";
  const xTitle = metadata.xTitle || "Fecha";
  const yTitle = metadata.yTitle || "Tickets cerrados";
  
  // Calcular tamaño dinámico - mismo cálculo que chartTemplates.ts
  // Dynamic width based on data points to prevent label overlap
  // For dates, each point needs ~60px, max 900px
  const dynamicWidth = Math.min(900, Math.max(400, 30 + chartData.length * 60));

  return (
    <div className="inline-block rounded-2xl border p-4 shadow-sm bg-white mb-4" style={{ width: `${dynamicWidth + 260}px` }}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey={xField}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12, fill: AXIS_COLOR }}
            label={{ 
              value: xTitle, 
              position: 'bottom', 
              offset: -10,
              style: { fontSize: '13px', fill: TITLE_COLOR, fontWeight: 'bold' }
            }}
          />
          <YAxis 
            domain={[0, 'auto']}
            tick={{ fontSize: 12, fill: AXIS_COLOR }}
            label={{ 
              value: yTitle, 
              angle: -90, 
              position: 'insideLeft', // mantiene centrado verticalmente
              offset: 0,              // deja que dx controle el espacio
              dx: 10,                // 🔹 aleja el texto de los números
              dy: 50,                 // 🔹 corrige el centrado vertical (ajusta este valor)
              style: { fontSize: '13px', fill: TITLE_COLOR, fontWeight: 'bold' }
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}`, yTitle]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(label: any) => `${xTitle}: ${label}`}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0',
              fontSize: '12px'
            }}
            labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}
          />
          <Line 
            type="linear" 
            dataKey={yField} 
            stroke={LINE_COLOR} 
            strokeWidth={3}
            dot={{ fill: POINT_COLOR, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: LINE_COLOR }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartCard;

