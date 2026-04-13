"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api"; // adjust if needed
import { formatDate } from "../utils/formatter"; // adjust if needed
import { useRouter } from "next/navigation";
import TaskNotificationModal from "../components/TaskNotificationModal";
import DocumentNotificationModal from "../components/DocumentNotificationModal";

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
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);

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
      case "4":
        return <span className="badge text-emerald-500">Accepted</span>;
      case "5":
        return <span className="badge text-red-500">Declined</span>;
      default:
        return <span className="badge text-gray-400">Unknown</span>;
    }
  };

  const hasDocument = (alert) =>
    !!(
      alert?.document_id ||
      alert?.documentId ||
      alert?.document_url ||
      alert?.documentUrl ||
      alert?.file_url ||
      alert?.fileUrl ||
      alert?.url
    );

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

  const onOpenDocument = (alert) => {
    const documentId = alert?.document_id || alert?.documentId || null;
    const documentUrl = alert?.document_url || alert?.documentUrl || alert?.file_url || alert?.fileUrl || alert?.url || null;

    if (!documentId && !documentUrl) return;

    setSelectedDocument({
      id: alert?.notification_id || alert?.id || 0,
      document_id: documentId,
      document_url: documentUrl,
      patient_name: alert?.patient_name,
      case_id: alert?.caseId,
    });
    setDocumentModalOpen(true);
  };
  
  const handleAuthorization = async (taskId, action) => {
    const confirmMsg =
      action === 4
        ? "Are you sure you want to accept this authorization?"
        : "Are you sure you want to decline this authorization?";

    if (!confirm(confirmMsg)) return;

    try {
      await apiRequest("update_authorization.php", {
        method: "POST",
        body: {
          task_id: taskId,
          status: action,
        },
      });

      reloadDashboard();
    } catch (err) {
      console.error("Authorization update failed:", err);
    }
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

                  <div className="flex w-full sm:w-auto flex-wrap items-center justify-start sm:justify-end gap-2">
                    {hasDocument(alert) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline w-full sm:w-auto"
                        onClick={() => onOpenDocument(alert)}
                      >
                        View Document
                      </button>
                    )}
                    {getPriorityBadge(alert.priority)}
                    {getStatusBadge(alert.status)}

                    {alert.authorization == "1" ? (
                      alert.status === "1" && (
                        <>
                          <button
                            className="btn btn-success flex-1 sm:flex-none min-w-[110px]"
                            onClick={() => handleAuthorization(alert.id, 4)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-danger flex-1 sm:flex-none min-w-[110px]"
                            onClick={() => handleAuthorization(alert.id, 5)}
                          >
                            Decline
                          </button>
                        </>
                      )
                    ) : (
                      alert.status === "1" && (
                        <button
                          className="btn w-full sm:w-auto"
                          onClick={() => markTaskDone(alert.id)}
                        >
                          Mark Done
                        </button>
                      )
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
                    task_authorization: selectedTask.authorization,
                    document_id: selectedTask.document_id || selectedTask.documentId,
                    document_url:
                      selectedTask.document_url ||
                      selectedTask.documentUrl ||
                      selectedTask.file_url ||
                      selectedTask.fileUrl ||
                      selectedTask.url,
                  }
                : null
            }
            fetchNotifications={reloadDashboard}
            onMarkDone={reloadDashboard}
          />

          <DocumentNotificationModal
            open={documentModalOpen}
            onClose={() => {
              setDocumentModalOpen(false);
              setSelectedDocument(null);
            }}
            notification={selectedDocument}
          />
        </>
      )}
    </div>
  );
}
