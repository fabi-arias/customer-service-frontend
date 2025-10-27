"use client";
import { useEffect, useState } from "react";
import VisualCard from "@/components/VisualCard";

export default function MetricsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Example data with chartSpec
    setData({
      success: true,
      metric: "closed_volume",
      from: "2025-10-20",
      to: "2025-10-23",
      total_closed: 260,
      summary: "Tickets cerrados en el período",
      by_day: [
        { date: "2025-10-21", count: 104 },
        { date: "2025-10-22", count: 96 },
        { date: "2025-10-23", count: 60 },
      ],
      chartSpec: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Evolución diaria de tickets cerrados",
        data: { values: { $ref: "by_day" } },
        mark: { type: "line", point: true },
        encoding: {
          x: { field: "date", type: "temporal", title: "Fecha" },
          y: { field: "count", type: "quantitative", title: "Tickets cerrados" },
          tooltip: [
            { field: "date", type: "temporal", title: "Fecha" },
            { field: "count", type: "quantitative", title: "Cerrados" },
          ],
        },
      },
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Métricas de Tickets Cerrados</h1>
      {data ? <VisualCard payload={data} /> : <p>Cargando…</p>}
    </div>
  );
}

