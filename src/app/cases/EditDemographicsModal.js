"use client";

import { useState, useEffect, useRef } from "react";
import PatientFormFields from "../patients/new/PatientFormFields";
import useFetchOptions from "../hooks/useFetchOptions";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function EditDemographicsModal({
  selectedCase,
  setSelectedCase,
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const formRef = useRef(null);
  const fnameRef = useRef(null);

  const { showToast } = useToast();
  const { lawyers, caseTypes, languages, states, lawyerEmails: globalCaseTeamEmails } = useFetchOptions({
    fetchLawyers: true,
    fetchCaseTypes: true,
    fetchLanguages: true,
    fetchStates: true,
    fetchLawyerEmails: true,
  });
  const { lawyerEmails: patientCaseTeamEmails } = useFetchOptions({
    fetchLawyerEmails: true,
    pid: selectedCase?.pid
  });

  useEffect(() => {
    if (!selectedCase?.pid) return;

    const loadPatient = async () => {
      setFetching(true);
      try {
        const data = await apiRequest(
          `get_patient.php?pid=${selectedCase.pid}`
        );

        setSelectedCase((prev) => ({
          ...prev,
          ...data.patient,
        }));
      } catch (e) {
        console.error("Failed to load patient", e);
      } finally {
        setFetching(false);
      }
    };

    loadPatient();
  }, [selectedCase?.pid]);

  useEffect(() => {
    if (selectedCase) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCase]);

  if (!selectedCase) return null;

  const handleConfirm = async () => {
    const formEl = formRef.current;

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    
    const caseManagers = selectedCase.case_manager_emails;
    const hasPatientTeamEmails =
      (Array.isArray(selectedCase?.lawyer_emails) && selectedCase.lawyer_emails.length > 0) ||
      (typeof selectedCase?.lawyer_emails === "string" && selectedCase.lawyer_emails.trim() !== "") ||
      (Array.isArray(selectedCase?.paralegal_emails) && selectedCase.paralegal_emails.length > 0) ||
      (typeof selectedCase?.paralegal_emails === "string" && selectedCase.paralegal_emails.trim() !== "") ||
      (Array.isArray(caseManagers) && caseManagers.length > 0) ||
      (typeof caseManagers === "string" && caseManagers.trim() !== "");
    const usePatientCaseTeam =
      selectedCase?.use_patient_case_team === true ||
      selectedCase?.use_patient_case_team === 1 ||
      selectedCase?.use_patient_case_team === "1" ||
      hasPatientTeamEmails;

    const hasCaseManager =
      Array.isArray(caseManagers)
        ? caseManagers.length > 0
        : typeof caseManagers === "string" && caseManagers.trim() !== "";

    if (usePatientCaseTeam && !hasCaseManager) {
      showToast("error", "Please add at least one case manager before saving.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(formEl);
      formData.append('pid_group', selectedCase.pid_group);

      let response = await apiRequest("update_patient.php", {
        method: "POST",
        body: formData,
      });
      
      let message = "Patient updated successfully!";
      
      showToast("success", message);

      await onConfirm(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="EditDemographicsModal"
      className="fixed inset-0 bg-black/60 p-2 md:p-4 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={(e) => e.target.id === "EditDemographicsModal" && onClose()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    >
      {/* Modal container */}
      <div className="bg-[#111827] border border-stroke rounded-2xl shadow-xl w-full max-w-4xl p-4 md:p-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-5 gap-2 md:gap-0">
          <h4 className="text-lg md:text-xl font-semibold text-white">
            {selectedCase?.pid ? "Edit Patient" : "Add New Patient"}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="badge px-3 py-1 cursor-pointer transition self-start md:self-auto"
          >
            Close
          </button>
        </div>

        {/* Form content with scroll */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {fetching && (
            <p className="text-gray-300 mb-2">Loading patient details...</p>
          )}

          {!fetching && (
            <form
              ref={formRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              <PatientFormFields
                selectedCase={selectedCase}
                setSelectedCase={setSelectedCase}
                fnameRef={fnameRef}
                lawyers={lawyers}
                caseTypes={caseTypes}
                languages={languages}
                states={states}
                lawyerEmails={globalCaseTeamEmails}
                patientCaseTeamEmails={patientCaseTeamEmails}
              />

              {/* Buttons */}
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="btn border border-stroke text-white hover:bg-gray-700 transition w-full md:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50 w-full md:w-auto"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
