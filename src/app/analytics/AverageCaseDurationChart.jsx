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

function Modal({ open, onClose, data }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm flex">
      <div className="bg-slate-900 text-white rounded-lg p-6 w-96 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-3">Case Duration Details</h2>
        {data ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium text-slate-300">Month:</span>{" "}
              {data.month}
            </p>
            <p>
              <span className="font-medium text-slate-300">Average Duration:</span>{" "}
              {data.avgDuration} days
            </p>
            {data.count && (
              <p>
                <span className="font-medium text-slate-300">Cases Count:</span>{" "}
                {data.count}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-400">No details available.</p>
        )}
      </div>
    </div>
  );
}

const CustomDot = ({ cx, cy, payload, setSelectedPoint }) => {
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={8}
      fill="#3b82f6"
      stroke="#fff"
      strokeWidth={1}
      style={{
        // cursor: "pointer",
        pointerEvents: "all", // ✅ ensure click is captured
      }}
      onClick={(e) => {
        e.stopPropagation(); // prevent tooltip or chart drag interference
        // setSelectedPoint(payload);
      }}
    />
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

          {/* Modal */}
          <Modal
            open={!!selectedPoint}
            onClose={() => setSelectedPoint(null)}
            data={selectedPoint}
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
