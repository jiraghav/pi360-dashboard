"use client";

export default function Step6Confirmation({
  clinic,
  updateField,
  errors
}) {

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8">

      <h2 className="text-xl font-bold">
        Step 6: Confirmation
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input
          placeholder="Name of person completing this form"
          value={clinic.confirm_name || ""}
          required
          onChange={(e) =>
            updateField("confirm_name", e.target.value)
          }
          className={`border rounded px-3 py-2 bg-black text-white ${errors?.confirm_name ? "border-red-500" : "border-gray-600"}`}
        />

        <input
          placeholder="Title / Role"
          value={clinic.confirm_title || ""}
          required
          onChange={(e) =>
            updateField("confirm_title", e.target.value)
          }
          className={`border rounded px-3 py-2 bg-black text-white ${errors?.confirm_title ? "border-red-500" : "border-gray-600"}`}
        />

        <input
          type="date"
          value={clinic.confirm_date || today}
          onChange={(e) =>
            updateField("confirm_date", e.target.value)
          }
          disabled
          className={`border rounded px-3 py-2 bg-black text-white ${errors?.confirm_date ? "border-red-500" : "border-gray-600"}`}
        />

        {errors?.confirm_name && <p className="text-sm text-red-400 md:col-span-2">{errors.confirm_name}</p>}
        {errors?.confirm_title && <p className="text-sm text-red-400 md:col-span-2">{errors.confirm_title}</p>}
        {errors?.confirm_date && <p className="text-sm text-red-400 md:col-span-2">{errors.confirm_date}</p>}

      </div>


      {/* Agreement text */}

      <div className="text-gray-300 text-sm border border-gray-700 p-4 rounded">

        <p className="mb-3">
          By submitting this questionnaire, you confirm the information
          is accurate and complete to the best of your knowledge and
          you agree to the terms above.
        </p>

        <p>
          On submission, the signed contract PDF will be saved together
          with your onboarding form.
        </p>

      </div>

    </div>
  );
}
