"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { routeMap } from "../config/routes";
import { apiRequest } from "../utils/api";
import NotificationModal from "./NotificationModal";
import moment from "moment-timezone";
import { useToast } from "../hooks/ToastContext";

export default function Navbar() {
  const pathname = usePathname();
  const page = routeMap[pathname] || { title: "PI360", sub: "" };
  
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const dropdownRef = useRef(null);

  const unreadCount = notifications.length;

  // -------------------------------
  // FETCH NOTIFICATIONS FROM API
  // -------------------------------
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("notifications.php", "GET");

      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Error loading notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  
  const onMarkDone = async (taskId) => {
    try {
      const res = await apiRequest("update_task_status.php", {
        method: "POST",
        body: {
          task_id: taskId,
          status: 2, // mark done
        },
      });

      showToast("success", "Task marked as done!");

      fetchNotifications(); // update notification bell

      return true;
    } catch (error) {
      console.error("Failed to update task:", error);
      showToast("error", "Failed to mark task as done.");
      return false;
    }
  };

  // -------------------------------
  return (
    <>
      <header className="hidden md:block sticky top-0 z-40 glass border-b border-stroke/70">
        <div className="px-6 py-4 flex items-center justify-between">

          {/* Page Title */}
          <div>
            <div className="text-xs uppercase tracking-wide text-mute">Section</div>
            <h1 className="text-xl font-bold">{page.title}</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">

            {/* LEFT TEXT */}
            <div className="text-sm text-gray-300 whitespace-nowrap">
              Text{" "}
              <a
                href="sms:2146666651"
                className="font-semibold underline text-white hover:text-primary transition"
              >
                214-666-6651
              </a>{" "}
              24/7 for instant help
            </div>

            {/* Notification */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition"
              >
                <Bell className="w-5 h-5 text-gray-200" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0D0F11] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-down">

                  <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm text-white">
                    Notifications
                  </div>

                  <div className="max-h-80 overflow-y-auto">

                    {loading ? (
                      <div className="px-4 py-4 text-sm text-gray-400">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-gray-400">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setSelectedNotification(n);
                            setModalOpen(true);
                          }}
                          className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer border-b border-white/5"
                        >
                          <div className="text-gray-100">{n.title}</div>
                          <div className="text-xs text-gray-500">
                            {moment(n.created_at).fromNow()}
                          </div>
                        </div>
                      ))
                    )}

                  </div>

                  <div className="p-3 text-center text-primary text-sm hover:bg-white/5 cursor-pointer">
                    View all
                  </div>

                </div>
              )}
            </div>

            <Link href="/referrals/new" className="btn btn-primary">
              New Referral
            </Link>

            <Link href="/tasks" className="btn">
              Create Task
            </Link>

          </div>
        </div>

        {/* MODAL */}

      </header>
      <NotificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        notification={selectedNotification}
        onMarkDone={onMarkDone}
      />
    </>
  );
}
