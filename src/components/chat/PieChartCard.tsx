"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PieChartCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

// Paleta de colores de marca (celestes) - mismo que chartTemplates.ts
const COLORS = ["#9ECCDB", "#0498C8", "#007DA6", "#025C7A", "#023D52"];
const LEGEND_LABEL_COLOR = "#212121"; // labelColor de BRAND_CONFIG
const LEGEND_TITLE_COLOR = "#000000"; // titleColor de BRAND_CONFIG

function renderLabel(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const { cx, cy, midAngle, outerRadius, value, percent } = props;
  const RAD = Math.PI / 180;
  const r = outerRadius + 16; // distancia de la etiqueta
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  const label = `${value} tickets (${(percent * 100).toFixed(1)}%)`;

  return (
    <text
      x={x}
      y={y}
      fill="#111827"
      fontSize={12}
      fontWeight={600}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {label}
    </text>
  );
}

export function PieChartCard({ payload }: PieChartCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData: any[] = payload?.data?.map((d: { source: string; count: number }) => ({ 
    name: d.source, 
    value: d.count 
  })) || [];

  const title = payload?.metric || "Distribución";

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white mb-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          paddingAngle={1}
          labelLine={true}
          label={renderLabel}
          startAngle={90}
          endAngle={-270}
        >
          {chartData.map((_entry, i: number) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconSize={16}
          wrapperStyle={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: LEGEND_TITLE_COLOR // titleColor de BRAND_CONFIG
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => <span style={{ fontSize: '14px', fontWeight: 'bold', color: LEGEND_LABEL_COLOR }}>{value}</span>}
        />
        <Tooltip 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: number, n: string, pl: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const total = chartData.reduce((sum: number, d: any) => sum + d.value, 0);
            const percent = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
            return [`${v} tickets`, `${pl.payload?.name || n} (${percent}%)`];
          }} 
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
  );
}

export default PieChartCard;

