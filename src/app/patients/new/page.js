"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { apiRequest } from "../../utils/api";
import { useToast } from "../../hooks/ToastContext";

export default function NewPatient() {
  const router = useRouter();
  const { showToast } = useToast();

  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);
  const fnameRef = useRef(null);

  useEffect(() => {
    fnameRef.current?.focus();
  }, []);

  useEffect(() => {
    async function fetchLawyers() {
      try {
        const res = await apiRequest("getLawyers.php");
        setLawyers(res.lawyers || []);
      } catch (err) {
        console.error("Failed to load lawyers", err);
      }
    }
    fetchLawyers();
  }, []);

  useEffect(() => {
    async function fetchCaseTypes() {
      try {
        const res = await apiRequest("getCaseTypeOptions.php");
        setCaseTypes(res.options || []);
      } catch (err) {
        console.error("Failed to load case types", err);
      }
    }
    fetchCaseTypes();
  }, []);

  const handleSubmit = async (redirectToReferral = false) => {
    const formEl = formRef.current;

    // ✅ Use built-in browser validation
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(formEl);

      const response = await apiRequest("create_patient.php", {
        method: "POST",
        body: formData,
      });

      showToast("success", "Patient created successfully!");

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
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-3xl mx-auto space-y-8">
        <section className="card p-6">
          <h3 className="text-xl font-semibold mb-6">New Patient</h3>

          <form
            ref={formRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            {/* First Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                First Name *
              </label>
              <input
                ref={fnameRef}
                type="text"
                name="fname"
                required
                placeholder="Enter First Name"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Last Name *
              </label>
              <input
                type="text"
                name="lname"
                required
                placeholder="Enter Last Name"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dob"
                required
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />
            </div>

            {/* DOI */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Date of Injury *
              </label>
              <input
                type="date"
                name="doi"
                required
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Gender *
              </label>
              <select
                name="gender"
                required
                className="w-full border rounded px-3 py-2 bg-black text-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Lawyer */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Law Firm *
              </label>
              <select
                name="lawyer_id"
                required
                className="w-full border rounded px-3 py-2 bg-black text-white"
              >
                <option value="">Select Law Firm</option>
                {lawyers.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.organization}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Type + Phone */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Case Type *
                </label>
                <select
                  name="case_type_id"
                  required
                  className="w-full border rounded px-3 py-2 bg-black text-white"
                >
                  <option value="">Select Case Type</option>
                  {caseTypes.map((type) => (
                    <option key={type.option_id} value={type.option_id}>
                      {type.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Enter phone number"
                  className="w-full border rounded px-3 py-2 bg-black text-white"
                />
              </div>
            </div>

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
      </main>
    </ProtectedRoute>
  );
}
