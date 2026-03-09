"use client";

import { useState, useEffect } from "react";
import Step1Organization from "./Step1Organization";
import Step2Locations from "./Step2Locations";
import Step3Agreement from "./Step3Agreement";
import Step4Notes from "./Step4Notes";
import Step5Confirmation from "./Step5Confirmation";

export default function ClinicOnboardingForm() {

  const [step, setStep] = useState(1);

  const [clinic, setClinic] = useState({
    organization_name: "",
    website: "",

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
        use_defaults: true,
        specialties: []
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

  const back = () => setStep((s) => s - 1);

  const updateField = (field, value) => {
    setClinic((prev) => ({
      ...prev,
      [field]: value
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

    const form = e.target;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStep((s) => s + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    console.log("Submitting clinic:", clinic);
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
          />
        )}

        {step === 2 && (
          <Step2Locations
            clinic={clinic}
            setClinic={setClinic}
            updateLocationField={updateLocationField}
          />
        )}

        {step === 3 && (
          <Step3Agreement
            clinic={clinic}
            updateField={updateField}
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
          />
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">

          {step > 1 && (
            <button
              type="button"
              onClick={back}
              className="bg-gray-700 px-6 py-2 rounded w-full sm:w-auto"
            >
              Back
            </button>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded w-full sm:w-auto"
          >
            {step === 5 ? "Submit" : "Next Step"}
          </button>

        </div>

      </form>

    </div>
  );
}