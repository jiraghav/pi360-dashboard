"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function GlobalCaseTeamModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { showToast } = useToast();

  const [form, setForm] = useState({
    lawyer_emails: [],
    paralegal_emails: [],
    case_manager_emails: [],
  });
  
  const [lawFirms, setLawFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState("");

  const [lawyerEmail, setLawyerEmail] = useState("");
  const [paralegalEmail, setParalegalEmail] = useState("");
  const [caseManagerEmail, setCaseManagerEmail] = useState("");

  const [lawyerError, setLawyerError] = useState("");
  const [paralegalError, setParalegalError] = useState("");
  const [caseManagerError, setCaseManagerError] = useState("");

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
  useEffect(() => {
    if (!isOpen) {
      setSelectedFirm("");
      setLawyerEmail("");
      setParalegalEmail("");
      setCaseManagerEmail("");
      setLawFirms([]);
      setForm({
        lawyer_emails: [],
        paralegal_emails: [],
        case_manager_emails: [],
      });
      return;
    }
  
    const fetchLawFirms = async () => {
      setLoading(true);
      setError("");
  
      try {
        const res = await apiRequest("get_user_law_firms.php");
        const firms = res?.data || [];
  
        setLawFirms(firms);
  
        if (firms.length === 1) {
          setSelectedFirm(firms[0].id);
        } else {
          setSelectedFirm("");
        }
        
        setLoading(false);
  
      } catch (err) {
        setError(err.message || "Failed to load law firms");
        setLoading(false);
      }
    };
  
    fetchLawFirms();
  }, [isOpen]);
  
  useEffect(() => {
    if (!selectedFirm) return;

    const fetchTeam = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest(
          `case_manager_emails.php?law_firm_id=${selectedFirm}`
        );

        setForm({
          lawyer_emails: data?.data.lawyer_emails || [],
          paralegal_emails: data?.data.paralegal_emails || [],
          case_manager_emails: data?.data.case_manager_emails || [],
        });

      } catch (err) {
        setError(err.message || "Failed to load case team");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [selectedFirm]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  const handleAddEmail = (e, type, value, setValue, setErrorMsg) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    const email = value.trim();

    if (!email) {
      setErrorMsg("Email cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg("Enter a valid email");
      return;
    }

    if (form[type].includes(email)) {
      setErrorMsg("Already added");
      return;
    }

    setForm(prev => ({
      ...prev,
      [type]: [...prev[type], email],
    }));

    setValue("");
    setErrorMsg("");
  };

  const handleRemoveEmail = (type, email) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter(e => e !== email),
    }));
  };

  const handleSave = async () => {
    try {
      await apiRequest("update_global_case_team.php", {
        method: "POST",
        body: {
          law_firm_id: selectedFirm,
          lawyer_emails: form.lawyer_emails.join(","),
          paralegal_emails: form.paralegal_emails.join(","),
          case_manager_emails: form.case_manager_emails.join(","),
        },
      });
      
      showToast("success", "Global case team contacts updated successfully!");

      onClose();
    } catch (err) {
      setError(err.message || "Failed to update");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
      <div className="card max-w-2xl w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">
            Global Case Team Contacts
          </h4>
          <button className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-mute">Loading...</p>
        ) : error ? (
          <p className="text-rose-500">{error}</p>
        ) : (
          <div className="border border-gray-700 rounded-xl p-4 space-y-6">
            {lawFirms.length > 1 && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Select Law Firm
                </label>

                <select
                  value={selectedFirm}
                  onChange={(e) => setSelectedFirm(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-black text-white"
                >
                  <option value="">Select Law Firm</option>
                  {lawFirms.map((firm) => (
                    <option key={firm.id} value={firm.id}>
                      {firm.organization}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lawyer Emails */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Lawyer Emails
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {form.lawyer_emails.map((email, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                    {email}
                    <button
                      onClick={() => handleRemoveEmail("lawyer_emails", email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="email"
                value={lawyerEmail}
                onChange={(e) => {
                  setLawyerEmail(e.target.value);
                  if (lawyerError) setLawyerError("");
                }}
                onKeyDown={(e) =>
                  handleAddEmail(e, "lawyer_emails", lawyerEmail, setLawyerEmail, setLawyerError)
                }
                placeholder="Type email and press Enter"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />

              {lawyerError && (
                <p className="text-xs text-red-400 mt-1">{lawyerError}</p>
              )}
            </div>

            {/* Paralegal Emails */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Paralegal Emails
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {form.paralegal_emails.map((email, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                    {email}
                    <button
                      onClick={() => handleRemoveEmail("paralegal_emails", email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="email"
                value={paralegalEmail}
                onChange={(e) => {
                  setParalegalEmail(e.target.value);
                  if (paralegalError) setParalegalError("");
                }}
                onKeyDown={(e) =>
                  handleAddEmail(e, "paralegal_emails", paralegalEmail, setParalegalEmail, setParalegalError)
                }
                placeholder="Type email and press Enter"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />

              {paralegalError && (
                <p className="text-xs text-red-400 mt-1">{paralegalError}</p>
              )}
            </div>

            {/* Case Manager Emails */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Case Manager Emails
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {form.case_manager_emails.map((email, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                    {email}
                    <button
                      onClick={() => handleRemoveEmail("case_manager_emails", email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="email"
                value={caseManagerEmail}
                onChange={(e) => {
                  setCaseManagerEmail(e.target.value);
                  if (caseManagerError) setCaseManagerError("");
                }}
                onKeyDown={(e) =>
                  handleAddEmail(
                    e,
                    "case_manager_emails",
                    caseManagerEmail,
                    setCaseManagerEmail,
                    setCaseManagerError
                  )
                }
                placeholder="Type email and press Enter"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />

              {caseManagerError && (
                <p className="text-xs text-red-400 mt-1">{caseManagerError}</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}