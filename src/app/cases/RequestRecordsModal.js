"use client";

import { useState, useEffect } from "react";

export default function RequestRecordsModal({
  selectedCase,
  onClose,
  onConfirm,
  setSelectedCase,
}) {
  const [loading, setLoading] = useState(false);

  // Disable body scroll + Escape key to close
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

  const handleConfirm = async () => {
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={(e) => {
        if (e.target.id === "requestRecordsModal") onClose();
      }}
    >
      <div className="card max-w-lg w-full p-6 shadow-xl rounded-2xl bg-[#111827] border border-stroke">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg text-white">Request Records</h4>
          <button
            onClick={onClose}
            className="badge cursor-pointer hover:bg-red-500 hover:text-white transition"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
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

          {/* Form Field */}
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
              onClick={onClose}
              className="btn border border-stroke text-white hover:bg-gray-700 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Request Records"}
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
