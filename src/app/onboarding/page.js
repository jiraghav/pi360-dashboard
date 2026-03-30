"use client";

import { useState, useEffect } from "react";
import Step1Organization from "./Step1Organization";
import Step2Locations from "./Step2Locations";
import Step3Agreement from "./Step3Agreement";
import Step4Notes from "./Step4Notes";
import Step5Confirmation from "./Step5Confirmation";

export default function ClinicOnboardingForm({ linkedUserUuid = "" }) {

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());

  const getPhoneDigits = (value) => (value || "").replace(/\D/g, "");

  const hasText = (value, min = 2) => (value || "").trim().length >= min;

  const isValidUrl = (value) => {
    if (!value) return true;

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (value) => {
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
  };

  const validateStep1 = () => {
    const nextErrors = {};

    if (!hasText(clinic.clinic_name, 3)) nextErrors.clinic_name = "Enter a valid organization name.";
    if (!clinic.service) nextErrors.service = "Select a super facility.";
    if (clinic.website && !isValidUrl(clinic.website)) nextErrors.website = "Enter a valid website URL.";

    if (!hasText(clinic.primary_contact_name, 3)) nextErrors.primary_contact_name = "Enter the full contact name.";
    if (!hasText(clinic.primary_contact_title, 2)) nextErrors.primary_contact_title = "Enter a valid title.";
    if (getPhoneDigits(clinic.primary_contact_phone).length < 10) nextErrors.primary_contact_phone = "Enter a valid phone number.";
    if (!isValidEmail(clinic.primary_contact_email)) nextErrors.primary_contact_email = "Enter a valid email address.";

    if (!clinic.referral_method) nextErrors.referral_method = "Select a referral method.";
    if (clinic.referral_method === "Other" && !hasText(clinic.referral_method_other, 3)) {
      nextErrors.referral_method_other = "Enter the other referral method.";
    }
    if (!hasText(clinic.default_referral_recipient, 2)) nextErrors.default_referral_recipient = "Enter a default referral recipient.";
    if (!hasText(clinic.default_emails, 3)) nextErrors.default_emails = "Enter the default email details.";

    if (!clinic.emr_usage) nextErrors.emr_usage = "Select whether you will use CIC EMR.";
    if (!hasText(clinic.check_pay_to, 2)) nextErrors.check_pay_to = "Enter the pay-to name.";
    if (!hasText(clinic.check_address, 8)) nextErrors.check_address = "Enter a valid mailing address.";

    return nextErrors;
  };

  const validateStep2 = () => {
    const locationErrors = clinic.locations.map((location) => {
      const entry = {};

      if (!hasText(location.clinic_name, 3)) entry.clinic_name = "Enter a valid location name.";
      if (!hasText(location.street, 6)) entry.street = "Enter a valid street address.";
      if (!hasText(location.city, 2)) entry.city = "Select a city.";
      if (!hasText(location.state, 2)) entry.state = "Select a state.";
      if (!/^\d{5}(-\d{4})?$/.test((location.zip || "").trim())) entry.zip = "Enter a valid ZIP code.";
      if (getPhoneDigits(location.phone).length < 10) entry.phone = "Enter a valid phone number.";
      if (!isValidEmail(location.email)) entry.email = "Enter a valid email address.";
      if (location.website && !isValidUrl(location.website)) entry.website = "Enter a valid website URL.";
      if (!Array.isArray(location.services) || location.services.length === 0) entry.services = "Select at least one speciality.";

      return entry;
    });

    return locationErrors.some((entry) => Object.keys(entry).length > 0)
      ? { locations: locationErrors }
      : {};
  };

  const validateStep3 = () => {
    const nextErrors = {};

    if (clinic.communication_agree !== "agree") {
      nextErrors.communication_agree = "You must agree to the Communication Protocol to continue.";
    }

    if (clinic.emr_agree !== "agree") {
      nextErrors.emr_agree = "You must agree to the EMR Usage to continue.";
    }

    return nextErrors;
  };

  const validateStep5 = () => {
    const nextErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!hasText(clinic.confirm_name, 3)) nextErrors.confirm_name = "Enter the full name of the person completing this form.";
    if (!hasText(clinic.confirm_title, 2)) nextErrors.confirm_title = "Enter a valid title.";
    if (!clinic.confirm_date) nextErrors.confirm_date = "Select the confirmation date.";
    if (clinic.confirm_date && clinic.confirm_date > today) nextErrors.confirm_date = "Confirmation date cannot be in the future.";

    return nextErrors;
  };

  const getStepErrors = (currentStep) => {
    if (currentStep === 1) return validateStep1();
    if (currentStep === 2) return validateStep2();
    if (currentStep === 3) return validateStep3();
    if (currentStep === 5) return validateStep5();
    return {};
  };

  const [clinic, setClinic] = useState({
    user_uuid: linkedUserUuid,
    clinic_name: "",
    website: "",
    service: "",

    primary_contact_name: "",
    primary_contact_title: "",
    primary_contact_phone: "",
    primary_contact_email: "",

    referral_method: "",
    referral_method_other: "",
    default_referral_recipient: "",
    default_emails: "",

    emr_usage: "",
    emr_notes: "",

    check_pay_to: "",
    check_address: "",

    locations: [
      {
        clinic_name: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
        website: "",
        services: []
      }
    ],

    communication_agree: "",
    emr_agree: "",

    additional_notes: "",

    confirm_name: "",
    confirm_title: "",
    confirm_date: (new Date().toISOString().split("T")[0])
,
  });

  useEffect(() => {
    setClinic((prev) => ({
      ...prev,
      user_uuid: linkedUserUuid || "",
    }));
  }, [linkedUserUuid]);

  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const updateField = (field, value) => {
    const normalizedValue = field === "website" ? normalizeUrl(value) : value;

    setClinic((prev) => ({
      ...prev,
      [field]: normalizedValue
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: undefined
    }));
  };

  const updateLocationField = (field, value) => {
    setClinic((prev) => ({
      ...prev,
      locations: [
        {
          ...prev.locations[0],
          [field]: value
        }
      ]
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();

    const nextErrors = getStepErrors(step);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = getStepErrors(5);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}create_facility.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clinic),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || data?.status === false) {
          throw new Error(data?.message || data?.error || "Something went wrong while submitting the onboarding form.");
        }

        setSubmitSuccess(data?.data?.facility || data?.facility || null);
      })
      .catch((error) => {
        setSubmitError(error.message || "Something went wrong while submitting the onboarding form.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [step]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-white">
    
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Clinic Onboarding
      </h1>

      {submitSuccess ? (
        <div className="max-w-2xl mx-auto rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-semibold text-emerald-300">
            Onboarding submitted successfully
          </h2>
          <p className="mt-3 text-sm sm:text-base text-emerald-100/90">
            The clinic location has been saved.
          </p>
          <p className="mt-3 text-sm sm:text-base text-emerald-100/90">
            We will send your login info via email at {clinic.locations[0]?.email}.
          </p>
        </div>
      ) : (
        <>

          {/* Progress */}
          <div className="flex flex-wrap gap-3 mb-8 text-sm sm:text-base">
            <div className={step >= 1 ? "font-bold text-blue-400" : ""}>1. Organization</div>
            <div className={step >= 2 ? "font-bold text-blue-400" : ""}>2. Locations</div>
            <div className={step >= 3 ? "font-bold text-blue-400" : ""}>3. Review</div>
            <div className={step >= 4 ? "font-bold text-blue-400" : ""}>4. Notes</div>
            <div className={step >= 5 ? "font-bold text-blue-400" : ""}>5. Confirmation</div>
          </div>

          <form onSubmit={step === 5 ? handleSubmit : handleNext}>

            {step === 1 && (
              <Step1Organization
                clinic={clinic}
                updateField={updateField}
                errors={errors}
              />
            )}

            {step === 2 && (
              <Step2Locations
                clinic={clinic}
                setClinic={setClinic}
                updateLocationField={updateLocationField}
                errors={errors}
              />
            )}

            {step === 3 && (
              <Step3Agreement
                clinic={clinic}
                updateField={updateField}
                errors={errors}
              />
            )}

            {step === 4 && (
              <Step4Notes
                clinic={clinic}
                updateField={updateField}
              />
            )}

            {step === 5 && (
              <Step5Confirmation
                clinic={clinic}
                updateField={updateField}
                errors={errors}
              />
            )}

            {submitError && (
              <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">

              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="bg-gray-700 px-6 py-2 rounded w-full sm:w-auto disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded w-full sm:w-auto disabled:opacity-60"
                disabled={isSubmitting}
              >
                {step === 5 ? (isSubmitting ? "Submitting..." : "Submit") : "Next Step"}
              </button>

            </div>

          </form>
        </>
      )}

    </div>
  );
}
