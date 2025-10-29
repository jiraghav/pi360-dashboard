"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestRoute from "../components/GuestRoute";
import { apiRequest } from "../utils/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("login.php", {
        method: "POST",
        body: { user: form.username, pass: form.password },
      });

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
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
            <h1 className="text-3xl font-bold mb-1">Welcome to PI 360</h1>
            <p className="text-slate-400 text-sm tracking-wide">
              Everything Personal Injury
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Email"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0b0f16] border border-slate-800 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0b0f16] border border-slate-800 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

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
                "Signing in..."
              ) : (
                "Sign In"
              )}
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex justify-end text-xs text-slate-500 mt-3">
              {/*<a href="#" className="hover:text-sky-400">
                Forgot Password?
              </a>*/}
              <Link href="/register" className="hover:text-sky-400">
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </main>
    </GuestRoute>
  );
}
