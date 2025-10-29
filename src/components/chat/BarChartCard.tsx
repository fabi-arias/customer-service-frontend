"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";

interface BarChartCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

// ======= Configuración de marca (misma paleta que enviaste) =======
const COLORS = ["#9ECCDB", "#0E9BCC", "#00A9E0", "#02536E", "#033647"];
const AXIS_COLOR = "#212121";
const TITLE_COLOR = "#000000";

// ======= Utilidades =======
// Estima el ancho de texto (px) para decidir dinámicamente el ancho del YAxis
function measureTextWidth(text: string, font = "12px Inter, system-ui, sans-serif") {
  if (typeof document === "undefined") return text.length * 7; // fallback SSR
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = font;
  return ctx.measureText(text).width;
}

function calcYAxisWidth(labels: string[], base = 120, pad = 24) {
  const max = labels.reduce((m, s) => Math.max(m, measureTextWidth(s)), 0);
  // Limita dentro de un rango razonable para no romper layout
  return Math.max(base, Math.min(Math.ceil(max + pad), 260));
}

// Mapea categoría -> color de forma estable (sin repetir tanto)
function buildCategoryColor(
  items: string[],
  palette: string[]
): Map<string, string> {
  const map = new Map<string, string>();
  items.forEach((cat, i) => map.set(cat, palette[i % palette.length]));
  return map;
}

const YCenteredLabel = ({ viewBox, value }: any) => {
    const padding = 12;
    const cx = viewBox.x + padding; 
    const cy = viewBox.y + viewBox.height / 2;
    return (
      <text
        x={cx}
        y={cy}
        transform={`rotate(-90, ${cx}, ${cy})`}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
        fill={TITLE_COLOR}
      >
        {value}
      </text>
    );
  };
  

// Altura dinámica (igual a tu lógica)
function calculateHeight(dataLength: number, baseHeight: number = 220): number {
  return Math.max(baseHeight, 28 * Math.max(1, dataLength) + 40);
}

export function BarChartCard({ payload }: BarChartCardProps) {
  const chartData = payload?.data || [];
  const title = payload?.metric || "Gráfico";

  const metadata = payload?.metadata || {};
  const xField = metadata.xField || "count";
  const yField = metadata.yField || "category";
  const xTitle = metadata.xTitle || "Tickets cerrados";
  const yTitle = metadata.yTitle || "Categoría";
  const colorField = metadata.colorField; // opcional para forzar la clave de color
  const sortBy = metadata.sortBy || "-x";

  // Orden
  const sortedData = [...chartData].sort((a, b) =>
    sortBy === "-x" ? (b[xField] || 0) - (a[xField] || 0) : (a[xField] || 0) - (b[xField] || 0)
  );

  // Ancho dinámico/alto dinámico (tus reglas)
  const dataLength = sortedData.length;
  const dynamicHeight = calculateHeight(dataLength);
  const dynamicWidth = Math.min(800, Math.max(440, 50 + dataLength * 8));

  // === Ajuste DINÁMICO del ancho del YAxis según el label más largo ===
  const yLabels = sortedData.map((d: any) => String(d[yField] ?? ""));
  const yAxisWidth = calcYAxisWidth(yLabels, 120, 24);

  // === Colores por categoría (estable) ===
  const keyForColorField = colorField || yField;
  const categories: string[] = Array.from(
    new Set(sortedData.map((d: any) => String(d[keyForColorField])))
  );
  const categoryColor = buildCategoryColor(categories, COLORS);

  return (
    <div
      className="inline-block rounded-2xl border p-4 shadow-sm bg-white mb-4"
      style={{ width: `${dynamicWidth + 260}px` }}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <BarChart
          data={sortedData}
          layout="vertical"
          barCategoryGap={8}
          barGap={4}
          margin={{ top: 0, right: 5, bottom: 15, left: 5 }} // se mantiene
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: AXIS_COLOR }}
            label={{
              value: xTitle,
              position: "insideBottom",
              offset: -5,
              style: { fontSize: "13px", fill: TITLE_COLOR, fontWeight: "bold" },
            }}
            domain={[0, "dataMax"]}
          />

          <YAxis
            type="category"
            dataKey={yField}
            width={yAxisWidth}            // ⬅️ ancho dinámico
            interval={0}
            tick={{ fontSize: 12, fill: AXIS_COLOR }}
            tickLine={false}
            axisLine={{ stroke: "#bdbdbd", strokeWidth: 1 }}
            // Evita cortes por espacios (no-break spaces)
            tickFormatter={(v: string) => (v ? String(v).replace(/ /g, "\u00A0") : v)}
          >
            {/* Label del eje Y 100% centrado verticalmente */}
            <Label content={<YCenteredLabel value={yTitle} />} />
          </YAxis>

          <Tooltip
            formatter={(value: number) => [`${value}`, xTitle]}
            labelFormatter={(label: any) => `${yTitle}: ${label}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              fontSize: "12px",
            }}
            labelStyle={{ fontSize: "12px", fontWeight: "bold", color: "#000" }}
          />

          {/* Barras cuadradas + colores por categoría */}
          <Bar dataKey={xField} radius={0}>
            {sortedData.map((entry: any, index: number) => {
              const key = String(entry[keyForColorField]);
              const fill = categoryColor.get(key) ?? COLORS[index % COLORS.length];
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartCard;
