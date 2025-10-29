"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestRoute from "../components/GuestRoute";
import { apiRequest } from "../utils/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (form.company.trim().length < 2) return "Company name must be at least 2 characters.";
    if (!/^[0-9]{10}$/.test(form.phone)) return "Phone number must be 10 digits.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email address.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true); // ✅ start loading
    try {
      const data = await apiRequest("register.php", {
        method: "POST",
        body: form,
      });

      if (data?.status === true) {
        setSuccess(true);
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <GuestRoute>
      <main
        className="min-h-screen flex items-center justify-center text-slate-200 px-4"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(56,189,248,.12), transparent 60%), radial-gradient(1000px 600px at 120% 10%, rgba(167,139,250,.10), transparent 60%), #0b0f16",
        }}
      >
        {success ? (
          // ✅ Success UI
          <div
            className="w-full max-w-md card p-8 text-center rounded-2xl"
            style={{
              background: "#0f1726",
              border: "1px solid #1b2534",
              boxShadow: "0 15px 40px rgba(0,0,0,.4)",
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500 grid place-items-center font-black text-xl">
              PI
            </div>
            <h1 className="text-2xl font-bold mb-2">Thank you for signing up!</h1>
            <p className="text-slate-400 mb-1">Welcome to PI 360.</p>
            <p className="text-slate-500 text-sm mb-6">
              Please wait while the administrator reviews your signup request.
            </p>
            <Link
              href="/login"
              className="text-sky-400 hover:text-sky-300 text-sm font-medium"
            >
              Go back to login page
            </Link>
          </div>
        ) : (
          // ✅ Registration Form
          <div
            className="w-full max-w-md card p-8 text-center rounded-2xl"
            style={{
              background: "#0f1726",
              border: "1px solid #1b2534",
              boxShadow: "0 15px 40px rgba(0,0,0,.4)",
            }}
          >
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500 grid place-items-center font-black text-xl">
                PI
              </div>
              <h1 className="text-3xl font-bold mb-1">Create Your Account</h1>
              <p className="text-slate-400 text-sm tracking-wide">
                Join PI 360 — Everything Personal Injury
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0b0f16] border border-slate-800 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={form.company}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0b0f16] border border-slate-800 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone (10 digits)"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0b0f16] border border-slate-800 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0b0f16] border border-slate-800 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full transition flex items-center justify-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{
                  background: "linear-gradient(90deg,#38bdf8,#34d399)",
                  color: "#06111d",
                  fontWeight: "700",
                  borderRadius: "12px",
                  padding: ".75rem 1rem",
                  border: "1px solid #1b2534",
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-[#06111d] rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  "Register"
                )}
              </button>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="text-xs text-slate-500 mt-4">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-sky-400 hover:text-sky-300 font-medium"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </GuestRoute>
  );
}