"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import TaskModal from "./TaskModal";
import { apiRequest } from "../utils/api";

export default function Tasks() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [toCIC, setToCIC] = useState([]);
  const [fromCIC, setFromCIC] = useState([]);
  const [showAllToCIC, setShowAllToCIC] = useState(false);
  const [showAllFromCIC, setShowAllFromCIC] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState("to");

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const statusParam = searchParams?.get("status") || "";

  useEffect(() => {
    fetchTasks();
  }, [statusParam]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const endpoint = statusParam
        ? `get_tasks.php?status=${encodeURIComponent(statusParam)}`
        : "get_tasks.php";
      const data = await apiRequest(endpoint);
      setToCIC(data.toCIC || []);
      setFromCIC(data.fromCIC || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      alert("Failed to load tasks.");
    } finally {
      setTimeout(function () {
        setLoading(false);
      }, 500);
    }
  }

  const markTaskDone = async (taskId) => {
    const confirmDone = confirm("Are you sure you want to mark this task as done?");
    if (!confirmDone) return;

    try {
      await apiRequest("update_task_status.php", {
        method: "POST",
        body: { task_id: taskId, status: 2 },
      });
      alert("Task marked as done!");
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to mark task as done.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "1":
        return <span className="badge text-blue-500">Pending</span>;
      case "2":
        return <span className="badge text-green-500">Done</span>;
      case "3":
        return <span className="badge text-yellow-400">In Progress</span>;
      default:
        return <span className="badge text-gray-400">Unknown</span>;
    }
  };

  // Helper to render each list
  function renderTaskList(type) {
    const isToCIC = type === "to";
    const data = isToCIC ? toCIC : fromCIC;
    const showAll = isToCIC ? showAllToCIC : showAllFromCIC;
    const toggleShowAll = isToCIC ? setShowAllToCIC : setShowAllFromCIC;
    const title = isToCIC ? "To CIC" : "From CIC";

    return (
      <>
        <div className="flex justify-between mb-3">
          <h4 className="font-semibold">
            {title}{" "}
            {statusParam && (
              <span className="text-sm text-mute">
                ({statusParam.charAt(0).toUpperCase() + statusParam.slice(1) + " only"})
              </span>
            )}
          </h4>
          {isToCIC && (
            <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>
              + Add Task
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No tasks yet</div>
        ) : (
          <>
            <ul className="divide-y divide-stroke/70">
              {(showAll ? data : data.slice(0, 3)).map((task, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {task.name}{" "}
                      <span className="text-xs text-mute">· Case #{task.caseId}</span>
                    </div>
                    <div className="text-xs text-mute">{task.info}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge text-${
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
                      <button className="btn" onClick={() => markTaskDone(task.id)}>
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

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="text-center py-10">Loading tasks...</div>
        ) : (
          <>
            {/* Mobile Tabs */}
            <div className="md:hidden">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium btn ${
                    mobileTab === "to"
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  onClick={() => setMobileTab("to")}
                >
                  To CIC
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium btn ${
                    mobileTab === "from"
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                  onClick={() => setMobileTab("from")}
                >
                  From CIC
                </button>
              </div>

              {/* Toggle Content */}
              <div className="card p-5">
                {mobileTab === "to" ? renderTaskList("to") : renderTaskList("from")}
              </div>
            </div>

            {/* Desktop Two-Column Layout */}
            <section className="hidden md:grid lg:grid-cols-2 gap-6">
              <div className="card p-5">{renderTaskList("to")}</div>
              <div className="card p-5">{renderTaskList("from")}</div>
            </section>
          </>
        )}
      </main>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreated={fetchTasks}
      />
    </ProtectedRoute>
  );
}
