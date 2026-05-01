"use client";

import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../utils/api";

const STATUS_FILTERS = [
  { value: "incomplete", label: "Not completed" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

function formatDateTime(value) {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  if (!s) return "—";
  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RequestedRecordsModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState("incomplete");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest(
        `requested_records_list.php?status=${encodeURIComponent(filter)}`
      );
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load requested records.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, filter]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    load();
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen) {
      setFilter("incomplete");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="card max-w-4xl w-full p-0 relative overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-labelledby="requested-records-title"
      >
        <div className="sticky top-0 z-20 bg-card border-b border-stroke/60 shrink-0">
          <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
            <h4
              id="requested-records-title"
              className="font-semibold text-lg text-white"
            >
              Requested records
            </h4>
            <button
              type="button"
              className="badge hover:bg-rose-500/10 hover:text-rose-400 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="flex flex-wrap gap-2 px-6 pb-4 items-center">
            <span className="text-sm text-mute mr-1">Status</span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition
                  ${
                    filter === f.value
                      ? "bg-indigo-500 text-white shadow"
                      : "bg-muted text-mute hover:bg-muted/70"
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-mute">
              Loading…
            </div>
          ) : error ? (
            <p className="text-rose-500">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-mute italic text-center py-8">
              No requested records found.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((item) => {
                const p = item.patient || {};
                const name = [p.fname, p.mname, p.lname].filter(Boolean).join(" ");
                return (
                  <li
                    key={item.task_id}
                    className="rounded-xl border border-stroke/60 bg-muted/30 px-4 py-3 flex flex-wrap items-start gap-3 justify-between"
                  >
                    <div className="flex-1 min-w-0 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                      <div>
                        <div className="text-xs text-mute">Patient</div>
                        <div className="font-medium text-white">{name || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-mute">Record type</div>
                        <div className="text-white">{item.record_type || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-mute">Requested</div>
                        <div className="text-white">
                          {formatDateTime(item.requested_at)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-mute">Completed</div>
                        <div className="text-white">
                          {formatDateTime(item.completed_at)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        item.task_status === "2"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {item.status_label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
