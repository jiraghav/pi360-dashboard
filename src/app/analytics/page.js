"use client";

import ProtectedRoute from "../components/ProtectedRoute";

export default function Analytics() {
  const kpis = [
    { value: "3,284", label: "Total Patients" },
    { value: "1,220", label: "Unique Patients" },
    { value: "312", label: "Active Patients" },
    { value: "875", label: "Completed" },
    { value: "$3.12M", label: "Total Billed" },
    { value: "44", label: "Avg Days DOI→First" },
  ];

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="kpi">
              <div className="text-3xl font-semibold">{kpi.value}</div>
              <div className="text-mute text-sm">{kpi.label}</div>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6 card p-5">
            <h4 className="font-semibold mb-3">Patient Status Breakdown</h4>
            <div className="h-72 grid place-items-center text-mute">
              Donut chart placeholder
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 card p-5">
            <h4 className="font-semibold mb-3">Average Case Duration</h4>
            <div className="h-72 grid place-items-center text-mute">
              Line chart placeholder
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
