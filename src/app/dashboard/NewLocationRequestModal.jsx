"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function NewLocationRequestModal({ isOpen, onClose }) {
  const [locationName, setLocationName] = useState("");
  const [services, setServices] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("location", locationName);
      formData.append("speciality", services);
      formData.append("note", note);
  
      await apiRequest("create_location_request.php", {
        method: "POST",
        body: formData,
      });
      
      onClose();
  
      showToast("success", "Request submitted successfully!");
      setLocationName("");
      setServices("");
      setNote("");
    } catch (err) {
      showToast("error", err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="card max-w-lg w-full p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Request New Location</h4>
            <button className="badge" onClick={onClose}>
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
              placeholder="Enter Location / City Name"
              required
            />
            <input
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
              placeholder="Specialty or Services Needed"
              required
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
              rows={4}
              placeholder="Additional notes (optional)"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
