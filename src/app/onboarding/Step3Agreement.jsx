"use client";

export default function Step3Agreement({ clinic, updateField }) {

  return (
    <div className="space-y-8">

      <h2 className="text-xl font-bold">
        Step 3: Agreement & Compliance
      </h2>

      {/* Communication Protocol */}

      <div className="border border-gray-700 p-5 rounded">

        <h3 className="font-semibold mb-2">
          A) Communication Protocol
        </h3>

        <p className="text-gray-300 mb-4">
          “I agree that any legal inquiries or concerns regarding patient care
          under this management program will be directed to CIC’s designated
          contact person/department, and not to attorneys or legal
          representatives directly.”
        </p>

        <div className="flex gap-6">

          <label className="flex gap-2">
            <input
              required
              type="radio"
              name="communication_agree"
              value="agree"
              checked={clinic.communication_agree === "agree"}
              onChange={() => updateField("communication_agree", "agree")}
            />
            Agree
          </label>

          <label className="flex gap-2">
            <input
              required
              type="radio"
              name="communication_agree"
              value="no"
              checked={clinic.communication_agree === "no"}
              onChange={() => updateField("communication_agree", "no")}
            />
            Do Not Agree
          </label>

        </div>

      </div>


      {/* EMR Usage */}

      <div className="border border-gray-700 p-5 rounded">

        <h3 className="font-semibold mb-2">
          B) EMR Usage (for CIC-referred patients)
        </h3>

        <p className="text-gray-300 mb-4">
          “I agree to use the designated EMR system for all patients referred
          through this management program for documentation and communication.”
        </p>

        <div className="flex gap-6">

          <label className="flex gap-2">
            <input
              required
              type="radio"
              name="emr_agree"
              value="agree"
              checked={clinic.emr_agree === "agree"}
              onChange={() => updateField("emr_agree", "agree")}
            />
            Agree
          </label>

          <label className="flex gap-2">
            <input
              required
              type="radio"
              name="emr_agree"
              value="no"
              checked={clinic.emr_agree === "no"}
              onChange={() => updateField("emr_agree", "no")}
            />
            Do Not Agree
          </label>

        </div>

      </div>

    </div>
  );
}