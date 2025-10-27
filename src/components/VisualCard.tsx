"use client";
import { VegaEmbed } from "react-vega";
import { resolveRef } from "@/lib/resolveRef";

export default function VisualCard({
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
  const spec = payload?.chartSpec ? resolveRef(payload.chartSpec, payload) : null;

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white mb-4">
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
        <VegaEmbed spec={spec} options={{ actions: false }} />
      ) : (
        <p className="text-sm text-slate-500">Este resultado no incluye un gráfico.</p>
      )}
    </div>
  );
}
