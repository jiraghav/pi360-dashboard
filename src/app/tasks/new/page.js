"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTask() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    owner: "Intake",
    due: "",
    priority: "Normal",
    details: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Task created:\n${JSON.stringify(form, null, 2)}`);
    router.push("/tasks");
  };

  return (
    <div className="card">
      <h3>New Task</h3>
      <form className="grid cols-2" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <select name="owner" value={form.owner} onChange={handleChange}>
          <option>Intake</option>
          <option>Records</option>
          <option>Billing</option>
          <option>Reductions</option>
        </select>
        <input name="due" type="date" value={form.due} onChange={handleChange} />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>Normal</option>
          <option>High</option>
        </select>
        <textarea
          name="details"
          rows="4"
          placeholder="Details…"
          value={form.details}
          onChange={handleChange}
        />
        <button className="btn primary" type="submit">
          Create
        </button>
      </form>
    </div>
  );
}
