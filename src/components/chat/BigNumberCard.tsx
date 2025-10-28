"use client";
import React from "react";

interface BigNumberCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export function BigNumberCard({ payload }: BigNumberCardProps) {
  // Extract number from chartSpec or direct payload
  const chartSpec = payload?.chartSpec;
  let number = payload?.avg_hours_business || 0;
  const metric = payload?.metric || "Métrica";
  const total = payload?.total_closed;

  // If avg_hours_business exists, use it; otherwise use total_closed (for closed_volume single day)
  if (payload?.avg_hours_business !== undefined) {
    number = payload.avg_hours_business;
  } else if (payload?.total_closed !== undefined) {
    number = payload.total_closed;
  }

  // Try to get number from chartSpec data if available
  if (chartSpec?.data?.values && Array.isArray(chartSpec.data.values) && chartSpec.data.values.length > 0) {
    const hours = chartSpec.data.values[0]?.hours;
    if (hours !== undefined) {
      number = hours;
    }
  }

  // Format number based on its value
  const formattedNumber = payload?.total_closed && !payload?.avg_hours_business
    ? Math.round(number) // Integer for ticket counts
    : number.toFixed(2); // Decimal for hours

  return (
    <div className="inline-block my-2">
    <div className="border border-gray-300 rounded-lg bg-white p-4 shadow-sm w-56 h-36 flex flex-col">
        <div className="text-sm text-black font-bold mb-2 text-center">{metric}</div>

        {/* Centro elástico */}
        <div className="flex-1 grid place-items-center">
        <div className="text-4xl font-bold text-[#00A9E0] leading-tight text-center">
            {formattedNumber}
        </div>
        </div>

        {/* Footer (puede no tener contenido) */}
        {payload?.total_closed && payload?.avg_hours_business !== undefined ? (
        <div className="text-xs text-gray-800 text-center mt-1">
            {total} tickets cerrados
        </div>
        ) : (
        // Reserva altura para mantener simetría cuando no hay footer
        <div className="mt-1 min-h-[16px]"></div>
        )}
    </div>
    </div>
  );
  
}

export default BigNumberCard;

