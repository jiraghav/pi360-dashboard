"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function ReviewNotesModal({ isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const data = await apiRequest("review_notes.php");
        setNotes(data.notes || []);
      } catch (err) {
        console.error("Error loading notes:", err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Review Notes</h4>
          <button className="badge" onClick={onClose}>Close</button>
        </div>

        {loading ? (
          <p className="text-mute">Loading notes...</p>
        ) : error ? (
          <p className="text-rose-500">{error}</p>
        ) : notes.length === 0 ? (
          <p className="text-mute italic">No notes to review</p>
        ) : (
          <ul className="divide-y divide-stroke/70 max-h-[60vh] overflow-y-auto">
            {notes.map((note, i) => (
              <li key={i} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {note.body || "Untitled Note"}
                  </div>
                  <span className="text-xs text-mute">{note.date}</span>
                </div>
                {note.name && (
                  <div className="text-xs text-amber-300 mt-1">
                    Patient: {note.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
