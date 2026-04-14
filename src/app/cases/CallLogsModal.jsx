"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Search,
} from "lucide-react";
import { apiRequest } from "../utils/api";

function formatDuration(durationSeconds) {
  const total = Number(durationSeconds);
  if (!Number.isFinite(total) || total <= 0) return "";
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatStartTime(startTime) {
  if (!startTime) return "";
  const parsed = parseStartTime(startTime);
  if (Number.isNaN(parsed.getTime())) return String(startTime);
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(value) {
  if (!value) return "";
  const raw = String(value);
  const digits = raw.replace(/\D+/g, "");

  const ten = digits.length === 10 ? digits : digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : "";
  if (!ten) return raw;

  const area = ten.slice(0, 3);
  const mid = ten.slice(3, 6);
  const last = ten.slice(6);
  return `(${area}) ${mid}-${last}`;
}

function dispositionBadgeClass(disposition) {
  const value = String(disposition || "").toLowerCase();
  if (value === "answered") return "bg-green-600/20 border-green-500/40 text-green-200";
  if (value === "missed") return "bg-red-600/20 border-red-500/40 text-red-200";
  if (value === "voicemail") return "bg-yellow-600/20 border-yellow-500/40 text-yellow-200";
  if (value === "declined") return "bg-orange-600/20 border-orange-500/40 text-orange-200";
  return "bg-white/10 border-white/20 text-gray-200";
}

function getInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function dateLabel(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((d - today) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

function parseStartTime(startTime) {
  if (!startTime) return null;
  const raw = String(startTime).trim().replace(" ", "T");
  const hasExplicitTimezone = /(?:Z|[+\-]\d{2}:\d{2}|[+\-]\d{4})$/.test(raw);
  const normalized = hasExplicitTimezone ? raw : `${raw}Z`; // treat DB timestamps as UTC when tz is missing
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTypeLabel(direction, disposition) {
  const dir = String(direction || "").toLowerCase();
  const disp = String(disposition || "").toLowerCase();
  if (disp === "missed") return "Missed call";
  if (disp === "voicemail") return "Voicemail";
  if (dir === "outbound") return "Outgoing call";
  if (dir === "inbound") return "Incoming call";
  return "Call";
}

function getIcon(direction, disposition) {
  const dir = String(direction || "").toLowerCase();
  const disp = String(disposition || "").toLowerCase();
  if (disp === "missed") return PhoneMissed;
  if (dir === "outbound") return PhoneOutgoing;
  return PhoneIncoming;
}

function iconWrapClass(direction, disposition) {
  const dir = String(direction || "").toLowerCase();
  const disp = String(disposition || "").toLowerCase();
  if (disp === "answered") return "bg-green-500/15 border-green-500/30 text-green-200";
  if (disp === "missed") return "bg-red-500/15 border-red-500/30 text-red-200";
  if (disp === "voicemail") return "bg-yellow-500/15 border-yellow-500/30 text-yellow-200";
  if (disp === "declined") return "bg-orange-500/15 border-orange-500/30 text-orange-200";
  if (dir === "outbound") return "bg-blue-500/15 border-blue-500/30 text-blue-200";
  return "bg-purple-500/15 border-purple-500/30 text-purple-200";
}

export default function CallLogsModal({ caseItem, pid_group, onClose }) {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | missed | answered | voicemail
  const [query, setQuery] = useState("");

  const patientName = useMemo(() => {
    const fname = caseItem?.fname || "";
    const lname = caseItem?.lname || "";
    return `${fname} ${lname}`.trim();
  }, [caseItem]);

  const stats = useMemo(() => {
    const rows = Array.isArray(callLogs) ? callLogs : [];
    const total = rows.length;
    const answered = rows.filter((r) => (r.final_disposition || "") === "answered").length;
    const missed = rows.filter((r) => (r.final_disposition || "") === "missed").length;
    const voicemail = rows.filter((r) => (r.final_disposition || "") === "voicemail").length;
    const inbound = rows.filter((r) => String(r.direction || "").toLowerCase() === "inbound").length;
    const outbound = rows.filter((r) => String(r.direction || "").toLowerCase() === "outbound").length;
    return { total, answered, missed, voicemail, inbound, outbound };
  }, [callLogs]);

  const filteredLogs = useMemo(() => {
    const rows = Array.isArray(callLogs) ? callLogs : [];
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      const disp = String(r.final_disposition || "").toLowerCase();
      if (filter !== "all" && disp !== filter) return false;

      if (!q) return true;
      const haystack = [
        r.from_name,
        r.from_number,
        r.to_name,
        r.to_number,
        r.direction,
        r.final_disposition,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [callLogs, filter, query]);

  const grouped = useMemo(() => {
    const rows = filteredLogs
      .map((r) => ({
        ...r,
        _date: parseStartTime(r.start_time),
      }))
      .sort((a, b) => {
        const at = a._date ? a._date.getTime() : 0;
        const bt = b._date ? b._date.getTime() : 0;
        return bt - at;
      });

    const groups = [];
    let lastKey = "";

    for (const row of rows) {
      const label = dateLabel(row._date);
      const key = label || "__unknown__";
      if (key !== lastKey) {
        groups.push({ key, label: label || "Unknown date", items: [] });
        lastKey = key;
      }
      groups[groups.length - 1].items.push(row);
    }

    return groups;
  }, [filteredLogs]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const fetchCallLogs = async () => {
    if (!pid_group && !caseItem?.pid) return;

    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (pid_group) query.set("pid_group", pid_group);
      else query.set("pid", String(caseItem.pid));
      query.set("limit", "50");

      const data = await apiRequest(`/call_logs.php?${query.toString()}`);
      setCallLogs(Array.isArray(data.call_logs) ? data.call_logs : []);
    } catch (e) {
      setError(e?.message || "Failed to load call logs");
      setCallLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid_group, caseItem?.pid]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-3xl rounded-xl bg-[#0c1017] shadow-xl border border-stroke overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-semibold">
                {getInitials(patientName) || "?"}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-semibold text-white leading-tight">Call History</h4>
                <p className="text-xs text-mute mt-1 truncate">
                  {patientName || "Patient"} · {stats.total} calls
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchCallLogs}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition disabled:opacity-60"
                disabled={loading}
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
              Answered: {stats.answered}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
              Missed: {stats.missed}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
              Voicemail: {stats.voicemail}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
              Inbound: {stats.inbound}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">
              Outbound: {stats.outbound}
            </span>
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "missed", label: "Missed" },
                { key: "answered", label: "Answered" },
                { key: "voicemail", label: "Voicemail" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                    filter === t.key
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-200"
                      : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search number, name..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {loading && <p className="text-mute text-sm">Loading call history...</p>}
          {!loading && error && <p className="text-red-300 text-sm">{error}</p>}
          {!loading && !error && filteredLogs.length === 0 && (
            <p className="text-mute text-sm">No calls found.</p>
          )}

          {!loading && !error && grouped.length > 0 && (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.key}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs text-white/70 font-medium">{group.label}</div>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="space-y-2">
                    {group.items.map((log) => {
                      const direction = String(log.direction || "").toLowerCase();
                      const disp = log.final_disposition || "";
                      const Icon = getIcon(direction, disp);
                      const typeText = getTypeLabel(direction, disp);
                      const durationText = formatDuration(log.duration_seconds);

                      const primary =
                        direction === "outbound"
                          ? log.to_name || formatPhone(log.to_number) || log.to_number || "Unknown"
                          : log.from_name || formatPhone(log.from_number) || log.from_number || "Unknown";

                      const secondary =
                        direction === "outbound"
                          ? formatPhone(log.to_number) || log.to_number || ""
                          : formatPhone(log.from_number) || log.from_number || "";

                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        >
                          <div
                            className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${iconWrapClass(
                              direction,
                              disp
                            )}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm text-white font-medium truncate">
                                  {primary}
                                </div>
                                <div className="text-xs text-mute truncate">
                                  {typeText}
                                  {secondary ? ` · ${secondary}` : ""}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-xs text-gray-200">
                                  {formatStartTime(log.start_time)}
                                </div>
                                <div className="mt-1 flex items-center justify-end gap-2">
                                  {durationText && (
                                    <span className="inline-flex items-center gap-1 text-xs text-white/70">
                                      <Clock className="w-3 h-3" />
                                      {durationText}
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${dispositionBadgeClass(
                                      disp
                                    )}`}
                                  >
                                    {disp || "unknown"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 text-[11px] text-white/55">
                              {formatPhone(log.from_number) || log.from_number || "?"} →{" "}
                              {formatPhone(log.to_number) || log.to_number || "?"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
