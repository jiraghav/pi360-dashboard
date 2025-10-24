"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../../utils/api";

export default function NewReferral() {
  const router = useRouter();
  const [form, setForm] = useState({
    patient: null,
    refer_to: "",
    priority_level: "",
    lawyer_id: "",
    notes: "",
    attachment: null,
  });
  const [referOptions, setReferOptions] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const referData = await apiRequest("getReferOptions.php");
        setReferOptions(referData.options || []);
        const lawyersData = await apiRequest("getLawyers.php");
        setLawyers(lawyersData.lawyers || []);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    }
    fetchDropdowns();
  }, []);

  const loadPatients = async (inputValue, loadedOptions, { page }) => {
    try {
      const params = new URLSearchParams({ limit: 10, page: page || 1 });
      if (inputValue) params.append("search", inputValue);

      const data = await apiRequest(`cases.php?${params.toString()}`);
      const newOptions = (data.patients || []).map((p) => ({
        label: `${p.fname} ${p.lname}`,
        value: p.pid,
      }));

      return {
        options: newOptions,
        hasMore: (page * 10) < (data.total || 0),
        additional: { page: (page || 1) + 1 },
      };
    } catch (err) {
      console.error("Error loading patients:", err);
      return { options: [], hasMore: false, additional: { page: page || 1 } };
    }
  };

  const handlePatientChange = (selected) =>
    setForm((prev) => ({ ...prev, patient: selected }));
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "attachment" ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      alert("Please select a patient.");
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("form_pid", form.patient.value);
      formData.append("refer_to", form.refer_to);
      formData.append("priority_level", form.priority_level);
      formData.append("lawyer_id", form.lawyer_id);
      formData.append("referral_detail", form.notes);
      if (form.attachment) formData.append("referral_attachment", form.attachment);

      await apiRequest("create_referral.php", { method: "POST", body: formData });
      alert("Referral created successfully!");
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to create referral: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-6">
          <h3 className="text-xl font-semibold mb-6">New Referral</h3>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            {/* Patient */}
            <AsyncPaginate
              key={form.patient?.value || "patient"}
              placeholder="Select Patient"
              value={form.patient}
              loadOptions={loadPatients}
              onChange={handlePatientChange}
              isClearable
              additional={{ page: 1 }}
              styles={{
                option: (provided, state) => ({
                  ...provided,
                  color: "white",
                  backgroundColor: "black",
                }),
                singleValue: (provided) => ({ ...provided, color: "white" }),
                input: (provided) => ({ ...provided, color: "white" }),
                placeholder: (provided) => ({ ...provided, color: "#eee" }),
                control: (provided) => ({ ...provided, backgroundColor: "black", color: "white" }),
              }}
              className="col-span-1 md:col-span-2"
            />

            {/* Refer To */}
            <select
              name="refer_to"
              value={form.refer_to}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 bg-black text-white"
            >
              <option value="">Select Refer To</option>
              {referOptions.map((opt) => (
                <option key={opt.option_id} value={opt.option_id}>
                  {opt.title}
                </option>
              ))}
            </select>

            {/* Priority Level */}
            <select
              name="priority_level"
              value={form.priority_level}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 bg-black text-white"
            >
              <option value="">Select Priority Level</option>
              <option value="standard">Standard</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Law Firm */}
            <select
              name="lawyer_id"
              value={form.lawyer_id}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 bg-black text-white"
            >
              <option value="">Select Law Firm</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.organization}
                </option>
              ))}
            </select>

            {/* Notes */}
            <textarea
              name="notes"
              rows="4"
              placeholder="Notes..."
              value={form.notes}
              onChange={handleChange}
              className="border rounded px-3 py-2 resize-none md:col-span-2 bg-black text-white"
            />

            {/* Attachment */}
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="border rounded px-3 py-2 md:col-span-2 bg-black text-white"
            />

            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn px-4 py-2 rounded text-white ${
                  isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create"}
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
                className="btn px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-black"
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
