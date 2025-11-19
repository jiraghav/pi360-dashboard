"use client";

import { useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function NewLocationRequestModal({ isOpen, onClose }) {
  const [city, setCity] = useState(null);
  const [services, setServices] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  // ------------------------------------
  // LOAD CITIES (State + City Combined)
  // ------------------------------------
  const loadCities = async (search, loadedOptions, { page }) => {
    try {
      const res = await apiRequest(
        `search_state_city.php?query=${encodeURIComponent(
          search
        )}&page=${page}&limit=20`
      );

      const options =
        res?.data?.map((item) => ({
          value: item.id,
          label: `${item.city_name}, ${item.state_name}`,
          state_id: item.state_id,
        })) || [];

      return {
        options,
        hasMore: res?.data?.length === 20,
        additional: { page: page + 1 },
      };
    } catch (err) {
      console.error("Error loading cities:", err);
      return {
        options: [],
        hasMore: false,
        additional: { page },
      };
    }
  };

  // ------------------------------------
  // LOAD SPECIALITIES (Paginated)
  // ------------------------------------
  const loadServices = async (search, loadedOptions, { page }) => {
    try {
      const res = await apiRequest(
        `search_specialties.php?query=${encodeURIComponent(
          search
        )}&page=${page}&limit=20`
      );

      const options =
        res?.data?.map((item) => ({
          value: item.option_id,
          label: item.title,
        })) || [];

      return {
        options,
        hasMore: res?.data?.length === 20,
        additional: { page: page + 1 },
      };
    } catch (err) {
      console.error("Error loading services:", err);
      return {
        options: [],
        hasMore: false,
        additional: { page },
      };
    }
  };

  // ------------------------------------
  // SUBMIT
  // ------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("city_id", city?.value || "");
      formData.append("city_name", city?.label || "");
      formData.append("state_id", city?.state_id || "");
      formData.append("speciality_id", services?.value || "");
      formData.append("speciality_name", services?.label || "");
      formData.append("note", note);

      await apiRequest("create_location_request.php", {
        method: "POST",
        body: formData,
      });

      showToast("success", "Location request submitted!");

      setCity(null);
      setServices(null);
      setNote("");

      onClose();
    } catch (err) {
      showToast("error", err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // MODAL STATE
  // ------------------------------------
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Request New Location</h4>
          <button className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* City + State Dropdown */}
          <AsyncPaginate
            value={city}
            loadOptions={loadCities}
            onChange={setCity}
            additional={{ page: 1 }}
            placeholder="Select City / State"
            classNamePrefix="rs"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#0b0f16",
                borderColor: "#2a2f36",
                padding: "3px",
              }),
              singleValue: (base) => ({ ...base, color: "white" }),
              menu: (base) => ({ ...base, backgroundColor: "#0b0f16", zIndex: 9999 }),
              input: (base) => ({ ...base, color: "white" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#1a1f27" : "#0b0f16",
                color: "white",
              }),
            }}
            isClearable
            required
          />

          {/* Specialities */}
          <AsyncPaginate
            value={services}
            loadOptions={loadServices}
            onChange={setServices}
            additional={{ page: 1 }}
            placeholder="Select Required Specialty"
            classNamePrefix="rs"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#0b0f16",
                borderColor: "#2a2f36",
                padding: "3px",
              }),
              singleValue: (base) => ({ ...base, color: "white" }),
              menu: (base) => ({ ...base, backgroundColor: "#0b0f16", zIndex: 9999 }),
              input: (base) => ({ ...base, color: "white" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#1a1f27" : "#0b0f16",
                color: "white",
              }),
            }}
            isClearable
            required
          />

          {/* Note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            rows={4}
            placeholder="Additional notes (optional)"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
