"use client";

import { useState, useEffect } from "react";

export default function SendMessageModal({
  selectedCase,
  onClose,
  onConfirm,
  setSelectedCase,
}) {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (selectedCase) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCase]);

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
      id="sendMessageModal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm flex"
    >
      <div className="card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Send Message</h4>
          <button
            onClick={onClose}
            className="badge cursor-pointer hover:bg-stroke/40"
          >
            Close
          </button>
        </div>

        {
          selectedCase?.pid && (
            <p className="text-sm text-mute mb-4">
              You are sending a message regarding:
              <br />
              <strong className="text-white">
                {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
              </strong>
              <br />
              DOB: {selectedCase.dob}
            </p>
          )
        }

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="message"
              className="block text-sm mb-1 text-white"
            >
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={selectedCase?.message || ""}
              placeholder="Type your message here..."
              required
              onChange={(e) =>
                setSelectedCase({ ...selectedCase, message: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white placeholder:text-mute"
            />
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
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
