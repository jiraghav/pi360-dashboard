"use client";

export default function Step4Notes({ clinic, updateField }) {

  return (
    <div className="space-y-6">

      <h2 className="text-xl font-bold">
        Step 4: Additional Notes (optional)
      </h2>

      <textarea
        placeholder="Questions/concerns about onboarding or the program"
        value={clinic.additional_notes || ""}
        onChange={(e) =>
          updateField("additional_notes", e.target.value)
        }
        rows={6}
        className="border rounded px-3 py-2 bg-black text-white w-full"
      />

    </div>
  );
}