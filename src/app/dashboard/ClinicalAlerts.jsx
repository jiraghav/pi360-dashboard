"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api"; // adjust if needed

export default function ClinicalAlerts({
  alerts,
  loading,
  error,
}) {
  const [alertList, setAlertList] = useState(alerts || []);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // ✅ Keep alertList in sync with latest alerts prop
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setAlertList(alerts);
    }
  }, [alerts]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "3":
        return <span className="badge text-rose-500">HIGH</span>;
      case "2":
        return <span className="badge text-amber-300">MEDIUM</span>;
      default:
        return <span className="badge text-green-400">LOW</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "1":
        return <span className="badge text-blue-500">Pending</span>;
      case "2":
        return <span className="badge text-green-500">Done</span>;
      default:
        return <span className="badge text-gray-400">Unknown</span>;
    }
  };

  const markTaskDone = async (taskId) => {
    const confirmDone = confirm("Are you sure you want to mark this task as done?");
    if (!confirmDone) return;

    try {
      await apiRequest("update_task_status.php", {
        method: "POST",
        body: { task_id: taskId, status: 2 },
      });
      setAlertList((prev) =>
        prev.map((a) => (a.id === taskId ? { ...a, status: "2" } : a))
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to mark task as done.");
    }
  };

  return (
    <div className="col-span-12 lg:col-span-6 card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="dot bg-rose-500"></span>
          <h4 className="font-semibold">Clinical Alerts</h4>
        </div>
      </div>

      {loading ? (
        <p className="text-mute">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : alertList.length === 0 ? (
        <p className="text-mute italic">No clinical alerts</p>
      ) : (
        <>
          <ul className="divide-y divide-stroke/70">
            {(showAllAlerts ? alertList : alertList.slice(0, 3)).map(
              (alert, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {alert.name}{" "}
                      <span className="text-xs text-mute">
                        · Case #{alert.caseId}
                      </span>
                    </div>
                    <div className="text-xs text-mute">{alert.info}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getPriorityBadge(alert.priority)}
                    {getStatusBadge(alert.status)}

                    {alert.status === "1" && (
                      <button
                        className="btn"
                        onClick={() => markTaskDone(alert.id)}
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>

          {alertList.length > 3 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="btn btn-sm btn-outline"
              >
                {showAllAlerts ? "Show Less" : "View All"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
