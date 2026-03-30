"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClinicOnboardingForm from "../page";

export default function ClinicOnboardingByUuidPage() {
  const params = useParams();
  const userUuid = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Invalid onboarding link.");

  useEffect(() => {
    let isMounted = true;

    const checkUuid = async () => {
      if (!userUuid) {
        if (!isMounted) {
          return;
        }

        setIsValid(false);
        setErrorMessage("Invalid onboarding link.");
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}check_user_onboarding_uuid.php?uuid=${encodeURIComponent(userUuid)}`
        );
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        setIsValid(Boolean(response.ok && data?.status));
        setErrorMessage(data?.message || "Invalid onboarding link.");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setIsValid(false);
        setErrorMessage("Unable to verify this onboarding link right now.");
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkUuid();

    return () => {
      isMounted = false;
    };
  }, [userUuid]);

  if (isChecking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Clinic Onboarding</h1>
          <p className="mt-4 text-sm sm:text-base text-white/70">
            Verifying your onboarding link...
          </p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Clinic Onboarding</h1>
          <p className="mt-4 text-sm sm:text-base text-red-100">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  return <ClinicOnboardingForm linkedUserUuid={userUuid} />;
}
