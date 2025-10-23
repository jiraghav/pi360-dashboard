"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import TaskModal from "./TaskModal"; // adjust path if needed
import { apiRequest } from "../utils/api";

export default function Tasks() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [toCIC, setToCIC] = useState([]);
  const [fromCIC, setFromCIC] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const data = await apiRequest("get_tasks.php"); // replace with your API endpoint
      setToCIC(data.toCIC || []);
      setFromCIC(data.fromCIC || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      alert("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  // Mark task as done
  const markTaskDone = async (taskId) => {
    const confirmDone = confirm("Are you sure you want to mark this task as done?");
    if (!confirmDone) return;

    try {
      await apiRequest("update_task_status.php", {
        method: "POST",
        body: { task_id: taskId, status: 2 }, // 2 = done
      });
      alert("Task marked as done!");
      fetchTasks(); // refresh the task lists
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to mark task as done.");
    }
  };

  // Map status to label and color
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

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="text-center py-10">Loading tasks...</div>
        ) : (
          <section className="grid lg:grid-cols-2 gap-6">
            {/* To CIC */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">To CIC</h4>
                <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>
                  + Add Task
                </button>
              </div>
              {toCIC.length === 0 ? (
                <div className="text-center py-4 text-gray-400">No tasks yet</div>
              ) : (
                <ul className="divide-y divide-stroke/70">
                  {toCIC.map((task, i) => (
                    <li key={i} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {task.name} <span className="text-xs text-mute">· Case #{task.caseId}</span>
                        </div>
                        <div className="text-xs text-mute">{task.info}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Priority */}
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

                        {/* Status */}
                        {getStatusBadge(task.status)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* From CIC */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">From CIC</h4>
              </div>
              {fromCIC.length === 0 ? (
                <div className="text-center py-4 text-gray-400">No tasks yet</div>
              ) : (
                <ul className="divide-y divide-stroke/70">
                  {fromCIC.map((task, i) => (
                    <li key={i} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {task.name} <span className="text-xs text-mute">· Case #{task.caseId}</span>
                        </div>
                        <div className="text-xs text-mute">{task.info}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Priority */}
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

                        {/* Status */}
                        {getStatusBadge(task.status)}

                        {/* Mark Done button */}
                        {task.status === "1" && (
                          <button className="btn" onClick={() => markTaskDone(task.id)}>
                            Mark Done
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* Task Modal */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          onCreated={fetchTasks}
        />
      </main>
    </ProtectedRoute>
  );
}
