"use client";
import { VegaEmbed } from "react-vega";
import { resolveRef } from "@/lib/resolveRef";
import { generateChartSpec } from "@/lib/chartTemplates";

export function VisualCard({
  payload,
  title,
  onAddToDashboard,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddToDashboard?: (viz: { spec: any; payload: any }) => void;
}) {
  // First try existing chartSpec (backwards compatible)
  let spec = payload?.chartSpec ? resolveRef(payload.chartSpec, payload) : null;
  
  // If no chartSpec but has chartType hint, generate it
  if (!spec && payload?.chartType && payload?.data) {
    spec = generateChartSpec(payload);
  }

  // Get dynamic width from spec if available
  const chartWidth = spec?.width || 600;
  // Add extra padding to prevent clipping:
  // - 180px base padding
  // - 80px extra safety margin for labels, axis titles, legend, etc.
  const containerWidth = chartWidth + 260;
  
  return (
    <div className="inline-block rounded-2xl border p-4 shadow-sm bg-white mb-4" style={{ width: `${containerWidth}px` }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          {title || payload?.metric || "Visualización"}
        </h3>
        {spec && onAddToDashboard && (
          <button
            className="text-sm px-3 py-1 rounded bg-black text-white"
            onClick={() => onAddToDashboard({ spec, payload })}
          >
            + Agregar al dashboard
          </button>
        )}
      </div>

      {payload?.summary && (
        <p className="text-sm text-slate-600 mb-3">{payload.summary}</p>
      )}

      {spec ? (
        <div style={{ overflow: 'visible' }}>
          <VegaEmbed spec={spec} options={{ actions: false }} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">Este resultado no incluye un gráfico.</p>
      )}
    </div>
  );
}

export default VisualCard;
