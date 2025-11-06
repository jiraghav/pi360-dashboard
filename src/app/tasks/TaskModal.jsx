"use client";

import { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../utils/api"; // adjust path

export default function TaskModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [patient, setPatient] = useState(null);
  const [priority, setPriority] = useState(2); // default medium
  const [loading, setLoading] = useState(false);

  const loadPatients = async (inputValue, loadedOptions, { page }) => {
    try {
      const params = new URLSearchParams({ limit: 10, page: page || 1 });
      if (inputValue) params.append("search", inputValue);

      const data = await apiRequest(`cases.php?${params.toString()}`);
      const newOptions = (data.patients || []).map((p) => ({
        label: `${p.fname} ${p.lname}${
          p.doi || p.dob
            ? ` — ${[
                p.doi ? `DOI: ${p.doi}` : null,
                p.dob ? `DOB: ${p.dob}` : null
              ]
                .filter(Boolean)
                .join(" • ")}`
            : ""
        }`,
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

  const handleCreate = async () => {
    if (!title) {
      alert("Please enter a title.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("pid", patient?.value);
      formData.append("priority", priority); // send numeric priority

      const res = await apiRequest("create_task.php", {
        method: "POST",
        body: formData,
      });

      alert("Task created successfully!");
      onCreated(res);

      setTitle("");
      setDescription("");
      setPatient(null);
      setPriority(2);
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to create task. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="card max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Add Task</h4>
          <button className="badge" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-3">
          {/* Patient Selection */}
          <AsyncPaginate
            key={patient?.value || "patient"}
            placeholder="Select Patient (optional)"
            value={patient}
            loadOptions={loadPatients}
            onChange={setPatient}
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
          />

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke"
            placeholder="Title"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke"
            rows={4}
            placeholder="Description"
          />

          {/* Priority Dropdown */}
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
