"use client";

import { useState, useEffect } from "react";

export default function UploadDocumentModal({ selectedCase, onClose, onConfirm }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState(selectedCase.doc_type); // default LOP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = selectedCase ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCase]);

  if (!selectedCase) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected && selected.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("doc_type", docType); // 👈 added
      formData.append("document", file);

      await onConfirm(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">Upload Document</h4>
          <button onClick={onClose} className="badge cursor-pointer hover:bg-stroke/40">
            Close
          </button>
        </div>

        {/* Case Info */}
        <p className="text-sm text-mute mb-4">
          Uploading document for:
          <br />
          <strong className="text-white">
            {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
          </strong>
          <br />
          DOB: {selectedCase.dob}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm mb-1 text-white">
              Document Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
              required
            >
              <option value="">Select Document Type</option>
              <option value="id">ID</option>
              <option value="intake">Intake</option>
              <option value="oswestry_disability_index">Oswestry Disability Index</option>
              <option value="headache_disability_index">Headache Disability Index</option>
              <option value="duties_performed_under_duress">Duties Performed Under Duress at Work and Home</option>
              <option value="police_report">Police Report</option>
              <option value="liability_cleared">Liability Cleared</option>
              <option value="lop">LOP</option>
              <option value="mri_report">MRI Report</option>
              <option value="pain_report">Pain Report</option>
              <option value="ortho_report">Ortho Report</option>
              <option value="neuro_report">Neuro Report</option>
              <option value="chiro_report">Chiro Report</option>
              <option value="reduction">Reduction</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm mb-1 text-white">
              Select PDF File <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
