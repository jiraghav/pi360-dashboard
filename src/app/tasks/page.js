"use client";

import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Tasks() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const toCIC = [
    {
      name: "Bill Thomas",
      caseId: "5678",
      info: "Connected · Today",
      priority: "URGENT",
      color: "rose-300",
    },
    {
      name: "Tom Garcia",
      caseId: "56789",
      info: "Due Apr 26",
      priority: "MEDIUM",
      color: "amber-300",
    },
  ];

  const fromCIC = [
    {
      name: "David Wilson",
      caseId: "34557",
      info: "Orthopedic · Today",
      priority: "MEDIUM",
    },
  ];

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="grid lg:grid-cols-2 gap-6">
          {/* To CIC */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">To CIC</h4>
              <button
                className="btn btn-primary"
                onClick={() => setTaskModalOpen(true)}
              >
                + Add Task
              </button>
            </div>
            <ul className="divide-y divide-stroke/70">
              {toCIC.map((task, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {task.name} <span className="text-xs text-mute">· Case #{task.caseId}</span>
                    </div>
                    <div className="text-xs text-mute">{task.info}</div>
                  </div>
                  <span className={`badge text-${task.color}`}>{task.priority}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* From CIC */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">From CIC</h4>
              <div className="badge">Sent: 1–20</div>
            </div>
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
                    <span className={`badge text-amber-300`}>{task.priority}</span>
                    <button className="btn">Mark Done</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Task Modal */}
        {taskModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="card max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Add Task</h4>
                <button className="badge" onClick={() => setTaskModalOpen(false)}>
                  Close
                </button>
              </div>
              <div className="space-y-3">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke"
                  placeholder="Title"
                />
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke"
                  rows={4}
                  placeholder="Description"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-sky-500"
                    checked={sendEmail}
                    onChange={() => setSendEmail(!sendEmail)}
                  />
                  <span>Send email notification</span>
                </label>
                {sendEmail && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke"
                      placeholder="Email to"
                    />
                    <input
                      className="px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke"
                      placeholder="CC"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button className="btn" onClick={() => setTaskModalOpen(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary">Create Task</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
