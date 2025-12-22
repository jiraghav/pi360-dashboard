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
import GreetingHeader from "./GreetingHeader";
import NewLocationRequestModal from "./NewLocationRequestModal";
import SendMessageModal from "../cases/SendMessageModal";
import { useToast } from "../hooks/ToastContext";
import SendTelemedLinkModal from "../cases/SendTelemedLinkModal";
import SendTeleneuroLinkModal from "../cases/SendTeleneuroLinkModal";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [newLocationRequestModalOpen, setNewLocationRequestModalOpen] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showSendTelemedLinkModal, setShowSendTelemedLinkModal] = useState(false);
  const [showSendTeleneuroLinkModal, setShowSendTeleneuroLinkModal] = useState(false);
  const router = useRouter();

  const [selectedCase, setSelectedCase] = useState({"message": ""});
  const { showToast } = useToast();

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
  
  const sendBackOfficeMessage = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("message", selectedCase.message || "");
      const res = await apiRequest("send_back_office_msg.php", { method: "POST", body: formData });
      if (res.status) {
        showToast("success", res.message);
        setSelectedCase({"message": ""});
        setShowSendMessageModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const sendTelemedLink = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("phone", selectedCase.phone_home || "");

      const res = await apiRequest("send_telemed_link.php", {
        method: "POST",
        body: formData,
      });

      if (res.status) {
        showToast("success", res.message || "Telemed link sent successfully");
        setShowSendTelemedLinkModal(false);
        setSelectedCase();
      } else {
        showToast("error", res.message || "Failed to send telemed link");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Something went wrong while sending the telemed link");
    }
  };
  
  const sendTeleneuroLink = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("phone", selectedCase.phone_home || "");

      const res = await apiRequest("send_teleneuro_link.php", {
        method: "POST",
        body: formData,
      });

      if (res.status) {
        showToast("success", res.message || "Teleneuro link sent successfully");
        setShowSendTeleneuroLinkModal(false);
        setSelectedCase();
      } else {
        showToast("error", res.message || "Failed to send teleneuro link");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Something went wrong while sending the teleneuro link");
    }
  };

  const kpis = dashboardData || {};
  const alerts = dashboardData?.clincalAlerts || [];
  const activities = dashboardData?.submittedToLawyers || [];
  const userName = dashboardData?.lawyer_name || "Personal Injury Lawyer";

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <GreetingHeader userName={dashboardData?.lawyer_name} loading={loading} />

        <section className="grid grid-cols-12 gap-4">
          <QuickActions
            kpis={kpis}
            loading={loading}
            router={router}
            setReviewModalOpen={setReviewModalOpen}
            setReferralModalOpen={setReferralModalOpen}
            setShowSendMessageModal={setShowSendMessageModal}
          />
          <KPIs kpis={kpis}
                loading={loading}
                router={router}
                setReferralModalOpen={setReferralModalOpen}
                setNewLocationRequestModalOpen={setNewLocationRequestModalOpen}
                setShowSendTelemedLinkModal={setShowSendTelemedLinkModal}
                setShowSendTeleneuroLinkModal={setShowSendTeleneuroLinkModal}
               />
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
      <NewLocationRequestModal
        isOpen={newLocationRequestModalOpen}
        onClose={() => setNewLocationRequestModalOpen(false)}
      />
      {showSendMessageModal && (
        <SendMessageModal
          selectedCase={selectedCase}
          onClose={() => setShowSendMessageModal(false)}
          onConfirm={sendBackOfficeMessage}
          setSelectedCase={setSelectedCase}
        />
      )}
      {showSendTelemedLinkModal && (
        <SendTelemedLinkModal
          showPatientSelection={true} 
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          onClose={() => {setShowSendTelemedLinkModal(false); setSelectedCase();}}
          onConfirm={sendTelemedLink}
        />
      )}
      {showSendTeleneuroLinkModal && (
        <SendTeleneuroLinkModal
          showPatientSelection={true} 
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          onClose={() => {setShowSendTeleneuroLinkModal(false); setSelectedCase();}}
          onConfirm={sendTeleneuroLink}
        />
      )}

    </ProtectedRoute>
  );
}
