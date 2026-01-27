"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiRequest } from "../utils/api";
import { Calendar, UserRound, ChevronDown, ChevronUp } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function SendToCICModal({ open, onClose }) {
  const [referralDate, setReferralDate] = useState(new Date());
  const [patients, setPatients] = useState([]);
  const [highlightedDates, setHighlightedDates] = useState([]); // 👈 added
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      fetchPatients(new Date());
      fetchHighlightedDates(new Date());
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [open]);

  const fetchPatients = async (date) => {
    setLoading(true);
    setError("");
    setPatients([]);
    try {
      const res = await apiRequest(
        `referral_patients.php?date=${date.toISOString().split("T")[0]}`
      );
      setPatients(res.referrals);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to fetch patient list. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Fetch all referral dates for highlighting
  const fetchHighlightedDates = async (date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await apiRequest(`referral_dates.php?year=${year}&month=${month}`);
      if (Array.isArray(res.dates)) {
        const parsed = res.dates.map((d) => {
          const [year, month, day] = d.split("-").map(Number);
          return new Date(year, month - 1, day); // local date
        });
        setHighlightedDates(parsed);
      }
    } catch (err) {
      console.error("Error fetching highlighted dates:", err);
    }
  };

  const handleDateChange = (date) => {
    setReferralDate(date);
    setDatePickerOpen(false);
    fetchPatients(date);
  };
  
  const onViewProfile = (p) => {
    if (!p?.patient_name) return;

    const query = encodeURIComponent(p.patient_name);
    router.push(`/cases?search=${query}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-2xl w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-white">Referrals Reference</h4>
          <button className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Collapsible Date Picker */}
        <div className="mb-6">

          <button
            onClick={() => setDatePickerOpen(!datePickerOpen)}
            className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-3 hover:bg-slate-700 transition"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-mint-400" />
              <span className="font-medium">
                Referral Date - {' '}
                {moment(referralDate).format("MM/DD/YYYY")}
              </span>
            </div>
            {datePickerOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              datePickerOpen
                ? "opacity-100 max-h-[420px] mt-3"
                : "opacity-0 max-h-0"
            } overflow-hidden`}
          >
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 shadow-inner p-2 flex justify-center items-center">
              <DatePicker
                selected={referralDate}
                onChange={handleDateChange}
                inline
                calendarClassName="dark-datepicker"
                highlightDates={[
                  {
                    "react-datepicker__day--highlighted-custom": highlightedDates,
                  },
                ]}
                onMonthChange={(d) => fetchHighlightedDates(d)} // 👈 refresh on month change
              />
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {loading ? (
            <p className="text-slate-400 text-sm">Loading patients...</p>
          ) : error ? (
            <p className="text-rose-500 text-sm">{error}</p>
          ) : patients.length > 0 ? (
            <ul className="space-y-2">
              {patients.map((p) => (
                <li
                  key={p.pid}
                  className="bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 transition"
                >
                  <div className="flex items-start gap-2">
                    <UserRound className="w-4 h-4 mt-0.5 text-mint-400 flex-shrink-0" />
                    <div className="flex items-start justify-between w-full">
                      <div>
                        <span className="font-medium text-slate-100">
                          {p.patient_name}
                        </span>
                  
                        <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                          <p>
                            <span className="text-slate-500">DOB:</span>{" "}
                            {p.dob || "N/A"}
                          </p>
                          <p>
                            <span className="text-slate-500">DOI:</span>{" "}
                            {p.doi || "N/A"}
                          </p>
                        </div>
                      </div>
                  
                      <button
                        onClick={() => onViewProfile(p)}
                        className="btn"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm text-center">
              No patients for this date.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
