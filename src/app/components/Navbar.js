"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";

import { routeMap } from "../config/routes";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

import TaskNotificationModal from "./TaskNotificationModal";
import NoteNotificationModal from "./NoteNotificationModal";
import DocumentNotificationModal from "./DocumentNotificationModal";
import { useRouter } from "next/navigation";

import { useNotificationUI } from "../context/NotificationContext";
import useFetchOptions from "../hooks/useFetchOptions";

export default function Navbar() {
  const pathname = usePathname();
  const page = routeMap[pathname] || { title: "PI360", sub: "" };

  const { showToast } = useToast();

  const { open, setOpen, notificationPatient, setNotificationPatient } = useNotificationUI();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const dropdownRef = useRef(null);
  const router = useRouter();
  
  const { isAffiliate, isAffiliateLoading } = useFetchOptions({ fetchRoles: true });
  
  useEffect(() => {
    if (notificationPatient) {
      setOpen(true);
    }
  }, [notificationPatient]);

  // -------------------------------
  // FETCH NOTIFICATIONS
  // -------------------------------
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = notificationPatient?.pid_group
        ? `notifications.php?pid=${encodeURIComponent(notificationPatient?.pid_group)}`
        : "notifications.php";
      const res = await apiRequest(url, "GET");

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
    if (open) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    fetchNotifications();
  }, [open]);
  
  function getUserIdFromToken() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const decoded = jwtDecode(token);
      return decoded?.id || null;
    } catch (error) {
      console.error("Invalid JWT token", error);
      return null;
    }
  }

  useEffect(() => {
    fetchNotifications();
  
    const userId = getUserIdFromToken();
    if (!userId) return;
  
    // Enable browser permissions once
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: process.env.NEXT_PUBLIC_API_BASE_URL + "pusher_auth.php",
      auth: {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    });

    const channel = pusher.subscribe(`private-lawyer-${userId}`);
  
    channel.bind("new-notification", (data) => {
      // Refresh notification list
      fetchNotifications();
  
      // Show popup based on browser active/inactive state
      handleInAppNotification(data);
    });
  
    return () => {
      pusher.unsubscribe(`private-lawyer-${userId}`);
      pusher.disconnect();
    };
  }, []);
  
  function handleInAppNotification(data) {
    const title = data.title || "New Notification";
    const message = data.message || "";

    // If tab is not active → use Browser Notification
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      const notif = new Notification(title, {
        body: message,
        icon: "/notification-icon.png" // optional
      });

      notif.onclick = () => {
        window.focus();
      };
      return;
    }

    // Otherwise → in-app toast
    showToast("success", `${title}`);
  }

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

  // MARK TASK DONE
  const onMarkDone = async (taskId) => {
    try {
      await apiRequest("update_task_status.php", {
        method: "POST",
        body: { task_id: taskId, status: 2 },
      });

      showToast("success", "Task marked as done!");
      fetchNotifications();

      return true;
    } catch (error) {
      console.error("Failed to update task:", error);
      showToast("error", "Failed to mark task as done.");
      return false;
    }
  };
  
  function handleNotificationClick(n) {
    setSelectedNotification(n);

    switch (n.notification_type) {

      case "task":
        setTaskModalOpen(true);
        break;

      case "note":
        setNoteModalOpen(true);
        break;

      case "document":
        setDocumentModalOpen(true);
        break;

      case "text":
        markAsRead(n.id);
        const query = encodeURIComponent(n.patient_name);
        router.push(`/cases?search=${query}&tab=texts`);
        break;

      default:
        markAsRead(n.id);
        break;
    }
  }
  
  const onViewProfile = (p) => {
    if (!p?.patient_name) return;
    
    setOpen(false);

    const query = encodeURIComponent(p.patient_name);
    router.push(`/cases?search=${query}`);
  };

  // SPLIT READ/UNREAD
  const unread = notifications.filter((n) => n.is_read == 0);
  const read = notifications.filter((n) => n.is_read == 1);
  const unreadCount = unread.length;
  
  const markAsRead = async (id) => {
    try {
      await apiRequest("mark_notification_read.php", {
        method: "POST",
        body: { id },
      });

      // Optimistic UI update (instant)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: 1 } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // -------------------------------
  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-stroke/70">
        <div className="px-3 md:px-6 py-3 md:py-4">
      
          {/* GRID HEADER */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
      
            {/* LEFT SECTION */}
            <div className="flex items-center gap-2 min-w-0">
      
              <button
                className="md:hidden btn px-3 py-2"
                onClick={() => {
                  const sidebar = document.getElementById("sidebar");
                  if (sidebar) sidebar.classList.toggle("hidden");
                }}
              >
                ☰
              </button>
      
              <div className="flex flex-col min-w-0">
                <div className="text-sm sm:text-base md:text-xl font-semibold md:font-bold text-white truncate">
                  Complete Injury Centers
                </div>
      
                <div className="
                  flex flex-col sm:flex-row
                  sm:items-center
                  text-[10px] md:text-xs
                  text-gray-400
                  mt-0.5
                ">
                  <span>Powered by PI360</span>
      
                  {!isAffiliateLoading && (
                    <>
                      <span className="hidden sm:inline mx-2 text-gray-500">•</span>
                      <span className="mt-0.5 sm:mt-0">
                        {isAffiliate ? "Affiliate Dashboard" : "Lawyer Dashboard"}
                      </span>
                    </>
                  )}
                </div>
              </div>
      
            </div>
      
            {/* CENTER SPACE */}
            <div></div>
      
            {/* RIGHT SECTION */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
      
              {/* Help Text — only large screens */}
              <div className="hidden lg:block text-[11px] md:text-sm text-gray-300 whitespace-nowrap">
                Text{" "}
                <a
                  href="sms:2146666651"
                  className="underline font-semibold text-white"
                >
                  214-666-6651
                </a>{" "}
                24/7 for instant help
              </div>
      
              {/* Notification */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setNotificationPatient();
                    setOpen(!open);
                  }}
                  className="relative p-2.5 rounded-lg hover:bg-white/10"
                >
                  <Bell className="w-5 h-5 text-gray-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
      
                {open && (
                  <div className="
                    absolute
                    right-0
                    mt-2
                    w-[92vw] sm:w-[280px]
                    max-w-[320px]
                    bg-[#0D0F11]
                    border border-white/10
                    rounded-xl
                    shadow-2xl
                    overflow-hidden
                  ">
                    {/* SAME dropdown content */}
                  </div>
                )}
              </div>
      
              {/* New Referral */}
              <Link
                href="/referrals/new"
                className="btn btn-primary text-xs px-3 py-2.5"
              >
                New Referral
              </Link>
      
              {/* Create Task */}
              <Link
                href="/tasks"
                className="btn hidden md:inline-flex px-3 py-2.5"
              >
                Create Task
              </Link>
      
            </div>
      
          </div>
        </div>
      </header>

      <TaskNotificationModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        notification={selectedNotification}
        fetchNotifications={fetchNotifications}
        onMarkDone={onMarkDone}
      />

      <NoteNotificationModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        notification={selectedNotification}
        fetchNotifications={fetchNotifications}
      />

      <DocumentNotificationModal
        open={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        notification={selectedNotification}
        fetchNotifications={fetchNotifications}
      />
    </>
  );
}
