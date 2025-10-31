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
        const data = await apiRequest("referrals_list.php?filter=new"); // 🔹 API endpoint for new referrals
        setReferrals(data.referrals || []);
      } catch (err) {
        setError(err.message || "Failed to load new referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 rounded-xl w-full max-w-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center border-b border-stroke/60 pb-3 mb-4">
          <h3 className="text-lg font-semibold">New Referrals</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <p className="text-mute text-center py-4">Loading...</p>
        ) : error ? (
          <p className="text-rose-500 text-center py-4">{error}</p>
        ) : referrals.length === 0 ? (
          <p className="text-mute italic text-center py-4">No new referrals found</p>
        ) : (
          <div className="overflow-y-auto max-h-[60vh] space-y-3">
            {referrals.map((r, i) => (
              <div
                key={i}
                className="flex justify-between items-start bg-slate-800 rounded-lg p-4"
              >
                {/* Left: Patient Info */}
                <div>
                  <div className="font-semibold text-base">{r.patient_name || "-"}</div>
                  <div className="text-sm text-mute">
                    Refer To: {r.refer_to || "-"} 
                  </div>
                  {r.note && (
                    <div className="mt-2 text-sm bg-slate-900/50 rounded p-2">
                      {r.note}
                    </div>
                  )}
                </div>
          
                {/* Right: Referral Date */}
                <div className="text-sm text-mute text-right whitespace-nowrap">
                  {r.referral_date
                    ? new Date(r.referral_date).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
