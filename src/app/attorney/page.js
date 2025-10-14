import ProtectedRoute from "../components/ProtectedRoute";

export default function Attorney() {
  const attorneys = [
    {
      firm: "Smith & Associates",
      primary: "Ashley Smith",
      activeCases: 12,
      phone: "(214) 555‑0033",
    },
    {
      firm: "Johnson Law",
      primary: "Daniel Johnson",
      activeCases: 9,
      phone: "(469) 555‑0444",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="card">
        <h3>Attorney Portal</h3>
        <table>
          <thead>
            <tr>
              <th>Firm</th>
              <th>Primary</th>
              <th>Active Cases</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {attorneys.map((a, i) => (
              <tr key={i}>
                <td>{a.firm}</td>
                <td>{a.primary}</td>
                <td>{a.activeCases}</td>
                <td>{a.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
