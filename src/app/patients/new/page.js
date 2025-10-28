"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { apiRequest } from "../../utils/api";

export default function NewPatient() {
  const router = useRouter();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const from = searchParams?.get("from") || null;

  const [form, setForm] = useState({
    fname: "",
    lname: "",
    dob: "",
    doi: "",
    gender: "",
    lawyer_id: "",
    phone: "",
    case_type_id: "",
  });

  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch lawyers
  useEffect(() => {
    async function fetchLawyers() {
      try {
        const lawyersData = await apiRequest("getLawyers.php");
        setLawyers(lawyersData.lawyers || []);
      } catch (err) {
        console.error("Failed to load lawyers", err);
      }
    }
    fetchLawyers();
  }, []);

  // Fetch case types
  useEffect(() => {
    async function fetchCaseTypes() {
      try {
        const caseData = await apiRequest("getCaseTypeOptions.php");
        setCaseTypes(caseData.options || []);
      } catch (err) {
        console.error("Failed to load case types", err);
      }
    }
    fetchCaseTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) {
        alert(`Please fill in the ${key.replace("_", " ")} field.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await apiRequest("create_patient.php", {
        method: "POST",
        body: formData,
      });
      alert("Patient created successfully!");

      if (from === "referral") {
        router.push(`/referrals/new?pid=${response.pid}`);
      } else {
        router.push("/cases");
      }
    } catch (err) {
      alert("Failed to create patient: " + err.message);
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            {/* First Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                First Name *
              </label>
              <input
                type="text"
                name="fname"
                value={form.fname}
                onChange={handleChange}
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
                value={form.lname}
                onChange={handleChange}
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
                value={form.dob}
                onChange={handleChange}
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
                value={form.doi}
                onChange={handleChange}
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
                value={form.gender}
                onChange={handleChange}
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
                value={form.lawyer_id}
                onChange={handleChange}
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
              {/* Case Type */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Case Type *
                </label>
                <select
                  name="case_type_id"
                  value={form.case_type_id}
                  onChange={handleChange}
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

              {/* Phone Number */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                  className="w-full border rounded px-3 py-2 bg-black text-white"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary px-4 py-2 ${
                  isSubmitting ? "cursor-not-allowed opacity-75" : ""
                }`}
              >
                {isSubmitting
                  ? "Creating..."
                  : from === "referral"
                  ? "Create & Send Referral"
                  : "Create"}
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
                className="btn"
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
