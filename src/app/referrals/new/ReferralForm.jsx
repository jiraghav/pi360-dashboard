"use client";

import { useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../../utils/api";
import FacilityInfo from "./FacilityInfo";

export default function ReferralForm({ router, pid }) {
  const [form, setForm] = useState({
    patient: null,
    refer_to: "",
    priority_level: "",
    lawyer_id: "",
    notes: "",
    attachment: null,
    state: null,
    city: null,
  });

  const [referOptions, setReferOptions] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facility, setFacility] = useState(null);

  // ✅ Load facility from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedReferralFacility");
    if (saved) setFacility(JSON.parse(saved));
  }, []);

  // ✅ Fetch dropdown data
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

  // ✅ Auto-select patient if pid in URL
  useEffect(() => {
    async function fetchPatientByPid() {
      if (!pid) return;
      try {
        const data = await apiRequest(`getPatientById.php?pid=${pid}`);
        if (data?.patient) {
          setForm((prev) => ({
            ...prev,
            patient: {
              label: `${data.patient.fname} ${data.patient.lname}`,
              value: data.patient.pid,
            },
          }));
        }
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      }
    }
    fetchPatientByPid();
  }, [pid]);

  // AsyncPaginate loaders
  const loadPatients = async (inputValue, _, { page }) => {
    try {
      const params = new URLSearchParams({ limit: 10, page: page || 1 });
      if (inputValue) params.append("search", inputValue);
      const data = await apiRequest(`cases.php?${params.toString()}`);
      return {
        options: (data.patients || []).map((p) => ({
          label: `${p.fname} ${p.lname} ${
            p.doi ? `• DOI: ${p.doi}` : p.dob ? `• DOB: ${p.dob}` : ""
          }`,
          value: p.pid,
        })),
        hasMore: (page * 10) < (data.total || 0),
        additional: { page: (page || 1) + 1 },
      };
    } catch {
      return { options: [], hasMore: false, additional: { page: page || 1 } };
    }
  };

  const loadStates = async (inputValue, _, { page }) => {
    const params = new URLSearchParams({ search: inputValue || "", page: page || 1 });
    const data = await apiRequest(`getStates.php?${params.toString()}`);
    return {
      options: (data.states || []).map((s) => ({ label: s.name, value: s.id })),
      hasMore: (page * 10) < (data.total || 0),
      additional: { page: (page || 1) + 1 },
    };
  };

  const loadCities = async (inputValue, _, { page }) => {
    if (!form.state) return { options: [], hasMore: false, additional: { page: 1 } };
    const params = new URLSearchParams({
      state_id: form.state.value,
      search: inputValue || "",
      page: page || 1,
    });
    const data = await apiRequest(`getCities.php?${params.toString()}`);
    return {
      options: (data.cities || []).map((c) => ({ label: c.name, value: c.id })),
      hasMore: (page * 10) < (data.total || 0),
      additional: { page: (page || 1) + 1 },
    };
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((p) => ({ ...p, [name]: name === "attachment" ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient) return alert("Please select a patient.");

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("form_pid", form.patient.value);
      fd.append("refer_to", form.refer_to);
      fd.append("priority_level", form.priority_level);
      fd.append("lawyer_id", form.lawyer_id);
      fd.append("referral_detail", form.notes);
      if (form.attachment) fd.append("referral_attachment", form.attachment);
      if (!facility) {
        if (form.state) fd.append("state_id", form.state.value);
        if (form.city) fd.append("city_id", form.city.value);
      } else {
        fd.append("facility_id", facility.id);
      }

      await apiRequest("create_referral.php", { method: "POST", body: fd });
      alert("Referral created successfully!");
      localStorage.removeItem("selectedReferralFacility");
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to create referral: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const asyncStyles = {
    option: (p) => ({ ...p, color: "white", backgroundColor: "black" }),
    singleValue: (p) => ({ ...p, color: "white" }),
    input: (p) => ({ ...p, color: "white" }),
    placeholder: (p) => ({ ...p, color: "#eee" }),
    control: (p) => ({ ...p, backgroundColor: "black", color: "white" }),
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
      {/* Patient */}
      <AsyncPaginate
        key={form.patient?.value || "patient"}
        placeholder="Select Patient"
        value={form.patient}
        loadOptions={loadPatients}
        onChange={(v) => setForm((p) => ({ ...p, patient: v }))}
        isClearable
        additional={{ page: 1 }}
        className="col-span-1 md:col-span-2"
        styles={asyncStyles}
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

      {/* Priority */}
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

      {/* Lawyer */}
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

      {/* Conditional Send To section */}
      {!facility && (
        <>
        <div className="md:col-span-2 mt-2">
          <label className="block mb-1 font-semibold text-white">
            (Optional) Refer to a specific State or City, or choose a Location from{" "}
            <a
              href="/maps"
              className="text-blue-400 underline hover:text-blue-300 transition"
            >
              the map
            </a>
            :
          </label>
        </div>
          <AsyncPaginate
            key={form.state?.value || "state"}
            placeholder="Select State"
            value={form.state}
            loadOptions={loadStates}
            onChange={(v) => setForm((p) => ({ ...p, state: v, city: null }))}
            isClearable
            additional={{ page: 1 }}
            styles={asyncStyles}
          />
          {form.state && (
            <AsyncPaginate
              key={form.city?.value || "city"}
              placeholder="Select City"
              value={form.city}
              loadOptions={loadCities}
              onChange={(v) => setForm((p) => ({ ...p, city: v }))}
              isClearable
              additional={{ page: 1 }}
              styles={asyncStyles}
            />
          )}
        </>
      )}

      {/* Facility Info shown at the bottom */}
      <div className="md:col-span-2">
        <FacilityInfo
          facility={facility}
          onClear={() => {
            setFacility(null);
            localStorage.removeItem("selectedReferralFacility");
          }}
        />
      </div>

      {/* Buttons */}
      <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-primary px-4 py-2 ${
            isSubmitting ? "cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push("/dashboard")
          }
          className="btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
