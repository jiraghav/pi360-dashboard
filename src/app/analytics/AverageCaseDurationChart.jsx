"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import CaseDurationModal from "./CaseDurationModal"; // ← import your modal

// Custom clickable dot
const CustomDot = ({ cx, cy, payload, setSelectedPoint }) => {
  if (cx == null || cy == null) return null;

  return (
    <>
      {/* visible dot */}
      <circle cx={cx} cy={cy} r={8} fill="#3b82f6" stroke="#fff" strokeWidth={1} />

      {/* bigger invisible click area */}
      <circle
        cx={cx}
        cy={cy}
        r={16}
        fill="transparent"
        style={{ cursor: "pointer", pointerEvents: "all" }}
        onClick={(e) => {
          e.stopPropagation();
          const [monthName, year] = payload.month.split(" ");
          setSelectedPoint({
            month: monthName,
            year: year,
          });
        }}
      />
    </>
  );
};

export default function AverageCaseDurationChart({ data, loading, error }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  return (
    <div className="col-span-12 lg:col-span-6 card p-5">
      <h4 className="font-semibold mb-3">Average Case Duration</h4>

      {loading ? (
        <div className="h-72 grid place-items-center text-mute">
          Loading chart...
        </div>
      ) : error ? (
        <div className="h-72 grid place-items-center text-rose-500">{error}</div>
      ) : data?.length ? (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} />
              <YAxis
                tick={{ fill: "#9ca3af" }}
                label={{
                  value: "Days",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9ca3af",
                }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "none" }}
                labelStyle={{ color: "#fff" }}
              />

              <Line
                type="monotone"
                dataKey="avgDuration"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={<CustomDot setSelectedPoint={setSelectedPoint} />}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Updated modal with API fetch */}
          <CaseDurationModal
            open={!!selectedPoint}
            onClose={() => setSelectedPoint(null)}
            month={selectedPoint?.month}
            year={selectedPoint?.year}
          />
        </>
      ) : (
        <div className="h-72 grid place-items-center text-mute">
          No case duration data available
        </div>
      )}
    </div>
  );
}
