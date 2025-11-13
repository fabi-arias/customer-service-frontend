// src/app/metrics/page.tsx
"use client";
import { useEffect, useState } from "react";
import { MessageVisual } from "@/components/chat/MessageVisual";
import { BigNumberCard } from "@/components/chat/BigNumberCard";
import { BarChartCard } from "@/components/chat/BarChartCard";
import { LineChartCard } from "@/components/chat/LineChartCard";
import { PieChartCard } from "@/components/chat/PieChartCard";

export default function MetricsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [charts, setCharts] = useState<any[]>([]);

  useEffect(() => {
    setCharts([
      // Big number example (single day closed volume)
      {
        success: true,
        metric: "Tickets cerrados",
        from: "2025-10-22",
        to: "2025-10-22",
        total_closed: 96,
        chartType: "bigNumber",
      },
      // Bar chart example (top agents)
      {
        success: true,
        metric: "Top de agentes por tickets cerrados",
        from: "2025-10-01",
        to: "2025-10-22",
        params: { top: 5 },
        total: 96,
        data: [
          { agent: "Agente Soporte 2 Benefit Viajes", count: 33 },
          { agent: "Agente Soporte 3 Benefit Viajes", count: 33 },
          { agent: "Agente Soporte 1 Benefit Viajes", count: 29 },
          { agent: "Agente Soporte 4 Benefit Viajes", count: 1 },
        ],
        chartType: "bar",
        metadata: {
          xField: "count",
          yField: "agent",
          xType: "quantitative",
          yType: "nominal",
          sortBy: "-x",
          xTitle: "Tickets cerrados",
          yTitle: "Agente",
        },
      },
    ]);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Métricas - Múltiples Gráficos</h1>
      <div className="space-y-3 sm:space-y-4">
        {charts.length > 0 ? (
          charts.map((chart, index) => {
            if (chart?.chartType === "pie") {
              return (
                <MessageVisual key={index}>
                  <PieChartCard payload={chart} />
                </MessageVisual>
              );
            }
            if (chart?.chartType === "bar") {
              return (
                <MessageVisual key={index}>
                  <BarChartCard payload={chart} />
                </MessageVisual>
              );
            }
            if (chart?.chartType === "line") {
              return (
                <MessageVisual key={index}>
                  <LineChartCard payload={chart} />
                </MessageVisual>
              );
            }
            // Big number or unknown -> render BigNumber if number fields exist
            if (
              chart?.chartType === "bigNumber" ||
              chart?.total_closed !== undefined ||
              chart?.avg_hours_business !== undefined
            ) {
              return (
                <MessageVisual key={index}>
                  <BigNumberCard payload={chart} />
                </MessageVisual>
              );
            }
            return null;
          })
        ) : (
          <p className="text-sm sm:text-base">Cargando…</p>
        )}
      </div>
    </div>
  );
}

