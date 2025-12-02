"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function CaseDurationModal({ open, onClose, month, year }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Disable page scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Fetch patients
  useEffect(() => {
    if (!open || !month || !year) return;

    async function fetchPatients() {
      setLoading(true);
      setError("");

      try {
        const qs = new URLSearchParams({ month, year }).toString();
        const data = await apiRequest(`avg_case_duration_patients.php?${qs}`);

        setPatients(data.patients || []);
      } catch (err) {
        setError(err?.message || "Something went wrong");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, [open, month, year]);
  
  function formatMMDDYYYY(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${mm}/${dd}/${yyyy}`;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-2xl w-full p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">
            Patients – {month}/{year}
          </h4>
          <button className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-mute">Loading patients...</p>
        ) : error ? (
          <p className="text-rose-500">{error}</p>
        ) : patients.length === 0 ? (
          <p className="text-mute italic">No patients found</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-stroke/20">
                <tr>
                  <th className="text-left py-2 px-2">Patient</th>
                  <th className="text-left py-2 px-2">Referral</th>
                  <th className="text-left py-2 px-2">Settled</th>
                  <th className="text-left py-2 px-2">Days</th>
                </tr>
              </thead>
          
              <tbody>
                {patients.map((p, i) => {
                  const referralDate = p.referral_date ? new Date(p.referral_date) : null;
                  const settledDate = p.settled_date ? new Date(p.settled_date) : null;
          
                  const referralFormatted = formatMMDDYYYY(p.referral_date);
                  const settledFormatted = formatMMDDYYYY(p.settled_date);
          
                  let diffDays = "-";
                  if (referralDate && settledDate) {
                    const diffMs = settledDate - referralDate;
                    diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                  }
          
                  return (
                    <tr key={i} className="border-b border-stroke/30">
                      <td className="py-2 px-2 font-medium">
                        {p.fname} {p.lname}
                      </td>
                      <td className="py-2 px-2 text-mute">{referralFormatted}</td>
                      <td className="py-2 px-2 text-mute">{settledFormatted}</td>
                      <td className="py-2 px-2">{diffDays}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
