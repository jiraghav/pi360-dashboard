"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import TaskNotificationModal from "../components/TaskNotificationModal";
import TaskModal from "./TaskModal";
import { apiRequest } from "../utils/api";
import { formatDate } from "../utils/formatter";
import { useSearchParams } from "next/navigation";
import { useToast } from "../hooks/ToastContext";
import { useRouter } from "next/navigation";

export default function TasksContent() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [toCIC, setToCIC] = useState([]);
  const [fromCIC, setFromCIC] = useState([]);
  const [loadingToCIC, setLoadingToCIC] = useState(true);
  const [loadingFromCIC, setLoadingFromCIC] = useState(true);
  const [showAllToCIC, setShowAllToCIC] = useState(false);
  const [showAllFromCIC, setShowAllFromCIC] = useState(false);
  const [mobileTab, setMobileTab] = useState("to");
  const router = useRouter();
  
  const { showToast } = useToast();

  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status") || "";
  const patientNameParam = searchParams?.get("patient") || "";
  
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchToCIC();
    fetchFromCIC();
  }, [statusParam, patientNameParam]);

  // ---- Separate Fetch Functions ----
  async function fetchToCIC() {
    setLoadingToCIC(true);
    try {
      const endpoint = statusParam || patientNameParam
        ? `get_tasks_to_cic.php?status=${encodeURIComponent(statusParam)}&patient=${encodeURIComponent(patientNameParam)}`
        : "get_tasks_to_cic.php";
      const data = await apiRequest(endpoint);
      setToCIC(data.data || []);
    } catch (err) {
      console.error("Failed to load To CIC tasks:", err);
    } finally {
      setTimeout(() => setLoadingToCIC(false), 400);
    }
  }

  async function fetchFromCIC() {
    setLoadingFromCIC(true);
    try {
      const endpoint = statusParam || patientNameParam
        ? `get_tasks_from_cic.php?status=${encodeURIComponent(statusParam)}&patient=${encodeURIComponent(patientNameParam)}`
        : "get_tasks_from_cic.php";
      const data = await apiRequest(endpoint);
      setFromCIC(data.data || []);
    } catch (err) {
      console.error("Failed to load From CIC tasks:", err);
    } finally {
      setTimeout(() => setLoadingFromCIC(false), 400);
    }
  }

  // ---- Update Status ----
  const markTaskDone = async (taskId) => {
    if (!confirm("Are you sure you want to mark this task as done?")) return;
    try {
      await apiRequest("update_task_status.php", {
        method: "POST",
        body: { task_id: taskId, status: 2 },
      });
      showToast("success", "Task marked as done!");
      fetchFromCIC(); // only refresh fromCIC list
    } catch (err) {
      console.error("Failed to update task:", err);
      showToast("error", "Failed to mark task as done.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "1":
        return <span className="badge whitespace-nowrap text-blue-500">Pending</span>;
      case "2":
        return <span className="badge whitespace-nowrap text-green-500">Done</span>;
      case "3":
        return <span className="badge whitespace-nowrap text-yellow-400">In Progress</span>;
      default:
        return <span className="badge whitespace-nowrap text-gray-400">Unknown</span>;
    }
  };
  
  const onViewProfile = (p) => {
    if (!p?.patient_name) return;

    const query = encodeURIComponent(p.patient_name);
    router.push(`/cases?search=${query}`);
  };

  // ---- Render Shared UI ----
  function renderTaskList(type) {
    const isToCIC = type === "to";
    const data = isToCIC ? toCIC : fromCIC;
    const loading = isToCIC ? loadingToCIC : loadingFromCIC;
    const showAll = isToCIC ? showAllToCIC : showAllFromCIC;
    const toggleShowAll = isToCIC ? setShowAllToCIC : setShowAllFromCIC;
    const title = isToCIC ? "To CIC" : "From CIC";
    const refresh = isToCIC ? fetchToCIC : fetchFromCIC;

    return (
      <>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold">
            {title}{" "}
            {(statusParam || patientNameParam) && (
              <span className="text-sm text-mute">
                (
                {statusParam &&
                  `${statusParam.charAt(0).toUpperCase() + statusParam.slice(1)} only`}
                {statusParam && patientNameParam && " • "}
                {patientNameParam && `Patient: ${patientNameParam}`}
                )
              </span>
            )}
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="btn btn-sm btn-outline flex items-center gap-1"
              title="Refresh tasks"
            >
              🔄 <span className="hidden sm:inline">Refresh</span>
            </button>
            {isToCIC && (
              <button
                className="btn btn-primary btn-sm flex items-center gap-1"
                onClick={() => setTaskModalOpen(true)}
              >
                + Add Task
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-6 text-gray-400 animate-pulse">
            Loading tasks...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No tasks yet</div>
        ) : (
          <>
            <ul className="divide-y divide-stroke/70">
              {(showAll ? data : data.slice(0, 3)).map((task, i) => (
                <li
                  key={i}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <div className="font-medium flex items-center gap-1 flex-wrap">
                        <span
                          onClick={() => onOpenTask(task)}
                          className="cursor-pointer text-blue-600 hover:underline"
                        >
                          {task.title || "Untitled Task"}
                        </span>
                        {task.caseId && (
                          <span className="text-xs text-mute">· Case #{task.caseId}</span>
                        )}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-400 mt-0.5 whitespace-pre-line">
                        {task.description}
                      </div>
                    )}
                    <div className="text-xs text-mute mt-1 flex items-center gap-2 flex-wrap">
                      {task.patient_name && (
                        <span
                          onClick={() => onViewProfile(task)}
                          className="truncate text-blue-600 hover:underline cursor-pointer flex items-center"
                        >
                          👤 {task.patient_name}
                        </span>
                      )}
                      {task.created_at && (
                        <span>🕒 {formatDate(task.created_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge whitespace-nowrap text-${
                        task.priority == 3
                          ? "rose-500"
                          : task.priority == 2
                          ? "amber-300"
                          : "green-400"
                      }`}
                    >
                      {task.priority == 3
                        ? "HIGH"
                        : task.priority == 2
                        ? "MEDIUM"
                        : "LOW"}
                    </span>
                    {getStatusBadge(task.status)}
                    {!isToCIC && task.status === "1" && (
                      <button
                        className="btn btn-sm"
                        onClick={() => markTaskDone(task.id)}
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {data.length > 3 && (
              <div className="text-center mt-3">
                <button
                  onClick={() => toggleShowAll(!showAll)}
                  className="btn btn-sm btn-outline"
                >
                  {showAll ? "Show Less" : "View All"}
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  }
  
  const onOpenTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Mobile Tabs */}
        <div className="md:hidden">
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium btn ${
                mobileTab === "to" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setMobileTab("to")}
            >
              To CIC
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium btn ${
                mobileTab === "from" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setMobileTab("from")}
            >
              From CIC
            </button>
          </div>
          <div className="card p-5">
            {mobileTab === "to" ? renderTaskList("to") : renderTaskList("from")}
          </div>
        </div>

        {/* Desktop Layout */}
        <section className="hidden md:grid lg:grid-cols-2 gap-6">
          <div className="card p-5">{renderTaskList("to")}</div>
          <div className="card p-5">{renderTaskList("from")}</div>
        </section>
      </main>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreated={fetchToCIC} // refresh only To CIC when new task added
      />
      
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
        }        fetchNotifications={() => {
          fetchToCIC();
          fetchFromCIC();
        }}
        onMarkDone={() => {
          fetchToCIC();
          fetchFromCIC();
        }}
      />
    </ProtectedRoute>
  );
}
