"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function NewReferralModal({ isOpen, onClose }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchReferrals = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("referrals_list.php?filter=new");
        setReferrals(data.referrals || []);
      } catch (err) {
        setError(err.message || "Failed to load new referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount or close
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">New Referrals</h4>
          <button className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-mute">Loading referrals...</p>
        ) : error ? (
          <p className="text-rose-500">{error}</p>
        ) : referrals.length === 0 ? (
          <p className="text-mute italic">No new referrals found</p>
        ) : (
          <ul className="divide-y divide-stroke/70 max-h-[60vh] overflow-y-auto">
            {referrals.map((r, i) => (
              <li key={i} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.patient_name || "-"}</div>
                    <div className="text-xs text-mute">
                      Refer To: {r.refer_to || "-"}
                    </div>
                    {r.note && (
                      <div className="text-xs mt-2 bg-slate-900/50 rounded p-2">
                        {r.note}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-mute whitespace-nowrap">
                    {r.referral_date
                      ? new Date(r.referral_date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
