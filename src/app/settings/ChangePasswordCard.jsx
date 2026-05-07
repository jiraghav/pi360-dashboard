"use client";

import { useState, useRef, useEffect } from "react";
import { KeyRound, Shield } from "lucide-react";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

const inputClass = (hasError) =>
  `w-full rounded-lg sm:rounded-xl border px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 transition sm:px-3.5 sm:py-2.5 sm:pr-11
  bg-[#0b0f16] focus:outline-none focus:ring-2 focus:ring-sky-500/25
  ${hasError ? "border-red-500/70 focus:border-red-500" : "border-gray-700/80 focus:border-sky-500/50"}`;

export default function ChangePasswordCard() {
  const { showToast } = useToast();

  const formRef = useRef(null);
  const currentPassRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    currentPassRef.current?.focus();
  }, []);

  const validatePassword = (password) => {
    if (password.length < 8) return "Minimum 8 characters required";
    if (!/[A-Z]/.test(password)) return "At least one uppercase letter required";
    if (!/[0-9]/.test(password)) return "At least one number required";
    if (!/[!@#$%^&*]/.test(password)) return "At least one special character required";
    return "";
  };

  const getStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
  };

  const handleCurrentChange = (e) => {
    const value = e.target.value;

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value) newErrors.current_password = "Current password required";
      else delete newErrors.current_password;
      return newErrors;
    });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setStrength(getStrength(value));

    setErrors((prev) => {
      const newErrors = { ...prev };

      const err = validatePassword(value);
      if (err) newErrors.new_password = err;
      else delete newErrors.new_password;

      const confirmValue = formRef.current?.confirm_password?.value;
      if (confirmValue && confirmValue !== value) {
        newErrors.confirm_password = "Passwords do not match";
      } else {
        delete newErrors.confirm_password;
      }

      return newErrors;
    });
  };

  const handleConfirmChange = (e) => {
    const confirmValue = e.target.value;
    const newValue = formRef.current?.new_password?.value;

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (confirmValue !== newValue) {
        newErrors.confirm_password = "Passwords do not match";
      } else {
        delete newErrors.confirm_password;
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formEl = formRef.current;

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    const formData = new FormData(formEl);

    const currentPass = formData.get("current_password");
    const newPass = formData.get("new_password");
    const confirmPass = formData.get("confirm_password");

    let newErrors = {};

    if (!currentPass) newErrors.current_password = "Current password required";

    if (newPass !== confirmPass) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (currentPass === newPass) {
      newErrors.new_password = "New password must be different";
    }

    const passwordError = validatePassword(newPass);
    if (passwordError) {
      newErrors.new_password = passwordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await apiRequest("change_password.php", {
        method: "POST",
        body: formData,
      });

      showToast("success", "Password updated successfully");

      formEl.reset();
      setStrength("");
      currentPassRef.current?.focus();
    } catch (err) {
      showToast("error", err.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthBars =
    strength === "weak" ? 1 : strength === "medium" ? 3 : strength === "strong" ? 4 : 0;
  const strengthColor =
    strength === "weak"
      ? "bg-red-500"
      : strength === "medium"
        ? "bg-amber-400"
        : strength === "strong"
          ? "bg-emerald-500"
          : "bg-gray-700";

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]/90 text-white shadow-lg shadow-black/20 backdrop-blur-sm sm:rounded-2xl sm:shadow-xl">
      <div className="relative border-b border-white/10 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/5 px-4 py-3.5 sm:px-6 sm:py-5 md:px-7 md:py-6">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/25 sm:h-11 sm:w-11 sm:rounded-xl">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl">
              Change password
            </h2>
            <p className="mt-0.5 hidden text-sm text-gray-400 leading-snug sm:mt-1 sm:block">
              Use a strong, unique password. You will stay signed in on this device after updating.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-7">
        <form
          ref={formRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-1.5 sm:text-xs">
              Current password
            </label>

            <div className="relative">
              <input
                ref={currentPassRef}
                type={showCurrent ? "text" : "password"}
                name="current_password"
                onChange={handleCurrentChange}
                className={inputClass(!!errors.current_password)}
                placeholder="Enter current password"
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.642-4.362M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            {errors.current_password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.current_password}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-1.5 sm:text-xs">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="new_password"
                onChange={handlePasswordChange}
                className={inputClass(!!errors.new_password)}
                placeholder="Create a new password"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.642-4.362M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            {errors.new_password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.new_password}</p>
            )}

            {strength && (
              <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:flex-col sm:items-stretch sm:space-y-2">
                <div className="flex min-w-0 flex-1 gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strengthBars ? strengthColor : "bg-gray-800"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`shrink-0 text-[10px] font-medium capitalize sm:text-xs ${
                    strength === "weak"
                      ? "text-red-400"
                      : strength === "medium"
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {strength}
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-1.5 sm:text-xs">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm_password"
                onChange={handleConfirmChange}
                className={inputClass(!!errors.confirm_password)}
                placeholder="Re-enter new password"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.642-4.362M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.confirm_password}</p>
            )}
          </div>

          <div className="md:col-span-2 mt-1 flex gap-2 border-t border-white/10 pt-4 sm:mt-2 sm:gap-3 sm:pt-6 md:justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-2 text-sm sm:px-6 sm:py-2.5 md:w-auto ${
                isSubmitting ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 opacity-90 sm:h-4 sm:w-4" strokeWidth={2} />
              {isSubmitting ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
