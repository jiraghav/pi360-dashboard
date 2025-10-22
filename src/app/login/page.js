"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestRoute from "../components/GuestRoute";
import { apiRequest } from "../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
    }
  };

  return (
    <GuestRoute>
      <main className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="w-full max-w-md bg-[#0b0f16] rounded-xl p-8 shadow-lg text-center space-y-4">
          <div className="login-logo text-4xl font-bold text-white mb-2">PI</div>
          <h1 className="text-2xl font-semibold text-white">Welcome Back</h1>
          <p className="text-gray-400 mb-6">Sign in to continue to PI360</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Sign In
            </button>

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </form>

          <div className="text-gray-500 text-sm mt-4">
            &copy; {new Date().getFullYear()} PI360. All rights reserved.
          </div>
        </div>
      </main>
    </GuestRoute>
  );
}
