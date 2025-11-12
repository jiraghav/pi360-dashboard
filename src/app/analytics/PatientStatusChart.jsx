"use client";

export default function PatientStatusChart({ loading, error }) {
  return (
    <div className="col-span-12 lg:col-span-6 card p-5">
      <h4 className="font-semibold mb-3">Patient Status Breakdown</h4>

      {loading ? (
        <div className="h-72 grid place-items-center text-mute">
          Loading chart...
        </div>
      ) : error ? (
        <div className="h-72 grid place-items-center text-rose-500">{error}</div>
      ) : (
        <div className="h-72 grid place-items-center text-mute">
          Donut chart coming soon
        </div>
      )}
    </div>
  );
}
