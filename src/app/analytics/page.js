"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";

import AnalyticsKPIs from "./AnalyticsKPIs";
import AverageCaseDurationChart from "./AverageCaseDurationChart";
import PatientStatusChart from "./PatientStatusChart";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiRequest("analytics.php");
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-20 py-8 mx-auto space-y-8">
        <AnalyticsKPIs kpis={analyticsData?.kpis} loading={loading} />

        <section className="grid grid-cols-12 gap-6">
          <PatientStatusChart loading={loading} error={error} />
          <AverageCaseDurationChart
            data={analyticsData?.avgCaseDuration}
            loading={loading}
            error={error}
          />
        </section>
      </main>
    </ProtectedRoute>
  );
}
