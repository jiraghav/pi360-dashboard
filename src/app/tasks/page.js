import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Tasks() {
  const tasks = [
    {
      title: "Confirm MRI",
      owner: "Intake",
      due: "—",
      status: "Waiting",
    },
    {
      title: "Send LOP",
      owner: "Records",
      due: "—",
      status: "Sent",
    },
  ];

  const getTagClass = (status) => {
    if (status === "Waiting") return "tag tag-warn";
    if (status === "Sent") return "tag tag-ok";
    return "tag";
  };

  return (
    <ProtectedRoute>
      <div className="card">
        <h3>Tasks</h3>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => (
              <tr key={i}>
                <td>{t.title}</td>
                <td>{t.owner}</td>
                <td>{t.due}</td>
                <td>
                  <span className={getTagClass(t.status)}>{t.status}</span>
                </td>
                <td>
                  <Link className="btn" href="/tasks/new">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "10px" }}>
          <Link className="btn primary" href="/tasks/new">
            + Task
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
