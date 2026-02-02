"use client";

import { useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../utils/api"; // adjust path
import { useToast } from "../hooks/ToastContext";

export default function TaskModal({ isOpen, onClose, onCreated, selectedCase }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [patient, setPatient] = useState(null);
  const [priority, setPriority] = useState(2);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

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
                p.dob ? `DOB: ${p.dob}` : null,
              ]
                .filter(Boolean)
                .join(" • ")}`
            : ""
        }`,
        value: p.pid,
      }));

      return {
        options: newOptions,
        hasMore: page * 10 < (data.total || 0),
        additional: { page: (page || 1) + 1 },
      };
    } catch (err) {
      console.error("Error loading patients:", err);
      return { options: [], hasMore: false, additional: { page: page || 1 } };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCase && !patient) {
      showToast("error", "Please select a patient.");
      return;
    }

    // native validation already blocks invalid form, so only continue if valid
    if (!e.target.checkValidity()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("pid", selectedCase ? selectedCase.pid : patient?.value || "");
      formData.append("priority", priority);

      const res = await apiRequest("create_task.php", {
        method: "POST",
        body: formData,
      });

      showToast("success", "Task created successfully!");
      onCreated(res);

      // reset
      setTitle("");
      setDescription("");
      setPatient(null);
      setPriority(2);
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
      showToast("error", "Failed to create task. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm flex">
      <div className="card max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Add Task</h4>
          <button type="button" className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Patient Selection */}
          {selectedCase ? (
            <div className="px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white text-sm">
              Patient: {selectedCase.fname} {selectedCase.lname}
            </div>
          ) : (
            <AsyncPaginate
              key={patient?.value || "patient"}
              placeholder="Select Patient"
              value={patient}
              loadOptions={loadPatients}
              onChange={setPatient}
              isClearable
              additional={{ page: 1 }}
              required
              styles={{
                option: (provided) => ({
                  ...provided,
                  color: "white",
                  backgroundColor: "black",
                }),
                singleValue: (provided) => ({ ...provided, color: "white" }),
                input: (provided) => ({ ...provided, color: "white" }),
                placeholder: (provided) => ({ ...provided, color: "#eee" }),
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "black",
                  color: "white",
                }),
              }}
            />
          )}

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            placeholder="Title"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
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

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
