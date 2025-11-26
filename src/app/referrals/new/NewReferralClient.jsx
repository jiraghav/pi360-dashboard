"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import ReferralForm from "./ReferralForm";

export default function NewReferralClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pid = searchParams.get("pid");

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-3xl mx-auto space-y-8">
        <section className="card p-6 shadow-lg bg-gray-900 text-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">New Referral</h3>
            <button
              type="button"
              onClick={() => router.push("/patients/new")}
              className="btn btn-sm btn-primary"
            >
              + New Patient
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Add a new patient or select an existing one from the list below.
          </p>

          <ReferralForm router={router} pid={pid} />
        </section>
      </main>
    </ProtectedRoute>
  );
}
