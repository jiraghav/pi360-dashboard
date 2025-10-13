// app/schedule/page.js
import Link from "next/link";

export default function Schedule() {
  const schedule = [
    {
      date: "2025-10-08",
      time: "09:00",
      patient: "Jane Miller",
      provider: "Dr. Patel",
      type: "Eval",
      status: "Booked",
    },
    {
      date: "2025-10-08",
      time: "13:30",
      patient: "Mike Chen",
      provider: "Dr. Lee",
      type: "MRI",
      status: "Booked",
    },
  ];

  return (
    <div className="card">
      <h3>Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Provider</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((s, i) => (
            <tr key={i}>
              <td>{s.date}</td>
              <td>{s.time}</td>
              <td>{s.patient}</td>
              <td>{s.provider}</td>
              <td>{s.type}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "10px" }}>
        <Link className="btn" href="/schedule/quick">
          Quick Book
        </Link>
      </div>
    </div>
  );
}
