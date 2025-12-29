"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function CaseInfoModal({ isOpen, onClose, data, caseItem, onUpdated }) {
  if (!isOpen) return null;
  
  const { showToast } = useToast();

  const [limits, setLimits] = useState(data.limits || "");

  const [liability, setLiability] = useState(
    data.liability_cleared === "1" || data.liability_cleared === "0"
      ? data.liability_cleared
      : ""
  );
  const [liabilityNotes, setLiabilityNotes] = useState(data.liability_cleared_detail || "");

  const [policeReport, setPoliceReport] = useState(
    data.police_report === "1" || data.police_report === "0"
      ? data.police_report
      : ""
  );
  const [policeReportNotes, setPoliceReportNotes] = useState(data.police_report_detail || "");

  const [underinsured, setUnderinsured] = useState(
    data.underinsured === "1" || data.underinsured === "0"
      ? data.underinsured
      : ""
  );
  const [underinsuredNotes, setUnderinsuredNotes] = useState(data.underinsured_detail || "");

  const [uninsured, setUninsured] = useState(
    data.uninsured === "1" || data.uninsured === "0"
      ? data.uninsured
      : ""
  );
  const [uninsuredNotes, setUninsuredNotes] = useState(data.uninsured_detail || "");

  const handleSave = async () => {
    try {
      const payload = {
        pid_group: caseItem.pid_group,

        liability_cleared: liability === "" ? null : liability,
        liability_cleared_detail: liabilityNotes,
  
        limits,

        police_report: policeReport === "" ? null : policeReport,
        police_report_detail: policeReportNotes,
  
        underinsured: underinsured === "" ? null : underinsured,
        underinsured_detail: underinsuredNotes,
  
        uninsured: uninsured === "" ? null : uninsured,
        uninsured_detail: uninsuredNotes,
      };
      
      await apiRequest("update-case-info.php", {
        method: "POST",
        body: payload,
      });
      
      showToast("success", `Case Information successfully updated!`);
  
      onUpdated?.(); // refresh parent list/page
      onClose();     // close modal
    } catch (e) {
      console.error("Update Error:", e);
    }
  };

  const radioGroupInline = (state, setState) => (
    <div className="flex items-center gap-4 ml-3 text-gray-200">
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="radio"
          checked={state === "1"}
          onChange={() => setState("1")}
        />
        Yes
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="radio"
          checked={state === "0"}
          onChange={() => setState("0")}
        />
        No
      </label>
    </div>
  );

  const textareaInput = (value, onChange) => (
    <textarea
      placeholder="More Information"
      className="w-full mt-2 bg-white/10 border border-white/20 rounded px-3 py-2 text-white h-20 
      placeholder-gray-400 focus:outline-none focus:border-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-xl p-6 rounded-xl bg-[#0c1017] shadow-xl border border-stroke">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Edit Case Information</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">

          {/* 1. LIABILITY CLEARED */}
          <div>
            <div className="flex items-center">
              <label className="text-sm text-gray-300 font-medium">Liability Cleared</label>
              {radioGroupInline(liability, setLiability)}
            </div>
            {textareaInput(liabilityNotes, setLiabilityNotes)}
          </div>

          {/* 2. LIMITS */}
          <div>
            <label className="text-sm text-gray-300 font-medium">Limits</label>
            <input
              type="number"
              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-3 py-2 
              text-white focus:outline-none focus:border-blue-500"
              value={limits}
              placeholder="Enter Limits"
              onChange={(e) => setLimits(e.target.value)}
            />
          </div>

          {/* 3. POLICE REPORT */}
          <div>
            <div className="flex items-center">
              <label className="text-sm text-gray-300 font-medium">Police Report</label>
              {radioGroupInline(policeReport, setPoliceReport)}
            </div>
            {textareaInput(policeReportNotes, setPoliceReportNotes)}
          </div>

          {/* 4. UNDERINSURED */}
          <div>
            <div className="flex items-center">
              <label className="text-sm text-gray-300 font-medium">Underinsured</label>
              {radioGroupInline(underinsured, setUnderinsured)}
            </div>
            {textareaInput(underinsuredNotes, setUnderinsuredNotes)}
          </div>

          {/* 5. UNINSURED */}
          <div>
            <div className="flex items-center">
              <label className="text-sm text-gray-300 font-medium">Uninsured</label>
              {radioGroupInline(uninsured, setUninsured)}
            </div>
            {textareaInput(uninsuredNotes, setUninsuredNotes)}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>

          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
