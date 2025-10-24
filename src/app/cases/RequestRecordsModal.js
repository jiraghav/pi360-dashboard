"use client";

import { useState } from "react";

export default function RequestRecordsModal({
  selectedCase,
  onClose,
  onConfirm,
  setSelectedCase,
}) {
  const [loading, setLoading] = useState(false);

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
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
    >
      <div className="card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Request Records</h4>
          <button onClick={onClose} className="badge cursor-pointer">
            Close
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-mute">
            Are you sure you want to request records for:
            <br />
            <strong className="text-white">
              {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
            </strong>
            <br />
            DOB: {selectedCase.dob}
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
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white placeholder:text-mute"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Request Records"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
