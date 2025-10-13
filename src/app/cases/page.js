// app/cases/page.js
import Link from "next/link";

export default function Cases() {
  const cases = [
    {
      patient: "Jane Miller",
      firm: "Smith & Associates",
      status: "Active",
      stage: "Treatment",
      lastVisit: "—",
      imaging: "Pending",
    },
    {
      patient: "Mike Chen",
      firm: "Johnson Law",
      status: "Active",
      stage: "Evaluation",
      lastVisit: "—",
      imaging: "Ordered",
    },
  ];

  return (
    <div className="card">
      <h3>Cases</h3>
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Firm</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Last Visit</th>
            <th>Imaging</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c, i) => (
            <tr key={i}>
              <td>{c.patient}</td>
              <td>{c.firm}</td>
              <td>{c.status}</td>
              <td>{c.stage}</td>
              <td>{c.lastVisit}</td>
              <td>{c.imaging}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}