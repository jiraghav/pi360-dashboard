"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api"; // adjust if needed
import { formatDate } from "../utils/formatter"; // adjust if needed
import { useRouter } from "next/navigation";
import TaskNotificationModal from "../components/TaskNotificationModal";

export default function ClinicalAlerts({
  alerts,
  loading,
  error,
  reloadDashboard
}) {
  const [alertList, setAlertList] = useState(alerts || []);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const router = useRouter();
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // ✅ Keep alertList in sync with latest alerts prop
  useEffect(() => {
    if (alerts && alerts.length >= 0) {
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
    }
  };
  
  const onViewProfile = (a) => {
    if (!a?.patient_name) return;

    const query = encodeURIComponent(a.patient_name);
    router.push(`/cases?search=${query}`);
  };
  
  const onOpenTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  return (
    <div className="col-span-12 lg:col-span-6 card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="dot bg-rose-500"></span>
          <h4 className="font-semibold">From CIC Tasks</h4>
        </div>
      </div>

      {loading ? (
        <p className="text-mute">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : alertList.length === 0 ? (
        <p className="text-mute italic">No From CIC Tasks</p>
      ) : (
        <>
          <ul className="divide-y divide-stroke/70">
            {(showAllAlerts ? alertList : alertList.slice(0, 3)).map(
              (alert, i) => (
                <li key={i} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="font-medium flex items-center gap-1 flex-wrap">
                        <span
                          onClick={() => onOpenTask(alert)}
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          {alert.title || "Untitled Task"}
                        </span>
                      {alert.caseId && (
                        <span className="text-xs text-mute">· Case #{alert.caseId}</span>
                      )}
                    </div>
                
                    {/* Description / info line */}
                    {alert.description && (
                      <div className="text-sm text-gray-400 mt-0.5 whitespace-pre-line">
                        {alert.description}
                      </div>
                    )}
                
                    {/* Patient and time info */}
                    <div className="text-xs text-mute mt-1 flex items-center gap-2 flex-wrap">
                      {alert.patient_name && (
                        <span
                          onClick={() => onViewProfile(alert)}
                          className="truncate text-blue-600 hover:underline cursor-pointer flex items-center"
                        >
                          👤 {alert.patient_name}
                        </span>
                      )}
                      {alert.created_at && (
                        <span>🕒 {formatDate(alert.created_at)}</span>
                      )}
                    </div>
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
          
          <TaskNotificationModal
            open={taskModalOpen}
            onClose={() => {
              setTaskModalOpen(false);
              setSelectedTask(null);
            }}
            notification={
              selectedTask
                ? {
                    task_id: selectedTask.id,
                    case_id: selectedTask.caseId,
                    patient_name: selectedTask.patient_name,
                    task_title: selectedTask.title,
                    status: selectedTask.status,
                    priority: selectedTask.priority,
                    task_description: selectedTask.description,
                    created_at: selectedTask.created_at,
                    task_type: selectedTask.type,
                  }
                : null
            }
            fetchNotifications={reloadDashboard}
            onMarkDone={reloadDashboard}
          />
        </>
      )}
    </div>
  );
}
