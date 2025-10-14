// utils/api.js
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiRequest(endpoint, options = {}) {
  try {
    // Get token if exists
    const token = localStorage.getItem("token");

    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body instanceof FormData
        ? {} // Let browser set correct multipart boundary
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body:
        options.body && !(options.body instanceof FormData)
          ? JSON.stringify(options.body)
          : options.body,
    });

    if (res.status === 401) {
      // Unauthorized: remove token and redirect
      localStorage.removeItem("token");
      window.location.href = "/lawyer/login";
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "API request failed");
    }

    return data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}
