"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useRouter } from "next/navigation";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiRequest("analytics.php");
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Fallback KPIs if no API data yet
  const kpis = analyticsData?.kpis || [];

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => {
            // Define actions based on label
            const actions = {
              "Total Patients": () => router.push("/cases?status=all"),
              "Active Patients": () => router.push("/cases?status=active"),
              "Completed": () => router.push("/cases?status=completed"),
            };
        
            const onClick = actions[kpi.label];
            const clickable = typeof onClick === "function";
        
            return (
              <div
                key={i}
                onClick={clickable ? onClick : undefined}
                className={`kpi p-4 text-center rounded-xl transition-colors ${
                  clickable
                    ? "cursor-pointer hover:bg-slate-800 bg-slate-900/40"
                    : "cursor-default bg-slate-900/20"
                }`}
              >
                <div className="text-3xl font-semibold">
                  {loading ? "…" : kpi.value ?? 0}
                </div>
                <div className="text-mute text-sm">{kpi.label}</div>
              </div>
            );
          })}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-12 gap-6">
          {/* Donut Chart */}
          <div className="col-span-12 lg:col-span-6 card p-5">
            <h4 className="font-semibold mb-3">Patient Status Breakdown</h4>
            {loading ? (
              <div className="h-72 grid place-items-center text-mute">
                Loading chart...
              </div>
            ) : error ? (
              <div className="h-72 grid place-items-center text-rose-500">
                {error}
              </div>
            ) : (
              <div className="h-72 grid place-items-center text-mute">
                Donut chart coming soon
              </div>
            )}
          </div>

          {/* Line Chart */}
          <div className="col-span-12 lg:col-span-6 card p-5">
            <h4 className="font-semibold mb-3">Average Case Duration</h4>
            {loading ? (
              <div className="h-72 grid place-items-center text-mute">
                Loading chart...
              </div>
            ) : error ? (
              <div className="h-72 grid place-items-center text-rose-500">
                {error}
              </div>
            ) : (
              <div className="h-72 grid place-items-center text-mute">
                Line chart coming soon
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
