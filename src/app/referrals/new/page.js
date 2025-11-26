import { Suspense } from "react";
import NewReferralClient from "./NewReferralClient";

export default function NewReferralPage() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <NewReferralClient />
    </Suspense>
  );
}
