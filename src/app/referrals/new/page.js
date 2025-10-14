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
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state

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

  // ✅ Load patients with pagination or search
  const loadPatients = async (inputValue, loadedOptions, { page }) => {
    try {
      const params = new URLSearchParams({
        limit: 10,
        page: page || 1,
      });
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
      return {
        options: [],
        hasMore: false,
        additional: { page: page || 1 },
      };
    }
  };

  const handlePatientChange = (selected) => {
    console.log(selected);
    setForm((prev) => ({
      ...prev,
      patient: selected,
    }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setForm((prev) => ({ ...prev, attachment: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // ✅ start loading
    try {
      const formData = new FormData();
      formData.append("form_pid", form.patient?.value || "");
      formData.append("refer_to", form.refer_to);
      formData.append("priority_level", form.priority_level);
      formData.append("lawyer_id", form.lawyer_id);
      formData.append("referral_detail", form.notes);
      if (form.attachment) {
        formData.append("referral_attachment", form.attachment);
      }

      await apiRequest("create_referral.php", {
        method: "POST",
        body: formData,
      });

      alert(`Referral created successfully!`);
      router.push("/referrals");
    } catch (err) {
      alert("Failed to create referral: " + err.message);
    } finally {
      setIsSubmitting(false); // ✅ stop loading
    }
  };

  return (
    <ProtectedRoute>
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">New Referral</h3>
        <form className="grid cols-2 gap-4" onSubmit={handleSubmit}>
          {/* ✅ Paginated AsyncSelect */}
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
                color: 'black',         // text color
                backgroundColor: state.isFocused ? '#eee' : '#fff', // optional
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'black',         // selected value text
              }),
              input: (provided) => ({
                ...provided,
                color: 'black',         // input text
              }),
              placeholder: (provided) => ({
                ...provided,
                color: '#999',          // placeholder color
              }),
            }}
          />

          {/* Refer To */}
          <select
            name="refer_to"
            value={form.refer_to}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
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
            placeholder="Notes…"
            value={form.notes}
            onChange={handleChange}
            className="border rounded px-3 py-2 resize-none"
          />

          {/* Attach File */}
          <input
            type="file"
            name="attachment"
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button
              className={`btn primary px-4 py-2 rounded text-white ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>

            <button
              className="btn px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              type="button"
              onClick={() => router.push("/referrals")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
          <br />
          <br />
          <br />
          <br />
        </form>
      </div>
    </ProtectedRoute>
  );
}
