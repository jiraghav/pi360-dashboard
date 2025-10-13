export default function Analytics() {
  const metrics = [
    { metric: "Leads → Visits", value: "89.2%" },
    { metric: "No‑Show Rate", value: "6.8%" },
    { metric: "Plan Completion", value: "87.5%" },
  ];

  return (
    <div className="card">
      <h3>Analytics</h3>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => (
            <tr key={i}>
              <td>{m.metric}</td>
              <td>{m.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
