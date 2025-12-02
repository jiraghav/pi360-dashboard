import { useState, useEffect } from "react";

export default function PatientFormFields({
  fnameRef,
  selectedCase,
  setSelectedCase,
  lawyers,
  caseTypes,
  languages,
  states,
}) {

  // Set default language only ONCE when creating a new patient
  useEffect(() => {
    if (!selectedCase?.pid && languages.length > 0 && !selectedCase.preferred_language) {
      const defaultLang = languages.find(l => l.is_default == 1)?.option_id || "";
      setSelectedCase(prev => ({
        ...prev,
        preferred_language: defaultLang
      }));
    }
  }, [languages]);

  // Helper to update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSelectedCase(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // File upload handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedCase(prev => ({
      ...prev,
      lop_file: file
    }));
  };

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
          value={selectedCase.fname || ""}
          onChange={handleChange}
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
          value={selectedCase.lname || ""}
          onChange={handleChange}
          placeholder="Enter Last Name"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">DOB *</label>
        <input
          type="date"
          name="dob"
          required
          value={selectedCase.dob || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* DOI */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">Date of Injury *</label>
        <input
          type="date"
          name="doi"
          required
          value={selectedCase.doi || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">Gender *</label>
        <select
          name="gender"
          required
          value={selectedCase.gender || ""}
          onChange={handleChange}
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
        <label className="block mb-1 text-sm font-medium text-gray-300">Law Firm *</label>
        <select
          name="lawyer_id"
          required
          value={selectedCase.lawyer_id || ""}
          onChange={handleChange}
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
        <label className="block mb-1 text-sm font-medium text-gray-300">Address</label>
        <input
          type="text"
          name="address"
          value={selectedCase.address || ""}
          onChange={handleChange}
          placeholder="Street address"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* City */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">City</label>
        <input
          type="text"
          name="city"
          value={selectedCase.city || ""}
          onChange={handleChange}
          placeholder="City"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* State */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">State</label>
        <select
          name="state"
          value={selectedCase.state || ""}
          onChange={handleChange}
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
        <label className="block mb-1 text-sm font-medium text-gray-300">ZIP</label>
        <input
          type="text"
          name="zip"
          value={selectedCase.zip || ""}
          onChange={handleChange}
          placeholder="ZIP Code"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Email + Phone */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={selectedCase.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Phone *</label>
          <input
            type="tel"
            name="phone"
            required
            value={selectedCase.phone || ""}
            onChange={handleChange}
            placeholder="Phone number"
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
        </div>
      </div>

      {/* Case Type + Language */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Case Type *</label>
          <select
            name="case_type_id"
            required
            value={selectedCase.case_type_id || ""}
            onChange={handleChange}
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
          <label className="block mb-1 text-sm font-medium text-gray-300">Preferred Language *</label>
          <select
            name="preferred_language"
            value={selectedCase.preferred_language || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-black text-white"
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
        <label className="block mb-1 text-sm font-medium text-gray-300">Notes</label>
        <textarea
          name="notes"
          value={selectedCase.notes || ""}
          onChange={handleChange}
          placeholder="Additional notes"
          className="w-full border rounded px-3 py-2 bg-black text-white min-h-[100px]"
        ></textarea>
      </div>

      {/* LOP Upload */}
      {!selectedCase?.pid && (
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-300">Upload LOP</label>
          <input
            type="file"
            name="lop_file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Allowed: PDF</p>
        </div>
      )}
    </>
  );
}
