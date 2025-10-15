"use client";

import { useState } from "react";

export default function SendMessageModal({ selectedCase, onClose, onConfirm, setSelectedCase }) {
  const [loading, setLoading] = useState(false);

  if (!selectedCase) return null;

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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="card"
        style={{
          width: "400px",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <h4>Send Message</h4>
        <p>
          You are sending a message regarding:
          <br />
          <strong>
            {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
          </strong>
          <br />
          DOB: {selectedCase.dob}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          {/* Message field */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="message"
              style={{ display: "block", marginBottom: "0.3rem" }}
            >
              Message <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={selectedCase.message || ""}
              placeholder="Type your message here..."
              required
              onChange={(e) =>
                setSelectedCase({ ...selectedCase, message: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: "#ccc" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{ backgroundColor: "#28a745", color: "white" }}
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
