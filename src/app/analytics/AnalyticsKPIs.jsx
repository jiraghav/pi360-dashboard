"use client";
import { useRouter } from "next/navigation";

export default function AnalyticsKPIs({ kpis = [], loading }) {
  const router = useRouter();

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => {
        const actions = {
          "Total Patients": () => router.push("/cases?status=all"),
          "Active Patients": () => router.push("/cases?status=active"),
          "Completed": () => router.push("/cases?status=completed"),
        };

        const onClick = actions[kpi.label];
        const clickable = typeof onClick === "function";

        return (
          <div
            key={i}
            onClick={clickable ? onClick : undefined}
            className={`kpi p-4 text-center rounded-xl transition-colors ${
              clickable
                ? "cursor-pointer hover:bg-slate-800 bg-slate-900/40"
                : "cursor-not-allowed bg-slate-900/20 opacity-70"
            }`}
          >
            <div className="text-3xl font-semibold">
              {loading ? "…" : kpi.value ?? 0}
            </div>
            <div className="text-mute text-sm">{kpi.label}</div>
          </div>
        );
      })}
    </section>
  );
}
