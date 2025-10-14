import ProtectedRoute from "../components/ProtectedRoute";

export default function Discovery() {
  const items = [
    {
      casePatient: "CASE‑2024‑001",
      firm: "Johnson & Associates",
      type: "Request for Production",
      status: "Sent",
      sent: "2024-09-15",
      due: "2024-09-30",
      priority: "Medium",
    },
    {
      casePatient: "Sarah Wilson",
      firm: "Legal Partners LLC",
      type: "Request for Admissions",
      status: "Overdue",
      sent: "2024-09-10",
      due: "2024-09-20",
      priority: "High",
    },
  ];

  const getTagClass = (status) => {
    if (status === "Overdue") return "tag tag-danger";
    if (status === "Sent") return "tag tag-ok";
    return "tag";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") return "tag tag-danger";
    if (priority === "Medium") return "tag tag-warn";
    return "tag tag-ok";
  };

  return (
    <ProtectedRoute>
      <div className="card">
        <h3>Discovery & Petitions</h3>
        <table>
          <thead>
            <tr>
              <th>Case/Patient</th>
              <th>Firm</th>
              <th>Type</th>
              <th>Status</th>
              <th>Sent</th>
              <th>Due</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.casePatient}</td>
                <td>{i.firm}</td>
                <td>{i.type}</td>
                <td><span className={getTagClass(i.status)}>{i.status}</span></td>
                <td>{i.sent}</td>
                <td>{i.due}</td>
                <td><span className={getPriorityClass(i.priority)}>{i.priority}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
