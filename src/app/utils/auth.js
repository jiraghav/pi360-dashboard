// utils/auth.js
export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  return !!token; // returns true if token exists
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
