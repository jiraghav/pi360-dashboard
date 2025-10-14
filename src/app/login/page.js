"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestRoute from "../components/GuestRoute";
import { apiRequest } from "../utils/api"; // import your API helper

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
        body: { user: form.username, pass: form.password }, // your apiRequest can handle JSON
      });

      console.log("JWT Response:", data);

      // Save JWT to localStorage
      localStorage.setItem("token", data.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      // apiRequest should throw { message } if server sends error
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <GuestRoute>
      <div className="login-card">
        <div className="login-logo">PI</div>
        <h1>Welcome Back</h1>
        <p className="login-sub">Sign in to continue to PI360</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign In</button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </GuestRoute>
  );
}