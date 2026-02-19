"use client";

import { useState, useEffect } from "react";
import { CalendarDays, DollarSign, Activity } from "lucide-react";

export default function UpdateBillingModal({
  section,
  onClose,
  onConfirm,
}) {
  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const [form, setForm] = useState({
    visits: section?.visits || "",
    last_visit: toInputDate(section?.last_visit),
    next_visit: toInputDate(section?.next_visit),
    missed_visit: toInputDate(section?.missed_visit),
    balance: section?.balance || "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = section ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [section]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl bg-[#0b0f16] border border-gray-700 text-white text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 " +
    "transition-all placeholder:text-gray-500";

  const labelClass = "text-xs text-gray-400 mb-1 block";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onConfirm({
        pid: section.pid,
        ...form,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6 rounded-2xl shadow-xl border border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-semibold text-lg">
            Update Visits & Billing
          </h4>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-400 mb-4">
          Facility: <strong className="text-white">{section.fac_name}</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">

            {/* Visits */}
            <div>
              <label className={labelClass}>Number of visits</label>
              <div className="relative">
                <Activity className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  value={form.visits}
                  onChange={(e) => handleChange("visits", e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="Enter visits"
                />
              </div>
            </div>

            {/* Balance */}
            <div>
              <label className={labelClass}>Bill ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  value={form.balance}
                  onChange={(e) => handleChange("balance", e.target.value)}
                  className={`${inputClass} pl-9`}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            {/* Last Visit */}
            <div>
              <label className={labelClass}>Last Visit</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={form.last_visit}
                  onChange={(e) => handleChange("last_visit", e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Next Visit */}
            <div>
              <label className={labelClass}>Next Visit</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={form.next_visit}
                  onChange={(e) => handleChange("next_visit", e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Missed Visit */}
            <div className="col-span-2">
              <label className={labelClass}>Missed Visit</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={form.missed_visit}
                  onChange={(e) => handleChange("missed_visit", e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow-md"
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
