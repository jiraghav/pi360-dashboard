"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

export default function SendIntakeLinkModal({
  selectedCase,
  onClose,
  onConfirm,
  setSelectedCase,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = selectedCase ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCase]);

  if (!selectedCase) return null;

  // Format phone as (XXX) XXX-XXXX
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);
    if (digits.length > 6) return `(${part1}) ${part2}-${part3}`;
    if (digits.length > 3) return `(${part1}) ${part2}`;
    if (digits.length > 0) return `(${part1}`;
    return "";
  };

  const isValidUSPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidUSPhone(selectedCase.phone_home || "")) {
      setError("Please enter a valid 10-digit US phone number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onConfirm({
        phone: selectedCase.phone_home,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="sendIntakeLinkModal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm flex"
    >
      <div className="card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Send Intake Link</h4>
          <button
            onClick={onClose}
            className="badge cursor-pointer hover:bg-stroke/40"
          >
            Close
          </button>
        </div>
  
        {/* Case Info */}
        <p className="text-sm text-mute mb-4">
          Sending intake link for:
          <br />
          <strong className="text-white">
            {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
          </strong>
          <br />
          DOB: {selectedCase.dob}
        </p>
  
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Editable Phone */}
          <div>
            <label
              htmlFor="phone_home"
              className="block text-sm mb-1 text-white"
            >
              Patient Phone <span className="text-rose-500">*</span>
            </label>
  
            <input
              id="phone_home"
              type="tel"
              required
              placeholder="(123) 456-7890"
              value={formatPhone(selectedCase.phone_home || "")}
              onChange={(e) =>
                setSelectedCase({
                  ...selectedCase,
                  phone_home: formatPhone(e.target.value),
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white placeholder:text-mute"
            />
  
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>
  
          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
