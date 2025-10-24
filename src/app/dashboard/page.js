"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useRouter } from "next/navigation";
import ReviewNotesModal from "./ReviewNotesModal"; // new modal component

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const router = useRouter();

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
    fetchDashboard();
  }, []);

  const handleNewReferralClick = () => router.push("/referrals/new");
  const handleSendMsgToBackOfficeClick = () => router.push("/cases");

  const kpis = dashboardData;
  const alerts = dashboardData?.priorityAlerts || [];
  const activities = dashboardData?.recentActivity || [];

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Quick Actions */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4 card p-5">
            <h3 className="text-mute mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleNewReferralClick} className="btn btn-primary">
                New Referral
              </button>
              <button type="button" className="btn">Schedule</button>
              <button
                type="button"
                className="btn"
                onClick={() => setReviewModalOpen(true)}
              >
                <div className="text-3xl font-semibold">
                  {loading ? "…" : (kpis?.notesCount || 0)}
                </div>
                Review Notes
              </button>
              <button type="button" className="btn" onClick={handleSendMsgToBackOfficeClick}>Send Message to Back Office</button>
            </div>
          </div>

          {/* KPIs */}
          <div className="col-span-12 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              ["Today's Patients", kpis?.todaysPatients],
              ["Active Cases", kpis?.activeCases],
              ["Pending Reports", kpis?.pendingReports],
              ["Open Tasks", kpis?.openTasks],
              ["New Referrals", kpis?.newReferrals],
              ["Messages", kpis?.messages],
            ].map(([label, value], i) => (
              <div key={i} className="kpi">
                <div className="text-3xl font-semibold">{loading ? "…" : (value || 0)}</div>
                <div className="text-mute text-sm">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Alerts & Activity */}
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
            ) : alerts.length === 0 ? (
              <p className="text-mute italic">No clinical alerts</p>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between border-b border-stroke/60 py-3">
                  <div>{alert.text}</div>
                  <span className={`badge text-${alert.type}-300`}>
                    {alert.type.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Activity */}
          <div className="col-span-12 lg:col-span-6 card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="dot bg-sky-400"></span>
              <h4 className="font-semibold">Activity</h4>
            </div>
            {loading ? (
              <p className="text-mute">Loading...</p>
            ) : error ? (
              <p className="text-rose-500">{error}</p>
            ) : activities.length === 0 ? (
              <p className="text-mute italic">No activities yet</p>
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
      <ReviewNotesModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
    </ProtectedRoute>
  );
}
