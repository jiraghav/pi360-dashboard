export default function Admin() {
  const templates = [
    { name: "Day 1 Follow‑up", channel: "SMS", preview: "Hi {{patient_name}}, this is {{clinic_name}}. We wanted to check in…" },
    { name: "Missed Appointment", channel: "SMS + Email", preview: "We noticed you missed your appointment today…" },
  ];

  return (
    <div className="card">
      <h3>Admin • Communication Templates</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Channel</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t, i) => (
            <tr key={i}>
              <td>{t.name}</td>
              <td>{t.channel}</td>
              <td>{t.preview}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
