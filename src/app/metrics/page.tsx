"use client";
import { useEffect, useState } from "react";
import VisualCard from "@/components/VisualCard";

export default function MetricsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [charts, setCharts] = useState<any[]>([]);

  useEffect(() => {
    // Example with multiple charts
    setCharts([
      {
        success: true,
        metric: "closed_volume",
        from: "2025-10-22",
        to: "2025-10-22",
        total_closed: 96,
        summary: "Tickets cerrados en el período",
        by_day: [
          { date: "2025-10-22", count: 96 },
        ],
        chartSpec: {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          description: "Evolución diaria de tickets cerrados",
          data: { values: { $ref: "by_day" } },
          mark: { type: "bar" },
          width: 500,
          height: 300,
          encoding: {
            x: { field: "date", type: "ordinal", title: "Fecha" },
            y: { field: "count", type: "quantitative", title: "Tickets cerrados" },
          },
        },
      },
      {
        success: true,
        metric: "Top de agentes por tickets cerrados",
        from: "2025-10-22",
        to: "2025-10-22",
        params: { top: 5 },
        top_agents: [
          { agent: "Agente Soporte 2 Benefit Viajes", count: 33 },
          { agent: "Agente Soporte 3 Benefit Viajes", count: 33 },
          { agent: "Agente Soporte 1 Benefit Viajes", count: 29 },
          { agent: "Agente Soporte 4 Benefit Viajes", count: 1 },
        ],
        total: 96,
        chartSpec: {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          description: "Top de agentes por tickets cerrados",
          data: { values: { $ref: "top_agents" } },
          mark: { type: "bar" },
          width: 560,
          height: 200,
          encoding: {
            x: { field: "count", type: "quantitative", title: "Tickets cerrados" },
            y: { field: "agent", type: "nominal", sort: "-x", title: "Agente" },
          },
        },
      },
    ]);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Métricas - Múltiples Gráficos</h1>
      <div className="space-y-4">
        {charts.length > 0 ? (
          charts.map((chart, index) => <VisualCard key={index} payload={chart} />)
        ) : (
          <p>Cargando…</p>
        )}
      </div>
    </div>
  );
}

