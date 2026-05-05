"use client";

import { useState } from "react";
import GuestRoute from "../components/GuestRoute";
import { apiRequest } from "../utils/api";
import Link from "next/link";

export default function RequestLoginInfoPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest("request_login_info.php", {
        method: "POST",
        body: { email: email.trim() },
      });
      if (data?.status === true) {
        setSuccess(true);
      } else {
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Request login info error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
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
        {success ? (
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
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-slate-400 text-sm mb-6">
              Login details were sent to that address. Check spam if you don&apos;t see it.
            </p>
            <Link href="/login" className="text-sky-400 hover:text-sky-300 text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
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
              <h1 className="text-3xl font-bold mb-1">Request login info</h1>
              <p className="text-slate-400 text-sm tracking-wide">
                Enter your firm email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
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
                    <span className="w-4 h-4 border-2 border-t-transparent border-[#06111d] rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send login info"
                )}
              </button>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="text-xs text-slate-500 mt-4">
                <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </GuestRoute>
  );
}
