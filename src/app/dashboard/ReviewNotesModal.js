"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

const ITEMS_PER_PAGE = 5;

const TABS = [
  { key: "all", label: "All" },
  { key: "unreviewed", label: "Unreviewed" },
  { key: "reviewed", label: "Reviewed" }
];

export default function ReviewNotesModal({ isOpen, onClose, pid, fetchDashboard }) {
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("unreviewed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  // Reset page on open / pid / tab change
  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen, pid, activeTab]);

  // Fetch notes
  useEffect(() => {
    if (!isOpen) return;

    const fetchNotes = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiRequest("review_notes.php", {
          method: "POST",
          body: {
            pid,
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            status: activeTab // 👈 all | reviewed | unreviewed
          }
        });

        setNotes(res?.result?.data || []);
        setTotal(res?.result?.total || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [isOpen, currentPage, pid, activeTab]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  
  const markAsReviewed = async (noteId) => {
    if (!noteId) return;

    setUpdatingId(noteId);

    try {
      await apiRequest("mark_review_note.php", {
        method: "POST",
        body: { note_id: noteId }
      });

      // Optimistic UI update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, reviewed: "1" } : n
        )
      );
      
      if (fetchDashboard) {
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark note as reviewed.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full p-0 relative overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card border-b border-stroke/60">
          <div className="px-6 py-4 flex items-center justify-between">
            <h4 className="font-semibold text-lg">Review Notes</h4>
            <button
              className="badge hover:bg-rose-500/10 hover:text-rose-400 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pb-3">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition
                  ${
                    activeTab === tab.key
                      ? "bg-indigo-500 text-white shadow"
                      : "bg-muted text-mute hover:bg-muted/70"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-mute">
              Loading notes…
            </div>
          ) : error ? (
            <p className="text-rose-500">{error}</p>
          ) : notes.length === 0 ? (
            <p className="text-mute italic text-center py-8">
              No notes found
            </p>
          ) : (
            <ul className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {notes.map((note, index) => {
                const isEven = index % 2 === 0;

                return (
                  <li
                    key={note.id}
                    className={`
                      relative rounded-xl border border-stroke/60 transition
                      ${isEven ? "bg-card/90" : "bg-muted/40"}
                      hover:bg-card
                    `}
                  >
                    <span
                      className={`
                        absolute left-0 top-0 h-full w-1 rounded-l-xl
                        ${isEven ? "bg-indigo-400/60" : "bg-amber-400/60"}
                      `}
                    />

                    <div className="pl-4 pr-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium leading-relaxed text-sm">
                          {note.body || "Untitled Note"}
                        </p>

                        <span className="text-xs text-mute whitespace-nowrap pt-0.5">
                          {note.date}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        {note.name && (
                          <span className="text-xs text-amber-300">
                            Patient: {note.name}
                          </span>
                        )}
                      
                        {/* Action */}
                        {note.reviewed == "1" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                            Reviewed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => markAsReviewed(note.id)}
                            disabled={updatingId === note.id}
                            className={`
                              text-xs px-3 py-1 rounded-full font-medium transition
                              ${
                                updatingId === note.id
                                  ? "bg-muted text-mute cursor-wait"
                                  : "bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25"
                              }
                            `}
                          >
                            {updatingId === note.id ? "Marking…" : "Mark Reviewed"}
                          </button>
                        )}
                      </div>

                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="sticky bottom-0 bg-card px-6 py-3 border-t border-stroke/60 flex items-center justify-between">
            <button
              className={`badge transition ${
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-muted"
              }`}
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
            >
              ← Prev
            </button>

            <span className="text-xs text-mute">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </span>

            <button
              className={`badge transition ${
                currentPage === totalPages
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-muted"
              }`}
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
