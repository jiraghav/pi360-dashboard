export function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = ('' + phone).replace(/\D/g, ''); // Remove non-digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}‑${match[3]}`;
  }
  return phone; // return original if it doesn't match
};