export default function Step1Organization({ clinic, updateField }) {

  const inputClass =
    "border rounded px-3 py-2 bg-black text-white w-full border-gray-600";

  return (
    <div className="space-y-8">

      <h2 className="text-xl font-bold">
        Step 1: Organization / Group Info
      </h2>

      {/* Organization */}

      <div>
        <h3 className="font-semibold mb-3">A) Organization</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="organization_name"
            placeholder="Organization / Parent Company Name (if any)"
            value={clinic.organization_name}
            onChange={(e) => updateField("organization_name", e.target.value)}
            className={inputClass}
          />

          <input
            name="website"
            type="url"
            placeholder="Main Website (optional)"
            value={clinic.website}
            onChange={(e) => updateField("website", e.target.value)}
            className={inputClass}
          />

        </div>
      </div>


      {/* Primary Contact */}

      <div>
        <h3 className="font-semibold mb-3">B) Primary Contact</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="primary_contact_name"
            required
            placeholder="Primary Contact Name"
            value={clinic.primary_contact_name}
            onChange={(e) =>
              updateField("primary_contact_name", e.target.value)
            }
            className={inputClass}
          />

          <input
            name="primary_contact_title"
            required
            placeholder="Title / Role"
            value={clinic.primary_contact_title}
            onChange={(e) =>
              updateField("primary_contact_title", e.target.value)
            }
            className={inputClass}
          />

          <input
            name="primary_contact_phone"
            required
            type="tel"
            placeholder="Direct Phone"
            value={clinic.primary_contact_phone}
            onChange={(e) =>
              updateField("primary_contact_phone", e.target.value)
            }
            className={inputClass}
          />

          <input
            name="primary_contact_email"
            type="email"
            required
            placeholder="Direct Email"
            value={clinic.primary_contact_email}
            onChange={(e) =>
              updateField("primary_contact_email", e.target.value)
            }
            className={inputClass}
          />

        </div>
      </div>


      {/* Defaults */}

      <div>
        <h3 className="font-semibold mb-3">
          C) Defaults (apply to all locations unless overridden)
        </h3>

        <div className="space-y-4">

          <div>
            <label className="block mb-1">
              Preferred method to receive referrals
            </label>

            <select
              name="referral_method"
              required
              value={clinic.referral_method}
              onChange={(e) =>
                updateField("referral_method", e.target.value)
              }
              className={inputClass}
            >
              <option value="">Select Method</option>
              <option>Email</option>
              <option>Phone</option>
              <option>Fax</option>
              <option>Other</option>
            </select>

            {clinic.referral_method === "Other" && (
              <input
                name="referral_method_other"
                placeholder="Other method"
                value={clinic.referral_method_other}
                onChange={(e) =>
                  updateField("referral_method_other", e.target.value)
                }
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <input
            name="default_referral_recipient"
            required
            placeholder="Default referral recipient (department/person)"
            value={clinic.default_referral_recipient}
            onChange={(e) =>
              updateField("default_referral_recipient", e.target.value)
            }
            className={inputClass}
          />

          <textarea
            name="default_emails"
            required
            placeholder="Email addresses + purpose (referrals / records / billing / scheduling)"
            value={clinic.default_emails}
            onChange={(e) =>
              updateField("default_emails", e.target.value)
            }
            rows={3}
            className={inputClass}
          />

        </div>
      </div>


      {/* EMR */}

      <div>

        <label className="block mb-2">
          Will you use CIC EMR for notes & billing?
        </label>

        <div className="flex gap-6 mb-3">

          <label className="flex gap-2">
            <input
              type="radio"
              name="emr_usage"
              required
              value="yes"
              checked={clinic.emr_usage === "yes"}
              onChange={(e) => updateField("emr_usage", e.target.value)}
            />
            Yes
          </label>

          <label className="flex gap-2">
            <input
              type="radio"
              name="emr_usage"
              required
              value="no"
              checked={clinic.emr_usage === "no"}
              onChange={(e) => updateField("emr_usage", e.target.value)}
            />
            No
          </label>

        </div>

        <textarea
          name="emr_notes"
          placeholder="Notes"
          value={clinic.emr_notes}
          onChange={(e) => updateField("emr_notes", e.target.value)}
          rows={2}
          className={inputClass}
        />

      </div>


      {/* Checks */}

      <div>

        <h3 className="font-semibold mb-2">
          Where should checks be mailed?
        </h3>

        <input
          name="check_pay_to"
          required
          placeholder="Pay-to Name"
          value={clinic.check_pay_to}
          onChange={(e) => updateField("check_pay_to", e.target.value)}
          className={inputClass}
        />

        <textarea
          name="check_address"
          placeholder="Mailing Address"
          value={clinic.check_address}
          onChange={(e) => updateField("check_address", e.target.value)}
          rows={3}
          className={`${inputClass} mt-2`}
        />

      </div>

    </div>
  );
}