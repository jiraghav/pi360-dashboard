"use client";

import { useState } from "react";

export default function RequestRecordsModal({ selectedCase, onClose, onConfirm, setSelectedCase }) {
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
        <h4>Request Records</h4>
        <p>
          Are you sure you want to request records for:
          <br />
          <strong>
            {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
          </strong>
          <br />
          DOB: {selectedCase.dob}
        </p>

        {/* Form for description */}
        <div style={{ marginTop: "1rem" }}>
          <label
            htmlFor="description"
            style={{ display: "block", marginBottom: "0.3rem" }}
          >
            Please add any specifics or description
          </label>
          <textarea
            id="description"
            rows={4}
            value={selectedCase.description || ""}
            placeholder="Please add any specifics or description"
            onChange={(e) =>
              setSelectedCase({ ...selectedCase, description: e.target.value })
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
            marginTop: "1rem",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={onClose}
            className="btn"
            style={{ backgroundColor: "#ccc" }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn"
            style={{ backgroundColor: "#007bff", color: "white" }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Request Records"}
          </button>
        </div>
      </div>
    </div>
  );
}
