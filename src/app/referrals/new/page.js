"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReferral() {
  const router = useRouter();

  const [form, setForm] = useState({
    patient_name: "",
    phone: "",
    law_firm: "",
    injury: "Neck",
    priority: "Normal",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace this with API call to backend
    alert(`Referral created:\n${JSON.stringify(form, null, 2)}`);
    router.push("/referrals");
  };

  return (
    <div className="card">
      <h3>New Referral</h3>
      <form className="grid cols-2" onSubmit={handleSubmit}>
        <input
          name="patient_name"
          placeholder="Patient"
          required
          value={form.patient_name}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="law_firm"
          placeholder="Law Firm"
          value={form.law_firm}
          onChange={handleChange}
        />
        <select name="injury" value={form.injury} onChange={handleChange}>
          <option>Neck</option>
          <option>Back</option>
          <option>Knee</option>
        </select>
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>Normal</option>
          <option>High</option>
        </select>
        <textarea
          name="notes"
          rows="4"
          placeholder="Notes…"
          value={form.notes}
          onChange={handleChange}
        />
        <div>
          <button className="btn primary" type="submit">
            Create
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => router.push("/referrals")}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
