export function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = ('' + phone).replace(/\D/g, ''); // Remove non-digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}‑${match[3]}`;
  }
  return phone; // return original if it doesn't match
};

export function formatDate(dateStr) {
  if (!dateStr) return "";

  // Expecting input like "2025-11-06 13:45:00"
  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return dateStr;

  const [year, month, day] = datePart.split("-");
  let [hour, minute, second] = timePart.split(":");

  // Convert to 12-hour format with AM/PM
  let period = "AM";
  hour = parseInt(hour, 10);
  if (hour >= 12) {
    period = "PM";
    if (hour > 12) hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }

  // Pad month, day, hour, minute, second
  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(month)}/${pad(day)}/${year} ${pad(hour)}:${pad(minute)} ${period}`;
}
