"use client";
import React from "react";

interface BigNumberPayload {
  avg_hours_business?: number;
  total_closed?: number;
  metric?: string;
  chartSpec?: {
    data?: {
      values?: Array<{ hours?: number }>;
    };
  };
}

interface BigNumberCardProps {
  payload: BigNumberPayload;
}

const toValidNumber = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function BigNumberCard({ payload }: BigNumberCardProps) {
  const chartSpec = payload?.chartSpec;
  const metric = payload?.metric ?? "Métrica";
  const total = payload?.total_closed;

  // Elegir número base con tolerancia a datos malformados
  let number = 0;
  if (payload?.avg_hours_business !== undefined) {
    number = toValidNumber(payload.avg_hours_business);
  } else if (payload?.total_closed !== undefined) {
    number = toValidNumber(payload.total_closed);
  }

  // Extraer número desde chartSpec si aplica
  if (chartSpec?.data?.values?.length) {
    const hours = chartSpec.data.values[0]?.hours;
    if (hours !== undefined) number = toValidNumber(hours);
  }

  // Formateo seguro (siempre string)
  const formattedNumber = (() => {
    const valid = toValidNumber(number);
    const isCountLike =
      payload?.total_closed !== undefined && payload?.avg_hours_business === undefined;

    return isCountLike ? Math.round(valid).toString() : valid.toFixed(2);
  })();

  return (
    <div className="my-2 w-full sm:w-auto sm:inline-block">
      <div className="border border-gray-300 rounded-lg bg-white p-3 sm:p-4 shadow-sm w-full sm:w-56 h-32 sm:h-36 flex flex-col">
        <div className="text-xs sm:text-sm text-black font-bold mb-2 text-center">
          {metric}
        </div>

        <div className="flex-1 grid place-items-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00A9E0] leading-tight text-center">
            {formattedNumber}
          </div>
        </div>

        {typeof total === "number" && payload?.avg_hours_business !== undefined ? (
          <div className="text-xs text-gray-800 text-center mt-1">
            {Math.round(toValidNumber(total)).toString()} tickets cerrados
          </div>
        ) : (
          <div className="mt-1 min-h-[16px]" />
        )}
      </div>
    </div>
  );
}

export default BigNumberCard;
