// app/dashboard/page.js
import Link from "next/link";

export default function Dashboard() {
  return (
    <section>
      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          <Link href="/referrals/new" className="btn primary">New Referral</Link>
          <Link href="/schedule" className="btn">Schedule Visit</Link>
          <Link href="/messages/compose" className="btn">Send Message</Link>
          <Link href="/tasks/new" className="btn">Create Task</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>KPIs</h3>
        <div className="kpi-4" style={{ marginTop: '8px' }}>
          <div className="tile"><div className="label">Pending Referrals</div><div className="value">12</div></div>
          <div className="tile"><div className="label">Active Cases</div><div className="value">48</div></div>
          <div className="tile"><div className="label">Today's Appointments</div><div className="value">8</div></div>
          <div className="tile"><div className="label">Open Tasks</div><div className="value">23</div></div>
        </div>
      </div>

      {/* Priority Alerts & Recent Activity */}
      <div className="two" style={{ marginTop: '12px' }}>
        <div className="card">
          <h3>Priority Alerts</h3>
          <table>
            <tbody>
              <tr>
                <td>Case #1234 missing LOP signature</td>
                <td><span className="tag tag-danger">urgent</span></td>
              </tr>
              <tr>
                <td>3 appointments with no‑show risk today</td>
                <td><span className="tag tag-warn">warning</span></td>
              </tr>
              <tr>
                <td>Weekly attorney report ready</td>
                <td><span className="tag tag-ok">ok</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <table>
            <tbody>
              <tr>
                <td>New referral from Smith & Associates</td>
                <td><span className="tag tag-ok">new</span></td>
              </tr>
              <tr>
                <td>John Doe appointment scheduled</td>
                <td><span className="tag tag-ok">scheduled</span></td>
              </tr>
              <tr>
                <td>Follow‑up task completed for Case #1234</td>
                <td><span className="tag tag-ok">completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
