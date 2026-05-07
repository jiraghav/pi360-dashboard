"use client";

import { useState, useRef } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";
import { logout } from "../utils/auth";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

const inputClass =
  "w-full rounded-lg sm:rounded-xl border border-gray-700/80 bg-[#0b0f16] px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 transition focus:border-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:px-3.5 sm:py-2.5 sm:pr-11";

export default function DeleteAccountCard() {
  const { showToast } = useToast();
  const passwordRef = useRef(null);

  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      showToast("error", "Enter your password to continue.");
      return;
    }

    if (phrase !== CONFIRM_PHRASE) {
      showToast("error", `Type exactly: ${CONFIRM_PHRASE}`);
      return;
    }

    setBusy(true);
    try {
      const data = await apiRequest("delete_account.php", {
        method: "POST",
        body: {
          password: password.trim(),
          confirm_phrase: phrase.trim(),
        },
      });

      showToast("success", data?.message || "Your account has been deleted.");
      logout();
    } catch (err) {
      showToast("error", err.message || "Could not delete your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-red-500/25 bg-[#111827]/90 text-white shadow-lg shadow-red-950/20 backdrop-blur-sm sm:rounded-2xl sm:shadow-xl">
      <div className="relative border-b border-red-500/20 bg-gradient-to-r from-red-500/15 via-red-950/20 to-transparent px-4 py-3.5 sm:px-6 sm:py-5 md:px-7 md:py-6">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400 ring-1 ring-red-500/30 sm:h-11 sm:w-11 sm:rounded-xl">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl">
              Delete account
            </h2>
            <p className="mt-0.5 hidden text-sm text-gray-400 leading-snug sm:mt-1 sm:block">
              This removes your access to the app. You will be signed out and cannot sign in again with this account unless support restores it.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-7">
        <div className="mb-4 flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-100/90 sm:mb-6 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400 sm:h-4 sm:w-4" />
          <p className="leading-snug sm:leading-relaxed">
            <span className="hidden sm:inline">
              This action cannot be undone from the app. If you change your mind, contact{" "}
            </span>
            <span className="sm:hidden">Need help? </span>
            <a
              href="mailto:schedule@cic.clinic"
              className="font-medium text-amber-200 underline decoration-amber-200/40 underline-offset-2 hover:text-amber-100"
            >
              schedule@cic.clinic
            </a>
            <span className="text-amber-200/60"> · </span>
            <a
              href="tel:2146666651"
              className="font-medium text-amber-200 underline decoration-amber-200/40 underline-offset-2 hover:text-amber-100"
            >
              214-666-6651
            </a>
            <span className="hidden sm:inline">.</span>
          </p>
        </div>

        <form className="space-y-3 sm:space-y-5" onSubmit={handleDeleteAccount}>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-1.5 sm:text-xs">
              Your password
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-1.5 sm:text-xs">
              Confirmation phrase
            </label>
            <p className="mb-1.5 text-[11px] text-gray-500 sm:mb-2 sm:text-xs">
              Type{" "}
              <span className="rounded bg-white/5 px-1 py-0.5 font-mono text-[10px] text-amber-200/90 sm:text-xs">
                {CONFIRM_PHRASE}
              </span>
            </p>
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              className="w-full rounded-lg border border-gray-700/80 bg-[#0b0f16] px-3 py-2 font-mono text-xs text-white placeholder:text-gray-600 transition focus:border-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm"
              placeholder={CONFIRM_PHRASE}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className={`btn inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-600/80 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:border-red-500 hover:bg-red-500 sm:rounded-xl sm:px-5 sm:py-3 md:w-auto ${
              busy ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {busy ? "Deleting…" : "Delete my account"}
          </button>
        </form>
      </div>
    </section>
  );
}
