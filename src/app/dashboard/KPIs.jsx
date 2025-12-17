"use client";

import { PlusCircle, MapPin, CarFront, Siren } from "lucide-react";
import { useToast } from "../hooks/ToastContext";
import { apiRequest } from "../utils/api";

export default function KPIs({
  kpis,
  loading,
  router,
  setReferralModalOpen,
  setNewLocationRequestModalOpen,
}) {
  const { showToast } = useToast();

  // function to fetch ER department and redirect
  const handleSendToER = async () => {
      router.push("/maps?send_to_er=1");
  };

  const items = [
    { label: "Total Cases", value: kpis?.totalCases, path: "/cases" },
    { label: "Active Cases", value: kpis?.activeCases, path: "/cases?status=active" },
    {
      label: "Pending Reports",
      value: kpis?.pendingReports,
      path: "/cases?status=pending_reports",
      description: "Requested records",
    },
    {
      label: "Open Tasks",
      value: kpis?.openTasks,
      path: "/tasks?status=open",
      description: "Not completed tasks",
    },
    {
      label: "New Referrals",
      value: kpis?.newReferrals,
      action: () => setReferralModalOpen(true),
    },
    {
      label: "New Location Request",
      value: <MapPin className="w-7 h-7 inline text-blue-400" />,
      action: () => setNewLocationRequestModalOpen(true),
    },
    { label: "Today’s Patients", value: "-", comingSoon: true },
    { label: "Messages", value: "-", comingSoon: true },
    {
      label: "Request Ride",
      value: <CarFront className="w-7 h-7 inline text-blue-400" />,
      comingSoon: true,
    },
    {
      label: "Send To ER",
      value: <Siren className="w-7 h-7 inline text-blue-400" />,
      description: "Emergency department",
      action: handleSendToER,
    },
  ];

  return (
    <div className="col-span-12 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map(({ label, value, path, action, comingSoon, description }, i) => {
        const handleClick = () => {
          if (comingSoon) return;
          if (action) action();
          else if (path) router.push(path);
        };

        return (
          <div
            key={i}
            onClick={handleClick}
            className={`kpi flex flex-col items-center justify-center p-3 text-center rounded-lg transition-colors min-h-[100px] ${
              comingSoon
                ? "cursor-not-allowed bg-slate-900/50 opacity-70"
                : "cursor-pointer hover:bg-slate-800"
            }`}
          >
            <div className="text-2xl font-semibold flex justify-center items-center gap-1 mb-1">
              {loading ? "…" : value || 0}
            </div>
            <div className="text-mute text-sm">
              {label}
              {comingSoon && (
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  (Coming Soon)
                </span>
              )}
              {description && (
                <>
                  <div className="border-t border-slate-700 mt-1.5 mb-0.5 mx-auto w-3/4" />
                  <span className="block text-[11px] text-slate-400">
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
