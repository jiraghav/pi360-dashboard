export default function KPIs({ kpis, loading, router, setReferralModalOpen }) {
  const items = [
    { label: "Total Cases", value: kpis?.totalCases, path: "/cases" },
    { label: "Active Cases", value: kpis?.activeCases, path: "/cases?status=active" },
    { label: "Pending Reports", value: kpis?.pendingReports, path: "/cases?status=pending_reports", description: "means requested records" },
    { label: "Open Tasks", value: kpis?.openTasks, path: "/tasks?status=open", description: "Not completed tasks" },
    { label: "New Referrals", value: kpis?.newReferrals, action: () => setReferralModalOpen(true) },
    { label: "Today’s Patients", value: "-", comingSoon: true },
    { label: "Messages", value: "-", comingSoon: true },
  ];

  return (
    <div className="col-span-12 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map(({ label, value, path, action, comingSoon, description }, i) => {
        const handleClick = () => {
          if (comingSoon) return; // disable clicks
          if (action) action();
          else if (path) router.push(path);
        };

        return (
          <div
            key={i}
            onClick={handleClick}
            className={`kpi p-4 text-center rounded-xl transition-colors ${
              comingSoon
                ? "cursor-not-allowed bg-slate-900/50 opacity-70"
                : "cursor-pointer hover:bg-slate-800"
            }`}
          >
            <div className="text-3xl font-semibold">
              {loading ? "…" : value || 0}
            </div>
            <div className="text-mute text-sm">
              {label}
              {comingSoon && (
                <span className="block text-xs text-slate-400 mt-1">
                  (Coming Soon)
                </span>
              )}
              {description && (
                <>
                  <div className="border-t border-slate-700 mt-2 mb-1 mx-auto" />
                  <span className="block text-xs text-slate-400">
                    {description}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
