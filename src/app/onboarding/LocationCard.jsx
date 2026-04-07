"use client";

import { useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import Select from "react-select";

const libraries = ["places"];
const languageOptions = [
  "Arabic",
  "Bengali",
  "Cantonese",
  "French",
  "German",
  "Gujarati",
  "Hindi",
  "Hmong",
  "Italian",
  "Japanese",
  "Korean",
  "Mandarin",
  "Marathi",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Russian",
  "Spanish",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Yoruba",
  "Afrikaans",
  "Amharic",
  "Armenian",
  "Burmese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "Farsi",
  "Greek",
  "Haitian Creole",
  "Hebrew",
  "Hungarian",
  "Indonesian",
  "Khmer",
  "Lao",
  "Malay",
  "Malayalam",
  "Nepali",
  "Pashto",
  "Romanian",
  "Serbian",
  "Somali",
  "Swahili"
].map((language) => ({
  value: language,
  label: language,
}));

function mapGoogleAddressComponents(components = []) {
  const mapped = components.reduce((acc, component) => {
    const types = component.types || [];

    if (types.includes("street_number")) acc.streetNumber = component.long_name;
    if (types.includes("route")) acc.route = component.long_name;
    if (types.includes("locality")) acc.city = component.long_name;
    if (types.includes("administrative_area_level_1")) {
      acc.stateCode = component.short_name;
      acc.stateName = component.long_name;
    }
    if (types.includes("postal_code")) acc.zip = component.long_name;
    if (types.includes("postal_code_suffix")) acc.zipSuffix = component.long_name;

    return acc;
  }, {});

  return {
    ...mapped,
    zip: mapped.zip && mapped.zipSuffix ? `${mapped.zip}-${mapped.zipSuffix}` : mapped.zip,
  };
}

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
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [pendingAddressComponents, setPendingAddressComponents] = useState(null);
  const streetInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const selectingSuggestionRef = useRef(false);
  const resolveAddressRef = useRef(null);
  const stateOptionsRef = useRef(stateOptions);
  const updateLocationRef = useRef(updateLocation);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/lawyer_apis\/?$/, "");
  const locationEmails = normalizeEmailList(location.email);
  const selectedLanguages = normalizeLanguageList(location.languages);

  useEffect(() => {
    stateOptionsRef.current = stateOptions;
  }, [stateOptions]);

  useEffect(() => {
    updateLocationRef.current = updateLocation;
  }, [updateLocation]);

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

  useEffect(() => {
    if (!pendingAddressComponents || stateOptions.length === 0) {
      return;
    }

    const streetParts = [
      pendingAddressComponents.streetNumber,
      pendingAddressComponents.route,
    ].filter(Boolean);
    const stateOption = stateOptions.find(
      (option) =>
        option.value === pendingAddressComponents.stateCode ||
        option.label.toLowerCase() === (pendingAddressComponents.stateName || "").toLowerCase()
    );

    if (streetParts.length === 0 || !pendingAddressComponents.city || !pendingAddressComponents.zip || !stateOption) {
      return;
    }

    const fullAddress = `${streetParts.join(" ")}, ${pendingAddressComponents.city}, ${stateOption.value} ${pendingAddressComponents.zip}`;

    setAddressError("");
    updateLocationRef.current(index, "full_address", fullAddress);
    updateLocationRef.current(index, "address_validated", true);
    updateLocationRef.current(index, "street", streetParts.join(" "));
    updateLocationRef.current(index, "city", pendingAddressComponents.city);
    updateLocationRef.current(index, "state", stateOption.value);
    updateLocationRef.current(index, "zip", pendingAddressComponents.zip);
    setPendingAddressComponents(null);
  }, [index, pendingAddressComponents, stateOptions]);

  useEffect(() => {
    if (!isLoaded || !streetInputRef.current || autocompleteRef.current) {
      return undefined;
    }

    geocoderRef.current = new window.google.maps.Geocoder();

    const autocomplete = new window.google.maps.places.Autocomplete(
      streetInputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["address_components"],
      }
    );

    autocompleteRef.current = autocomplete;

    const findStateOption = (components) =>
      stateOptionsRef.current.find(
        (option) =>
          option.value === components.stateCode ||
          option.label.toLowerCase() === (components.stateName || "").toLowerCase()
      );

    const applyResolvedAddress = (components) => {
      const streetParts = [components.streetNumber, components.route].filter(Boolean);
      const stateOption = findStateOption(components);

      if (streetParts.length === 0 || !components.city || !components.zip) {
        setAddressError("Enter a complete valid address and select a Google suggestion.");
        return false;
      }

      if (!stateOption) {
        setPendingAddressComponents(components);
        return true;
      }

      const fullAddress = `${streetParts.join(" ")}, ${components.city}, ${stateOption.value} ${components.zip}`;

      setAddressError("");
      setPendingAddressComponents(null);
      updateLocationRef.current(index, "full_address", fullAddress);
      updateLocationRef.current(index, "address_validated", true);
      updateLocationRef.current(index, "street", streetParts.join(" "));
      updateLocationRef.current(index, "city", components.city);
      updateLocationRef.current(index, "state", stateOption.value);
      updateLocationRef.current(index, "zip", components.zip);
      return true;
    };

    const listener = autocomplete.addListener("place_changed", () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      const place = autocomplete.getPlace();
      const addressComponents = mapGoogleAddressComponents(place.address_components || []);
      applyResolvedAddress(addressComponents);
    });

    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      window.google.maps.event.removeListener(listener);
      autocompleteRef.current = null;
    };
  }, [index, isLoaded]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.target instanceof Element && event.target.closest(".pac-item")) {
        selectingSuggestionRef.current = true;
      }
    };

    const handleMouseUp = () => {
      window.setTimeout(() => {
        selectingSuggestionRef.current = false;
      }, 0);
    };

    const handleSuggestionClick = (event) => {
      if (!(event.target instanceof Element) || !event.target.closest(".pac-item")) {
        return;
      }

      window.setTimeout(() => {
        const inputValue = streetInputRef.current?.value || "";
        resolveAddressRef.current?.(inputValue);
      }, 150);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("pointerdown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", handleSuggestionClick);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("pointerdown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleSuggestionClick);
    };
  }, []);

  const handleChange = (field, value) => {
    if (field === "website") {
      value = normalizeUrl(value);
    }

    if (["street", "city", "state", "zip"].includes(field)) {
      setAddressError("");
      updateLocation(index, "address_validated", false);
      updateLocation(index, "full_address", "");
    }

    updateLocation(index, field, value);
  };

  const resolveTypedAddress = (rawValue) => {
    const trimmedValue = (rawValue || "").trim();

    if (!trimmedValue) {
      setAddressError("");
      updateLocation(index, "full_address", "");
      updateLocation(index, "address_validated", false);
      return;
    }

    if (!geocoderRef.current) {
      return;
    }

    geocoderRef.current.geocode(
      {
        address: trimmedValue,
        componentRestrictions: { country: "US" },
      },
      (results, status) => {
        if (status !== "OK" || !results?.[0]) {
          setAddressError("Enter a complete valid address and select a Google suggestion.");
          updateLocation(index, "address_validated", false);
          updateLocation(index, "full_address", "");
          return;
        }

        const resolvedAddress = results[0].formatted_address || "";
        const typedNormalized = trimmedValue.replace(/\s+/g, " ").trim().toLowerCase();
        const resolvedNormalized = resolvedAddress.replace(/\s+/g, " ").trim().toLowerCase();

        const components = mapGoogleAddressComponents(results[0].address_components || []);

        const stateOption = stateOptions.find(
          (option) =>
            option.value === components.stateCode ||
            option.label.toLowerCase() === (components.stateName || "").toLowerCase()
        );
        const streetParts = [components.streetNumber, components.route].filter(Boolean);

        const typedIncludesCityStateZip =
          typedNormalized.includes((components.city || "").toLowerCase()) &&
          typedNormalized.includes((components.stateCode || "").toLowerCase()) &&
          typedNormalized.includes((components.zip || "").toLowerCase());
        const exactStreetStart = typedNormalized.startsWith(streetParts.join(" ").toLowerCase());

        if (
          streetParts.length === 0 ||
          !components.city ||
          !components.zip ||
          (!typedIncludesCityStateZip && typedNormalized !== resolvedNormalized) ||
          !exactStreetStart
        ) {
          setAddressError("Enter a complete valid address and select a Google suggestion.");
          updateLocation(index, "address_validated", false);
          updateLocation(index, "full_address", "");
          return;
        }

        if (!stateOption) {
          setPendingAddressComponents(components);
          return;
        }

        const fullAddress = `${streetParts.join(" ")}, ${components.city}, ${stateOption.value} ${components.zip}`;

        setAddressError("");
        setPendingAddressComponents(null);
        updateLocation(index, "full_address", fullAddress);
        updateLocation(index, "address_validated", true);
        updateLocation(index, "street", streetParts.join(" "));
        updateLocation(index, "city", components.city);
        updateLocation(index, "state", stateOption.value);
        updateLocation(index, "zip", components.zip);
      }
    );
  };

  resolveAddressRef.current = resolveTypedAddress;

  const handleAddEmail = (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const email = emailInput.trim();

    if (!email) {
      setEmailError("Email cannot be empty.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    if (locationEmails.includes(email)) {
      setEmailError("This email is already added.");
      return;
    }

    handleChange("email", [...locationEmails, email].join(", "));
    setEmailInput("");
    setEmailError("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    handleChange(
      "email",
      locationEmails.filter((email) => email !== emailToRemove).join(", ")
    );
    setEmailError("");
  };

  const inputClass = (field) =>
    `border rounded px-3 py-2 bg-black text-white ${
      errors?.[field] || (field === "street" && addressError) ? "border-red-500" : "border-gray-600"
    }`;

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
          placeholder="Start typing full address"
          required
          autoComplete="street-address"
          ref={streetInputRef}
          value={location.street}
          onChange={(e) => {
            handleChange("street", e.target.value);
          }}
          onBlur={(e) => {
            const inputValue = e.target.value;

            if (selectingSuggestionRef.current) {
              return;
            }

            blurTimeoutRef.current = setTimeout(() => {
              resolveTypedAddress(inputValue);
              blurTimeoutRef.current = null;
            }, 300);
          }}
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
          required
        />

        <Select
          options={cityOptions}
          value={cityOptions.find((option) => option.value === location.city) || null}
          onChange={(selected) => handleChange("city", selected?.value || "")}
          placeholder="Select City"
          isDisabled={!location.state}
          styles={selectStyles(errors?.city)}
          required
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

        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {locationEmails.map((email, emailIndex) => (
              <span
                key={`${email}-${emailIndex}`}
                className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full"
              >
                {email}
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="text-red-400 hover:text-red-300"
                >
                  x
                </button>
              </span>
            ))}
          </div>

          <input
            type="email"
            placeholder="Location Email (press Enter to add)"
            required={locationEmails.length === 0}
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (emailError) setEmailError("");
            }}
            onKeyDown={handleAddEmail}
            className={`w-full ${inputClass("email")}`}
          />

          {(emailError || errors?.email) && (
            <p className="text-sm text-red-400 mt-1">{emailError || errors.email}</p>
          )}
        </div>

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
            {addressError && addressError !== errors.street && (
              <p className="text-sm text-red-400">{addressError}</p>
            )}
            {errors.street && <p className="text-sm text-red-400">{errors.street}</p>}
            {errors.city && <p className="text-sm text-red-400">{errors.city}</p>}
            {errors.state && <p className="text-sm text-red-400">{errors.state}</p>}
            {errors.zip && <p className="text-sm text-red-400">{errors.zip}</p>}
            {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
            {errors.website && <p className="text-sm text-red-400">{errors.website}</p>}
          </div>
        )}

        <p className="md:col-span-2 text-sm text-gray-300">
          Enter a full address. A valid Google address will auto-fill street, city, state, and ZIP.
        </p>

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
          placeholder="Any other services?"
          value={location.service_other}
          onChange={(e) =>
            handleChange("service_other", e.target.value)
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
            <Select
              isMulti
              options={languageOptions}
              value={languageOptions.filter((option) =>
                selectedLanguages.includes(option.value)
              )}
              onChange={(selected) =>
                handleChange(
                  "languages",
                  selected ? selected.map((option) => option.value).join(", ") : ""
                )
              }
              placeholder="Select languages"
              styles={selectStyles(false)}
            />
          )}

        </div>

        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={location.insurance === "accept"}
            onChange={(e) =>
              handleChange("insurance", e.target.checked ? "accept" : "")
            }
          />
          Accept insurance
        </label>

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

function normalizeEmailList(value) {
  if (Array.isArray(value)) {
    return value.map((email) => email.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeLanguageList(value) {
  if (Array.isArray(value)) {
    return value.map((language) => language.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);
  }

  return [];
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}
