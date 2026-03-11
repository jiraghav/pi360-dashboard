"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { apiRequest } from "../utils/api";

export default function LocationCard({
  index,
  location,
  updateLocation,
  removeLocation
}) {
  const [serviceOptions, setServiceOptions] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiRequest("services.php");

        if (res.status) {
          const options = res.services.map((s) => ({
            value: s.id,
            label: s.name
          }));

          setServiceOptions(options);
        }
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (field, value) => {
    updateLocation(index, field, value);
  };

  return (

    <div className="border border-gray-700 rounded-lg p-6 bg-black">

      <div className="flex justify-between mb-4">
        <h3 className="font-semibold text-lg">
          Location #{index + 1}
        </h3>

        {index > 0 && (
          <button
            onClick={() => removeLocation(index)}
            className="text-red-400 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      {/* LOCATION BASICS */}

      <h4 className="font-semibold mb-3">1) Location Basics</h4>

      <div className="grid md:grid-cols-2 gap-4 mb-6">

        <input
          placeholder="Clinic / Location Name"
          required
          value={location.clinic_name}
          onChange={(e) => handleChange("clinic_name", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="Street"
          required
          value={location.street}
          onChange={(e) => handleChange("street", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="City"
          required
          value={location.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="State"
          required
          value={location.state}
          onChange={(e) => handleChange("state", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="Zip"
          required
          value={location.zip}
          onChange={(e) => handleChange("zip", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="Main Phone"
          required
          value={location.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="Location Email"
          required
          value={location.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="Website (optional)"
          value={location.website}
          onChange={(e) => handleChange("website", e.target.value)}
          className="border rounded px-3 py-2 bg-black text-white"
        />

      </div>

      {/* SERVICES */}

      <h4 className="font-semibold mb-3">
        2) Services & Preferences
      </h4>

      <div className="space-y-4">

      <Select
        isMulti
        required
        options={serviceOptions}
        value={serviceOptions.filter(opt =>
          location.services.includes(opt.value)
        )}
        onChange={(selected) =>
          handleChange(
            "services",
            selected ? selected.map(s => s.value) : []
          )
        }
        placeholder="Select Services..."
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#000",
            borderColor: "#374151",
            color: "#fff"
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "#000",
            color: "#fff"
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#1f2937" : "#000",
            color: "#fff",
            cursor: "pointer"
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#1f2937"
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#fff"
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#9ca3af",
            ":hover": {
              backgroundColor: "#ef4444",
              color: "#fff"
            }
          }),
          input: (base) => ({
            ...base,
            color: "#fff"
          }),
          singleValue: (base) => ({
            ...base,
            color: "#fff"
          })
        }}
      />

        <input
          placeholder="Other service"
          value={location.service_other}
          onChange={(e) =>
            handleChange("service_other", e.target.value)
          }
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <input
          placeholder="Patient age range served"
          value={location.age_range}
          onChange={(e) =>
            handleChange("age_range", e.target.value)
          }
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <div>

          <label className="flex gap-2 mb-2">
            <input
              type="checkbox"
              checked={location.languages_enabled}
              onChange={(e) =>
                handleChange("languages_enabled", e.target.checked)
              }
            />
            Languages besides English
          </label>

          {location.languages_enabled && (
            <input
              placeholder="Languages"
              value={location.languages}
              onChange={(e) =>
                handleChange("languages", e.target.value)
              }
              className="border rounded px-3 py-2 bg-black text-white w-full"
            />
          )}

        </div>

        <input
          placeholder="Insurance accepted"
          value={location.insurance}
          onChange={(e) =>
            handleChange("insurance", e.target.value)
          }
          className="border rounded px-3 py-2 bg-black text-white"
        />

        <textarea
          placeholder="Any requirements or preferences for CIC referrals?"
          value={location.requirements}
          onChange={(e) =>
            handleChange("requirements", e.target.value)
          }
          rows={3}
          className="border rounded px-3 py-2 bg-black text-white w-full"
        />

      </div>

    </div>
  );
}