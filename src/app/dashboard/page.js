"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiRequest("dashboard.php");
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <ProtectedRoute>
      <section>
        {/* Quick Actions */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <Link href="/referrals/new" className="btn primary">New Referral</Link>
            <Link href="/schedule" className="btn">Schedule Visit</Link>
            <Link href="/messages/compose" className="btn">Send Message</Link>
            <Link href="/tasks/new" className="btn">Create Task</Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>KPIs</h3>
          <div className="kpi-4" style={{ marginTop: '8px' }}>
            <div className="tile">
              <div className="label">Pending Referrals</div>
              <div className="value">{dashboardData?.pendingReferrals}</div>
            </div>
            <div className="tile">
              <div className="label">Active Cases</div>
              <div className="value">{dashboardData?.activeCases}</div>
            </div>
            <div className="tile">
              <div className="label">Today's Appointments</div>
              <div className="value">{dashboardData?.todaysAppointments}</div>
            </div>
            <div className="tile">
              <div className="label">Open Tasks</div>
              <div className="value">{dashboardData?.openTasks}</div>
            </div>
          </div>
        </div>

        {/* Priority Alerts & Recent Activity */}
        <div className="two" style={{ marginTop: '12px' }}>
          <div className="card">
            <h3>Priority Alerts</h3>
            <table>
              <tbody>
                  {dashboardData?.priorityAlerts && dashboardData.priorityAlerts.length > 0 ? (
                    dashboardData.priorityAlerts.map((alert, i) => (
                      <tr key={i}>
                        <td>{alert.text}</td>
                        <td>
                          <span className={`tag tag-${alert.type}`}>{alert.type}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center", color: "#999" }}>
                        No alerts available
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Recent Activity</h3>
            <table>
              <tbody>
                {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((activity, i) => (
                    <tr key={i}>
                      <td>{activity.text}</td>
                      <td>
                        <span className={`tag tag-${activity.status}`}>{activity.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#999" }}>
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
