"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import ChangePasswordCard from "./ChangePasswordCard";
import DeleteAccountCard from "./DeleteAccountCard";
import { KeyRound, Settings, Trash2 } from "lucide-react";

const MD_MIN_WIDTH = 768;

function useIsMdUp() {
  const [mdUp, setMdUp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_MIN_WIDTH}px)`);
    const apply = () => setMdUp(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return mdUp;
}

export default function SettingsPage() {
  const [mobileTab, setMobileTab] = useState("password");
  const mdUp = useIsMdUp();

  return (
    <ProtectedRoute>
      <main className="relative min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 md:py-12">
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden max-md:opacity-60"
          aria-hidden
        >
          <div className="absolute -top-24 right-0 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute top-32 -left-12 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <header className="mb-4 md:mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-sky-300/90 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-1 sm:text-xs">
            <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
            Account
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl">
            Settings
          </h1>
          <p className="mt-1 hidden max-w-xl text-sm text-gray-400 leading-snug sm:mt-2 sm:block md:text-base md:leading-relaxed">
            Update your password or remove your account from this app. Changes apply to your PI360 login only.
          </p>
          <p className="mt-1 text-xs text-gray-500 sm:hidden">
            Password and account options for your PI360 login.
          </p>
        </header>

        {mdUp ? (
          <div className="flex flex-col gap-4 md:gap-10">
            <ChangePasswordCard />
            <DeleteAccountCard />
          </div>
        ) : (
          <>
            <div
              className="mb-4"
              role="tablist"
              aria-label="Settings sections"
            >
              <div className="flex rounded-xl border border-white/10 bg-[#0b0f16]/90 p-1 shadow-inner">
                <button
                  type="button"
                  role="tab"
                  id="tab-password"
                  aria-selected={mobileTab === "password"}
                  aria-controls="panel-password"
                  onClick={() => setMobileTab("password")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                    mobileTab === "password"
                      ? "bg-sky-500/20 text-white shadow-sm ring-1 ring-sky-500/30"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <KeyRound className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
                  Password
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-delete"
                  aria-selected={mobileTab === "delete"}
                  aria-controls="panel-delete"
                  onClick={() => setMobileTab("delete")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                    mobileTab === "delete"
                      ? "bg-red-500/20 text-white shadow-sm ring-1 ring-red-500/35"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Trash2 className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
                  Delete
                </button>
              </div>
            </div>

            {mobileTab === "password" ? (
              <div
                id="panel-password"
                role="tabpanel"
                aria-labelledby="tab-password"
              >
                <ChangePasswordCard />
              </div>
            ) : (
              <div
                id="panel-delete"
                role="tabpanel"
                aria-labelledby="tab-delete"
              >
                <DeleteAccountCard />
              </div>
            )}
          </>
        )}

        <footer className="mt-6 rounded-xl border border-white/10 bg-[#0f1726]/80 px-3 py-2.5 text-center text-xs text-gray-400 backdrop-blur-sm sm:mt-10 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm md:text-left">
          <span className="text-gray-500">Questions? </span>
          <a
            href="tel:2146666651"
            className="font-medium text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
          >
            214-666-6651
          </a>
          <span className="text-gray-600"> · </span>
          <a
            href="mailto:schedule@cic.clinic"
            className="font-medium text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
          >
            schedule@cic.clinic
          </a>
        </footer>
      </main>
    </ProtectedRoute>
  );
}
