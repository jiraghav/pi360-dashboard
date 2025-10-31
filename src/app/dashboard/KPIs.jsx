export default function KPIs({ kpis, loading, router, setReferralModalOpen }) {
  const items = [
    { label: "Active Cases", value: kpis?.activeCases, path: "/cases?status=active" },
    { label: "Pending Reports", value: kpis?.pendingReports, path: "/cases?status=pending_reports" },
    { label: "Open Tasks", value: kpis?.openTasks, path: "/tasks?status=open" },
    // The last KPI will open the modal instead of routing
    { label: "New Referrals", value: kpis?.newReferrals, action: () => setReferralModalOpen(true) },
  ];

  return (
    <div className="col-span-12 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map(({ label, value, path, action }, i) => {
        const handleClick = () => {
          if (action) action();
          else if (path) router.push(path);
        };

        return (
          <div
            key={i}
            onClick={handleClick}
            className="kpi p-4 text-center rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <div className="text-3xl font-semibold">{loading ? "…" : value || 0}</div>
            <div className="text-mute text-sm">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
