import Link from "next/link";

export default function Messages() {
  const messages = [
    {
      with: "Jane Miller",
      channel: "SMS",
      last: "2025-10-07",
      preview: "Thanks, see you tomorrow at 9am.",
    },
    {
      with: "Smith & Associates",
      channel: "Email",
      last: "2025-10-06",
      preview: "Attached: treatment plan v2.",
    },
  ];

  return (
    <div className="card">
      <h3>Messages</h3>
      <table>
        <thead>
          <tr>
            <th>With</th>
            <th>Channel</th>
            <th>Last</th>
            <th>Preview</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m, i) => (
            <tr key={i}>
              <td>{m.with}</td>
              <td>{m.channel}</td>
              <td>{m.last}</td>
              <td>{m.preview}</td>
              <td>
                <Link className="btn" href="/messages/compose">
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
