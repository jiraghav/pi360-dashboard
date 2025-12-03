"use client";

import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { apiRequest } from "../utils/api";

export default function NoteNotificationModal({
  open,
  onClose,
  notification,
  fetchNotifications
}) {
  const [loadingNote, setLoadingNote] = useState(false);
  const [noteData, setNoteData] = useState(null);

  useEffect(() => {
    if (!open || !notification?.note_id) return;

    const fetchNote = async () => {
      setLoadingNote(true);

      try {
        const data = await apiRequest(
          `get-note-by-id.php?note_id=${notification.note_id}&notification_id=${notification.id}`
        );
        setNoteData(data.note || null);
        fetchNotifications(); // mark notification read
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setLoadingNote(false);
      }
    };

    fetchNote();
  }, [open, notification?.note_id]);

  if (!open || !noteData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">New Note</h4>
          <button type="button" className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Patient Info */}
        {notification.patient_name && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Patient</div>

            <div className="font-semibold text-white text-base">
              {notification.patient_name}
            </div>

            {notification.case_id && (
              <div className="text-xs text-gray-500">
                Case ID: {notification.case_id}
              </div>
            )}
          </div>
        )}

        {/* Note Text */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Note</div>

          {loadingNote ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="text-base text-white bg-white/5 p-3 rounded border border-white/10">
              {noteData?.body || "No note found."}
            </div>
          )}
        </div>

        {/* Created Time */}
        <div className="text-xs text-gray-500 border-t border-stroke pt-3">
          Added:{" "}
          {moment(noteData.date).format("MMM DD, YYYY • hh:mm A")}
        </div>

      </div>
    </div>
  );
}
