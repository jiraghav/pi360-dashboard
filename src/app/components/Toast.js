"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Toast({ type = "info", message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const toastStyle =
    type === "success"
      ? "bg-gradient-to-r from-sky-500 to-mint-500 text-[#06111d] font-semibold"
      : type === "error"
      ? "bg-gradient-to-r from-rose-500 to-amber-500 text-[#06111d] font-semibold"
      : "bg-gradient-to-r from-slate-600 to-slate-500 text-white";

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium z-[60]
      transition-all transform duration-300 animate-slide-up flex items-center gap-3
      ${toastStyle}`}
    >
      <span className="flex-1 text-center px-2">{message}</span>

      <button
        onClick={onClose}
        className="text-black/70 hover:text-black transition p-1 rounded-full hover:bg-black/10"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
