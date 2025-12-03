"use client";

import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { apiRequest } from "../utils/api";

export default function TaskNotificationModal({
  open,
  onClose,
  notification,
  onMarkDone,
  fetchNotifications
}) {
  // ---------------------------
  // HOOKS (Always at top)
  // ---------------------------
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Fetch notes when modal opens
  useEffect(() => {
    if (!open || !notification?.task_id) return;

    const fetchNotes = async () => {
      setLoadingNotes(true);

      try {
        const data = await apiRequest(
          `get-task-notes.php?task_id=${notification.task_id}&notification_id=${notification.id}`
        );

        setNotes(data.notes || []);
        
        fetchNotifications();
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [open, notification?.task_id]);

  // ---------------------------
  // EARLY RETURN (after hooks!)
  // ---------------------------
  if (!open || !notification) return null;

  // ---------------------------
  // HELPERS
  // ---------------------------
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

  const getPriorityBadge = (priority) => {
    return (
      <span
        className={`badge text-${
          priority == 3
            ? "rose-500"
            : priority == 2
            ? "amber-300"
            : "green-400"
        }`}
      >
        {priority == 3 ? "HIGH" : priority == 2 ? "MEDIUM" : "LOW"}
      </span>
    );
  };

  const handleMarkDone = async () => {
    if (!confirm("Are you sure you want to mark this task as done?")) return;

    setLoading(true);
    try {
      await onMarkDone(notification.task_id);
      onClose();
    } catch (e) {
      console.error("Failed to mark done:", e);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Notification Details</h4>

          <button type="button" className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Patient */}
        {notification.case_id !== "0" && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Patient</div>

            <div className="font-semibold text-white text-base">
              {notification.patient_name || "Unknown Patient"}
            </div>

            <div className="text-xs text-gray-500">
              Case ID: {notification.case_id}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Title</div>
          <div className="text-lg font-semibold text-white">
            {notification.task_title}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Description</div>
          <div className="text-lg font-semibold text-white">
            {notification.task_description || "No description provided."}
          </div>
        </div>

        {/* Status & Priority */}
        <div className="flex items-center gap-6 mb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Status</div>
            {getStatusBadge(notification.status)}
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Priority</div>
            {getPriorityBadge(notification.priority)}
          </div>
        </div>

        {/* Created Time */}
        <div className="text-xs text-gray-500 border-t border-stroke pt-3 mb-4">
          Created:{" "}
          {moment(notification.created_at).format("MMM DD, YYYY • hh:mm A")}
        </div>

        {/* ---------------------------- */}
        {/* NOTES LIST */}
        {/* ---------------------------- */}
        <div className="border-t border-white/10 pt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-white text-base">Task Notes</h5>
          </div>

          {loadingNotes ? (
            <div className="text-gray-400 text-sm">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-gray-500 text-sm">No notes found.</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-2 bg-white/5 rounded border border-white/10"
                >
                  <div className="text-sm text-white">{note.note}</div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {moment(note.created_at).format("MMM DD, YYYY • hh:mm A")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mark as Done */}
        {notification.status !== "2" && notification.task_type == 2 && (
          <button
            className="btn btn-primary w-full mt-2"
            onClick={handleMarkDone}
            disabled={loading}
          >
            {loading ? "Processing..." : "Mark as Done"}
          </button>
        )}
      </div>
    </div>
  );
}
