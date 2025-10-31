"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useRouter } from "next/navigation";
import ReviewNotesModal from "./ReviewNotesModal";
import NewReferralModal from "./NewReferralModal";
import QuickActions from "./QuickActions";
import KPIs from "./KPIs";
import ClinicalAlerts from "./ClinicalAlerts";
import ActivityFeed from "./ActivityFeed";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiRequest("dashboard.php");
        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = dashboardData || {};
  const alerts = dashboardData?.clincalAlerts || [];
  const activities = dashboardData?.submittedToLawyers || [];

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="grid grid-cols-12 gap-4">
          <QuickActions
            kpis={kpis}
            loading={loading}
            router={router}
            setReviewModalOpen={setReviewModalOpen}
            setReferralModalOpen={setReferralModalOpen}
          />
          <KPIs kpis={kpis} loading={loading} router={router} setReferralModalOpen={setReferralModalOpen} />
        </section>

        <section className="grid grid-cols-12 gap-4">
          <ClinicalAlerts
            alerts={alerts}
            loading={loading}
            error={error}
          />
          <ActivityFeed activities={activities} loading={loading} error={error} />
        </section>
      </main>

      <ReviewNotesModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
      <NewReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
      />
    </ProtectedRoute>
  );
}
