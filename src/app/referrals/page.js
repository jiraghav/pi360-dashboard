// app/referrals/page.js
import Link from "next/link";

export default function Referrals() {
  const referrals = [
    {
      patient: "Jane Miller",
      phone: "(214) 555‑0187",
      firm: "Smith & Associates",
      injury: "Neck",
      priority: "High",
      status: "Intake",
      age: "2d",
    },
    {
      patient: "Mike Chen",
      phone: "(469) 555‑1123",
      firm: "Johnson Law",
      injury: "Back",
      priority: "Normal",
      status: "Pending",
      age: "1d",
    },
  ];

  const getTagClass = (priority) => {
    if (priority === "High") return "tag tag-warn";
    if (priority === "Normal") return "tag";
    return "tag";
  };

  return (
    <div className="card">
      <h3>Referrals</h3>
      <div className="chip">SLA: First contact &lt; 2hr</div>
      <table style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Firm</th>
            <th>Injury</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Age</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((r, i) => (
            <tr key={i}>
              <td>{r.patient}</td>
              <td>{r.phone}</td>
              <td>{r.firm}</td>
              <td>{r.injury}</td>
              <td>
                <span className={getTagClass(r.priority)}>{r.priority}</span>
              </td>
              <td>{r.status}</td>
              <td>{r.age}</td>
              <td>
                <Link className="btn" href="/referrals/new">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
