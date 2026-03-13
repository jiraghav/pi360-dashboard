"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function ChangePasswordPage() {
  const router = useRouter();
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

  /* ---------- PASSWORD RULES ---------- */

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

  /* ---------- LIVE VALIDATION ---------- */

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

  /* ---------- SUBMIT ---------- */

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

  /* ---------- UI ---------- */

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-3xl mx-auto space-y-8">
        <section className="card p-0 shadow-lg bg-gray-900 text-white overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800">
            <h3 className="text-xl font-semibold">Change Password</h3>
            <p className="text-sm text-gray-400 mt-1">
              Use a strong password to keep your account secure.
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            <form
              ref={formRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Current */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300 mb-1 block">
                  Current Password
                </label>
              
                <div className="relative">
                  <input
                    ref={currentPassRef}
                    type={showCurrent ? "text" : "password"}
                    name="current_password"
                    onChange={handleCurrentChange}
                    className={`w-full rounded border px-3 py-2 pr-10 bg-black text-white
                    ${errors.current_password ? "border-red-500" : "border-gray-700"}`}
                    placeholder="Current Password"
                  />
              
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrent ? (
                      // 👁️ Eye open icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      // 🙈 Eye closed icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.642-4.362M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              
                {errors.current_password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.current_password}
                  </p>
                )}
              </div>

              {/* New */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300 mb-1 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    name="new_password"
                    onChange={handlePasswordChange}
                    className={`w-full rounded border px-3 py-2 pr-10 bg-black text-white
                    ${errors.new_password ? "border-red-500" : "border-gray-700"}`}
                    placeholder="New Password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNew ? (
                      // 👁️ Eye open icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      // 🙈 Eye closed icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.642-4.362M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.new_password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.new_password}
                  </p>
                )}

                {strength && (
                  <p
                    className={`text-xs mt-1 ${
                      strength === "weak"
                        ? "text-red-400"
                        : strength === "medium"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    Password strength: {strength}
                  </p>
                )}
              </div>

              {/* Confirm */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300 mb-1 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm_password"
                    onChange={handleConfirmChange}
                    className={`w-full rounded border px-3 py-2 pr-10 bg-black text-white
                    ${errors.confirm_password ? "border-red-500" : "border-gray-700"}`}
                    placeholder="Confirm Password"
                  />
                
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirm ? (
                      // 👁️ Eye open icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      // 🙈 Eye closed icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.642-4.362M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-gray-800 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary px-5 py-2.5 w-full md:w-auto ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => router.push("/dashboard")}
                  className="btn w-full md:w-auto"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>

        </section>
      </main>
    </ProtectedRoute>
  );
}