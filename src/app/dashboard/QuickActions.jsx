export default function QuickActions({
  kpis,
  loading,
  router,
  setReviewModalOpen,
  setReferralModalOpen,
}) {
  return (
    <div className="col-span-12 xl:col-span-4 card p-5">
      <h3 className="text-mute mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => router.push("/referrals/new")} className="btn btn-primary">
          New Referral
        </button>
        <button onClick={() => router.push("/patients/new")} className="btn">
          New Patient
        </button>
        <button type="button" className="btn" onClick={() => setReviewModalOpen(true)}>
          <div className="text-3xl font-semibold">{loading ? "…" : kpis?.notesCount || 0}</div>
          Review Notes
        </button>
        <button type="button" className="btn" onClick={() => router.push("/cases")}>
          Send Message to Back Office
        </button>
      </div>
    </div>
  );
}
