import { useState, useEffect } from "react";

export default function Step1Organization({ clinic, updateField, errors }) {
  
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}specialities.php`
        );
        const data = await res.json();

        if (data.status) {
          setServices(data.specialities);
        }
      } catch (error) {
        console.error("Failed to load services", error);
      }
    };

    fetchServices();
  }, []);

  const inputClass =
    "border rounded px-3 py-2 bg-black text-white w-full border-gray-600";
  const getInputClass = (field) =>
    `${inputClass} ${errors?.[field] ? "border-red-500" : ""}`;

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
            name="clinic_name"
            placeholder="Facility Name"
            value={clinic.clinic_name}
            onChange={(e) => updateField("clinic_name", e.target.value)}
            className={getInputClass("clinic_name")}
            required
          />

          <input
            name="website"
            type="url"
            placeholder="Main Website (optional)"
            value={clinic.website}
            onChange={(e) => updateField("website", e.target.value)}
            className={getInputClass("website")}
          />
          
          <div>
            <select
              name="service"
              value={clinic.service}
              onChange={(e) => updateField("service", e.target.value)}
              className={getInputClass("service")}
              required
            >
              <option value="">Select Service</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.description}
                </option>
              ))}
            </select>
            {errors?.service && <p className="mt-1 text-sm text-red-400">{errors.service}</p>}
          </div>

          {errors?.clinic_name && <p className="text-sm text-red-400 md:col-span-2">{errors.clinic_name}</p>}
          {errors?.website && <p className="text-sm text-red-400 md:col-span-2">{errors.website}</p>}

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
            className={getInputClass("primary_contact_name")}
          />

          <input
            name="primary_contact_title"
            required
            placeholder="Title / Role"
            value={clinic.primary_contact_title}
            onChange={(e) =>
              updateField("primary_contact_title", e.target.value)
            }
            className={getInputClass("primary_contact_title")}
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
            className={getInputClass("primary_contact_phone")}
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
            className={getInputClass("primary_contact_email")}
          />

          {errors?.primary_contact_name && <p className="text-sm text-red-400 md:col-span-2">{errors.primary_contact_name}</p>}
          {errors?.primary_contact_title && <p className="text-sm text-red-400 md:col-span-2">{errors.primary_contact_title}</p>}
          {errors?.primary_contact_phone && <p className="text-sm text-red-400 md:col-span-2">{errors.primary_contact_phone}</p>}
          {errors?.primary_contact_email && <p className="text-sm text-red-400 md:col-span-2">{errors.primary_contact_email}</p>}

        </div>
      </div>


      {/* Defaults */}

      <div>
        <h3 className="font-semibold mb-3">
          C) Defaults (apply to all locations)
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
              className={getInputClass("referral_method")}
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
                className={`${getInputClass("referral_method_other")} mt-2`}
              />
            )}
            {errors?.referral_method && <p className="mt-1 text-sm text-red-400">{errors.referral_method}</p>}
            {errors?.referral_method_other && <p className="mt-1 text-sm text-red-400">{errors.referral_method_other}</p>}
          </div>

          <input
            name="default_referral_recipient"
            required
            placeholder="Default referral recipient (department/person)"
            value={clinic.default_referral_recipient}
            onChange={(e) =>
              updateField("default_referral_recipient", e.target.value)
            }
            className={getInputClass("default_referral_recipient")}
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
            className={getInputClass("default_emails")}
          />

          {errors?.default_referral_recipient && <p className="text-sm text-red-400">{errors.default_referral_recipient}</p>}
          {errors?.default_emails && <p className="text-sm text-red-400">{errors.default_emails}</p>}

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

        {errors?.emr_usage && (
          <p className="mb-3 text-sm text-red-400">{errors.emr_usage}</p>
        )}

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
          className={getInputClass("check_pay_to")}
        />

        <textarea
          name="check_address"
          placeholder="Mailing Address"
          value={clinic.check_address}
          onChange={(e) => updateField("check_address", e.target.value)}
          rows={3}
          className={`${getInputClass("check_address")} mt-2`}
        />

        {errors?.check_pay_to && <p className="mt-2 text-sm text-red-400">{errors.check_pay_to}</p>}
        {errors?.check_address && <p className="mt-2 text-sm text-red-400">{errors.check_address}</p>}

      </div>

    </div>
  );
}
