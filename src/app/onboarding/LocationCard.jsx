"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

export default function LocationCard({
  index,
  location,
  updateLocation,
  removeLocation,
  errors = {}
}) {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/lawyer_apis\/?$/, "");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}services.php`
        );
        const data = await res.json();

        if (data.status) {
          const options = data.services.map((s) => ({
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

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${publicApiBaseUrl}get_states.php`);
        const data = await res.json();

        const options = (Array.isArray(data) ? data : []).map((state) => ({
          value: state.state_id,
          label: state.state_name,
        }));

        setStateOptions(options);
      } catch (err) {
        console.error("Failed to load states", err);
      }
    };

    fetchStates();
  }, [publicApiBaseUrl]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!location.state) {
        setCityOptions([]);
        return;
      }

      try {
        const res = await fetch(`${publicApiBaseUrl}get_cities.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: location.state }),
        });
        const data = await res.json();

        const options = (Array.isArray(data) ? data : []).map((city) => ({
          value: city,
          label: city,
        }));

        setCityOptions(options);
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    };

    fetchCities();
  }, [location.state, publicApiBaseUrl]);

  const handleChange = (field, value) => {
    if (field === "website") {
      value = normalizeUrl(value);
    }

    updateLocation(index, field, value);
  };

  const inputClass = (field) =>
    `border rounded px-3 py-2 bg-black text-white ${errors?.[field] ? "border-red-500" : "border-gray-600"}`;

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
          className={inputClass("clinic_name")}
        />

        <input
          placeholder="Street"
          required
          value={location.street}
          onChange={(e) => handleChange("street", e.target.value)}
          className={inputClass("street")}
        />

        <Select
          options={stateOptions}
          value={stateOptions.find((option) => option.value === location.state) || null}
          onChange={(selected) => {
            handleChange("state", selected?.value || "");
            handleChange("city", "");
          }}
          placeholder="Select State"
          styles={selectStyles(errors?.state)}
        />

        <Select
          options={cityOptions}
          value={cityOptions.find((option) => option.value === location.city) || null}
          onChange={(selected) => handleChange("city", selected?.value || "")}
          placeholder="Select City"
          isDisabled={!location.state}
          styles={selectStyles(errors?.city)}
        />

        <input
          placeholder="Zip"
          required
          value={location.zip}
          onChange={(e) => handleChange("zip", e.target.value)}
          className={inputClass("zip")}
        />

        <input
          placeholder="Main Phone"
          required
          value={location.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className={inputClass("phone")}
        />

        <input
          type="email"
          placeholder="Location Email"
          required
          value={location.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={inputClass("email")}
        />

        <input
          type="url"
          placeholder="Website (optional)"
          value={location.website}
          onChange={(e) => handleChange("website", e.target.value)}
          className={inputClass("website")}
        />

        {Object.values(errors).length > 0 && (
          <div className="md:col-span-2 space-y-1">
            {errors.clinic_name && <p className="text-sm text-red-400">{errors.clinic_name}</p>}
            {errors.street && <p className="text-sm text-red-400">{errors.street}</p>}
            {errors.city && <p className="text-sm text-red-400">{errors.city}</p>}
            {errors.state && <p className="text-sm text-red-400">{errors.state}</p>}
            {errors.zip && <p className="text-sm text-red-400">{errors.zip}</p>}
            {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
            {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            {errors.website && <p className="text-sm text-red-400">{errors.website}</p>}
          </div>
        )}

      </div>

      {/* SERVICES */}

      <h4 className="font-semibold mb-3">
        2) Services & Preferences
      </h4>

      <div className="space-y-4">

      <Select
        isMulti
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
        styles={selectStyles(errors?.services)}
      />

        {errors?.services && (
          <p className="text-sm text-red-400">{errors.services}</p>
        )}

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

function selectStyles(hasError) {
  return {
    control: (base) => ({
      ...base,
      backgroundColor: "#000",
      borderColor: hasError ? "#ef4444" : "#374151",
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
  };
}

function normalizeUrl(value) {
  const trimmedValue = (value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  return trimmedValue;
}
