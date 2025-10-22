"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiRequest("dashboard.php");
        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    // fetchDashboard();
  }, []);

  // Sample placeholders if data not available
  const kpis = dashboardData || {
    todaysPatients: 3,
    activeCases: 9,
    pendingReports: 5,
    openTasks: 23,
    newReferrals: 14,
    messages: 7,
  };

  const alerts = dashboardData?.priorityAlerts || [
    { text: "MRI report pending", type: "rose" },
    { text: "Follow‑up overdue", type: "amber" },
    { text: "Weekly summary completed", type: "mint" },
  ];

  const activities = dashboardData?.recentActivity || [
    { text: "New referral uploaded", time: "1h ago" },
    { text: "Imaging reviewed", time: "2h ago" },
    { text: "Treatment plan updated", time: "4h ago" },
  ];

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Quick Actions */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4 card p-5">
            <h3 className="text-mute mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn btn-primary">New Referral</button>
              <button type="button" className="btn">Schedule</button>
              <button type="button" className="btn">Review Notes</button>
              <button type="button" className="btn">Send Notes</button>
            </div>
          </div>

          {/* KPIs */}
          <div className="col-span-12 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="kpi">
              <div className="text-3xl font-semibold">{loading ? "…" : kpis.todaysPatients}</div>
              <div className="text-mute text-sm">Today's Patients</div>
            </div>
            <div className="kpi">
              <div className="text-3xl font-semibold">{loading ? "…" : kpis.activeCases}</div>
              <div className="text-mute text-sm">Active Cases</div>
            </div>
            <div className="kpi">
              <div className="text-3xl font-semibold">{loading ? "…" : kpis.pendingReports}</div>
              <div className="text-mute text-sm">Pending Reports</div>
            </div>
            <div className="kpi">
              <div className="text-3xl font-semibold">{loading ? "…" : kpis.openTasks}</div>
              <div className="text-mute text-sm">Open Tasks</div>
            </div>
            <div className="kpi">
              <div className="text-3xl font-semibold">{loading ? "…" : kpis.newReferrals}</div>
              <div className="text-mute text-sm">New Referrals</div>
            </div>
            <div className="kpi">
              <div className="text-3xl font-semibold">{loading ? "…" : kpis.messages}</div>
              <div className="text-mute text-sm">Messages</div>
            </div>
          </div>
        </section>

        {/* Priority Alerts & Recent Activity */}
        <section className="grid grid-cols-12 gap-4">
          {/* Alerts */}
          <div className="col-span-12 lg:col-span-6 card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="dot bg-rose-500"></span>
              <h4 className="font-semibold">Clinical Alerts</h4>
            </div>
            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : error ? (
              <p className="text-rose-500">{error}</p>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between border-b border-stroke/60 py-3">
                  <div>{alert.text}</div>
                  <span className={`badge text-${alert.type}-300`}>{alert.type.toUpperCase()}</span>
                </div>
              ))
            )}
          </div>

          {/* Recent Activity */}
          <div className="col-span-12 lg:col-span-6 card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="dot bg-sky-400"></span>
              <h4 className="font-semibold">Activity</h4>
            </div>
            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : error ? (
              <p className="text-rose-500">{error}</p>
            ) : (
              <ul className="space-y-3">
                {activities.map((activity, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{activity.text}</span>
                    <span className="text-xs text-mute">{activity.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
