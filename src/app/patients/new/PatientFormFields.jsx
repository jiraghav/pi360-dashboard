import { useState, useEffect } from "react";

export default function PatientFormFields({
  fnameRef,
  lawyers,
  caseTypes,
  languages,
  states,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {
    if (languages.length > 0) {
      const defaultLang = languages.find(l => l.is_default == 1)?.option_id || "";
      setSelectedLanguage(defaultLang);
    }
  }, [languages]);

  return (
    <>
      {/* First Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          First Name *
        </label>
        <input
          ref={fnameRef}
          type="text"
          name="fname"
          required
          placeholder="Enter First Name"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Last Name *
        </label>
        <input
          type="text"
          name="lname"
          required
          placeholder="Enter Last Name"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          DOB *
        </label>
        <input
          type="date"
          name="dob"
          required
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* DOI */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Date of Injury *
        </label>
        <input
          type="date"
          name="doi"
          required
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Gender *
        </label>
        <select
          name="gender"
          required
          className="w-full border rounded px-3 py-2 bg-black text-white"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Law Firm */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Law Firm *
        </label>
        <select
          name="lawyer_id"
          required
          className="w-full border rounded px-3 py-2 bg-black text-white"
        >
          <option value="">Select Law Firm</option>
          {lawyers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.organization}
            </option>
          ))}
        </select>
      </div>

      {/* Address */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Address
        </label>
        <input
          type="text"
          name="address"
          placeholder="Street address"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* City */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          City
        </label>
        <input
          type="text"
          name="city"
          placeholder="City"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* State (Dropdown from API) */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          State
        </label>
        <select
          name="state"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={'state_'+s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ZIP */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          ZIP
        </label>
        <input
          type="text"
          name="zip"
          placeholder="ZIP Code"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Email + Phone in one line */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="Phone number"
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
        </div>
      </div>

      {/* Case Type + Preferred Language in one line */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Case Type *
          </label>
          <select
            name="case_type_id"
            required
            className="w-full border rounded px-3 py-2 bg-black text-white"
          >
            <option value="">Select Case Type</option>
            {caseTypes.map((t) => (
              <option key={t.option_id} value={t.option_id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Preferred Language
          </label>
          <select
            name="preferred_language"
            className="w-full border rounded px-3 py-2 bg-black text-white"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            required
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang.option_id} value={lang.option_id}>
                {lang.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Notes
        </label>
        <textarea
          name="notes"
          placeholder="Additional notes"
          className="w-full border rounded px-3 py-2 bg-black text-white min-h-[100px]"
        ></textarea>
      </div>
    </>
  );
}
