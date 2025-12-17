"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { apiRequest } from "../../utils/api";
import { useToast } from "../../hooks/ToastContext";
import useFetchOptions from "../../hooks/useFetchOptions";
import PatientFormFields from "./PatientFormFields";

export default function NewPatientForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const { lawyers, caseTypes, languages, states, caseManagerEmails } = useFetchOptions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCase, setSelectedCase] = useState({});

  const formRef = useRef(null);
  const fnameRef = useRef(null);

  useEffect(() => {
    fnameRef.current?.focus();
  }, []);

  const handleSubmit = async (redirectToReferral = false) => {
    const formEl = formRef.current;

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(formEl);
      
      const caseManagers = formData.get("case_manager_emails"); // hidden field name

      if (!caseManagers || caseManagers.trim() === "") {
        showToast("error", "Please add at least one case manager before continuing.");
        return;
      }
      
      formData.append("create_patient_only", redirectToReferral ? "0" : "1");

      const response = await apiRequest("create_patient.php", {
        method: "POST",
        body: formData,
      });

      let message = "Patient created successfully!";
      
      if (response.case_manager_emails_updated) {
        message += " Case manager was also added or updated to your profile.";
      }
      
      showToast("success", message);

      if (redirectToReferral) {
        router.push(`/referrals/new?pid=${response.pid}`);
      } else {
        router.push("/cases");
      }
    } catch (err) {
      showToast("error", err.message || "Failed to create patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card p-6">
      <h3 className="text-xl font-semibold mb-6">New Patient</h3>

      <form
        ref={formRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
      <PatientFormFields
        fnameRef={fnameRef}
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
        lawyers={lawyers}
        caseTypes={caseTypes}
        languages={languages}
        states={states}
        caseManagerEmails={caseManagerEmails}
      />

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-end gap-3 mt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className={`btn btn-primary px-4 py-2 w-full md:w-auto ${
              isSubmitting ? "cursor-not-allowed opacity-75" : ""
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Patient"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className={`btn btn-primary px-4 py-2 w-full md:w-auto ${
              isSubmitting ? "cursor-not-allowed opacity-75" : ""
            }`}
          >
            {isSubmitting ? "Processing..." : "Create & Send Referral"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard");
              }
            }}
            className="btn w-full md:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
