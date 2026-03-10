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

  if (!selectedCase) return null;
  
  useEffect(() => {
    if (!selectedCase?.pid) return;

    const fetchFacilities = async () => {
      try {
        const details = await apiRequest(`/case_details.php?pid=${selectedCase.pid}`);

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
    if (facilities.length === 1) {
      setSelectedCase((prev) => ({
        ...prev,
        facilityPid: facilities[0].pid,
      }));
    }
  }, [facilities, setSelectedCase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await onConfirm();
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm mb-1 text-white">
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