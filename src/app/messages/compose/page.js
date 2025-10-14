"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function ComposeMessage() {
  const router = useRouter();
  const [form, setForm] = useState({ to: "", channel: "SMS", body: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Message sent:\n${JSON.stringify(form, null, 2)}`);
    router.push("/messages");
  };

  return (
    <ProtectedRoute>
      <div className="card">
        <h3>Compose</h3>
        <form className="grid cols-2" onSubmit={handleSubmit}>
          <input
            name="to"
            placeholder="To"
            value={form.to}
            onChange={handleChange}
          />
          <select
            name="channel"
            value={form.channel}
            onChange={handleChange}
          >
            <option>SMS</option>
            <option>Email</option>
          </select>
          <textarea
            name="body"
            rows="5"
            placeholder="Message…"
            value={form.body}
            onChange={handleChange}
          />
          <button className="btn primary" type="submit">
            Send
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
