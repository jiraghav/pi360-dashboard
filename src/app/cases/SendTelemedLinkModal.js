"use client";

import { useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../utils/api";

export default function SendTelemedLinkModal({
  selectedCase,
  onClose,
  onConfirm,
  setSelectedCase,
  showPatientSelection
}) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = selectedCase ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCase]);

  /* Format phone as (XXX) XXX-XXXX */
  const formatPhone = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 10);
    if (digits.length > 6) return `(${p1}) ${p2}-${p3}`;
    if (digits.length > 3) return `(${p1}) ${p2}`;
    if (digits.length > 0) return `(${p1}`;
    return "";
  };

  const isValidUSPhone = (phone = "") =>
    phone.replace(/\D/g, "").length === 10;

  /* Load patients (same as TaskModal) */
  const loadPatients = async (inputValue, loadedOptions, { page }) => {
    try {
      const params = new URLSearchParams({ limit: 10, page: page || 1 });
      if (inputValue) params.append("search", inputValue);

      const data = await apiRequest(`cases.php?${params.toString()}`);

      return {
        options: (data.patients || []).map((p) => ({
          label: `${p.fname} ${p.lname}${
            p.dob ? ` — DOB: ${p.dob}` : ""
          }`,
          value: p,
        })),
        hasMore: page * 10 < (data.total || 0),
        additional: { page: (page || 1) + 1 },
      };
    } catch (err) {
      console.error("Failed to load patients", err);
      return { options: [], hasMore: false, additional: { page: 1 } };
    }
  };

  const activeCase = selectedCase || patient?.value;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeCase) {
      setError("Please select a patient.");
      return;
    }

    if (!isValidUSPhone(activeCase.phone_home || "")) {
      setError("Please enter a valid 10-digit US phone number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onConfirm({
        pid: activeCase.pid,
        phone: activeCase.phone_home,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Send Telemed Link</h4>
          <button
            type="button"
            onClick={onClose}
            className="badge cursor-pointer hover:bg-stroke/40"
          >
            Close
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          {showPatientSelection && (
            <AsyncPaginate
              placeholder="Select Patient"
              value={patient}
              loadOptions={loadPatients}
              onChange={(val) => {
                setPatient(val);
                if (val?.value) {
                  setSelectedCase(val.value);
                }
              }}
              required
              additional={{ page: 1 }}
              styles={{
                control: (p) => ({
                  ...p,
                  backgroundColor: "#0b0f16",
                  borderColor: "#1f2937",
                }),
                singleValue: (p) => ({ ...p, color: "white" }),
                input: (p) => ({ ...p, color: "white" }),
                placeholder: (p) => ({ ...p, color: "#9ca3af" }),
                option: (p) => ({
                  ...p,
                  color: "white",
                  backgroundColor: "black",
                }),
              }}
            />
          )}

          {/* Case Info */}
          {activeCase && activeCase.pid && (
            <p className="text-sm text-mute">
              Sending telemedicine schedule link for:
              <br />
              <strong className="text-white">
                {activeCase.fname} {activeCase.mname} {activeCase.lname}
              </strong>
              <br />
              DOB: {activeCase.dob}
            </p>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1 text-white">
              Patient Phone <span className="text-rose-500">*</span>
            </label>

            <input
              type="tel"
              required
              placeholder="(123) 456-7890"
              value={formatPhone(activeCase?.phone_home || "")}
              onChange={(e) =>
                setSelectedCase({
                  ...activeCase,
                  phone_home: formatPhone(e.target.value),
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />

            {error && (
              <p className="text-xs text-rose-500 mt-1">{error}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
