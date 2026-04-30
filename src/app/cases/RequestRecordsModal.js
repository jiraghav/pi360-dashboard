"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

export default function RequestRecordsModal({
  selectedCase,
  onClose,
  onConfirm,
  setSelectedCase,
}) {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [affidavitFile, setAffidavitFile] = useState(null);
  const [affidavitError, setAffidavitError] = useState("");

  useEffect(() => {
    if (selectedCase) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCase, onClose]);

  useEffect(() => {
    if (!selectedCase?.pid) {
      setFacilities([]);
      return;
    }

    const fetchFacilities = async () => {
      try {
        const details = await apiRequest(
          `/case_details.php?pid=${selectedCase.pid}`
        );

        if (details?.data?.sections) {
          setFacilities(details.data.sections);
        }
      } catch (err) {
        console.error("Failed to load facilities", err);
      }
    };

    fetchFacilities();
  }, [selectedCase?.pid]);

  useEffect(() => {
    if (!selectedCase?.pid) return;
    if (facilities.length !== 1) return;
    setSelectedCase((prev) => {
      if (!prev) return prev;
      if (String(prev.facilityPid) === String(facilities[0].pid)) return prev;
      return { ...prev, facilityPid: facilities[0].pid };
    });
  }, [facilities, setSelectedCase, selectedCase?.pid]);

  useEffect(() => {
    setAffidavitFile(null);
    setAffidavitError("");
  }, [selectedCase?.pid]);

  if (!selectedCase) return null;

  const handleAffidavitChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setAffidavitFile(null);
      setAffidavitError("");
      return;
    }
    if (selected.type !== "application/pdf") {
      setAffidavitError("Only PDF files are allowed.");
      setAffidavitFile(null);
      e.target.value = "";
      return;
    }
    setAffidavitError("");
    setAffidavitFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.facilityPid || selectedCase.pid);
      formData.append("record_type", selectedCase.recordType);
      formData.append("note", selectedCase.description || "");
      if (affidavitFile) {
        formData.append("affidavit", affidavitFile);
      }
      await onConfirm(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="requestRecordsModal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm"
      onClick={(e) => {
        if (e.target.id === "requestRecordsModal") onClose();
      }}
    >
      <div className="card max-w-lg w-full p-6 shadow-xl rounded-2xl bg-[#111827] border border-stroke">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg text-white">Request Records</h4>
          <button
            type="button"
            onClick={onClose}
            className="badge cursor-pointer transition"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Info */}
          <p className="text-sm text-gray-300">
            Are you sure you want to request records for:
            <br />
            <strong className="text-white">
              {[selectedCase.fname, selectedCase.mname, selectedCase.lname]
                .filter(Boolean)
                .join(" ")}
            </strong>
            <br />
            DOB: {selectedCase.dob || "N/A"}
          </p>

          {facilities.length >= 1 && (
            <div>
              <label className="block text-sm mb-1 text-white">
                Facility <span className="text-red-500">*</span>
              </label>

              <select
                required
                value={selectedCase.facilityPid || ""}
                onChange={(e) =>
                  setSelectedCase({
                    ...selectedCase,
                    facilityPid: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Facility</option>

                {facilities.map((fac) => (
                  <option key={fac.pid} value={fac.pid}>
                    {fac.title} — {fac.fac_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Record Type */}
          <div>
            <label className="block text-sm mb-2 text-white">
              Record Type <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="recordType"
                  value="final"
                  required
                  checked={selectedCase.recordType === "final"}
                  onChange={(e) =>
                    setSelectedCase({
                      ...selectedCase,
                      recordType: e.target.value,
                    })
                  }
                  className="accent-blue-500"
                />
                Final Records
              </label>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="recordType"
                  value="interim"
                  required
                  checked={selectedCase.recordType === "interim"}
                  onChange={(e) =>
                    setSelectedCase({
                      ...selectedCase,
                      recordType: e.target.value,
                    })
                  }
                  className="accent-blue-500"
                />
                Interim Records
              </label>
            </div>
          </div>

          {/* Optional affidavit (same EMR document pipeline as other lawyer uploads) */}
          <div>
            <label className="block text-sm mb-1 text-white">
              Affidavit (optional)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleAffidavitChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white text-sm file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-700 file:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              PDF only. If attached, it is saved to the patient chart when the
              request is sent.
            </p>
            {affidavitError && (
              <p className="text-xs text-red-500 mt-1">{affidavitError}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm mb-1 text-white"
            >
              Please add any specifics or description
            </label>
            <textarea
              id="description"
              rows={4}
              value={selectedCase.description || ""}
              placeholder="Please add any specifics or description"
              onChange={(e) =>
                setSelectedCase({
                  ...selectedCase,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn border border-stroke text-white hover:bg-gray-700 transition"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Request Records"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
