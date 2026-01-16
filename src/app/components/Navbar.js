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

      default:
        console.warn("Unknown notification type:", n.notification_type);
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

  // -------------------------------
  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-stroke/70">
        <div className="px-6 py-4 flex items-center justify-between">
        
        <button
          className="md:hidden btn"
          onClick={() => {
            const sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.toggle("hidden");
          }}
        >
          ☰
        </button>

          {/* Title */}
          <div>
            <div className="text-xs font-semibold md:text-xl md:font-bold md:tracking-wide">
              Complete Injury Centers
            </div>
            <h1 className="text-xs text-mute">Powered by PI360</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">

            {/* Help Text */}
            <div className="hidden md:block text-sm text-gray-300 whitespace-nowrap">
              Text{" "}
              <a href="sms:2146666651" className="underline font-semibold text-white">
                214-666-6651
              </a>{" "}
              24/7 for instant help
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setNotificationPatient();
                  setOpen(!open);
                }}
                className="relative p-2 rounded-lg hover:bg-white/10"
              >
                <Bell className="w-5 h-5 text-gray-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {open && (
                <div className="
                  absolute
                  mt-3
                  w-80
                  bg-[#0D0F11]
                  border border-white/10
                  rounded-xl
                  shadow-2xl
                  overflow-hidden
                  animate-slide-down
                  left-1/2 -translate-x-1/2
                  md:left-auto md:translate-x-0 md:right-0
                ">
                  <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm text-white">
                    {notificationPatient?.name && (
                      <span className="text-gray-400 mr-1">Patient:</span>
                    )}
                    {notificationPatient?.name ? `${notificationPatient?.name} Notifications` : "All Notifications"}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                  
                    {loading && (
                      <div className="px-4 py-6 flex flex-col items-center justify-center text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent mb-2"></div>
                        Loading notifications…
                      </div>
                    )}

                    {!loading && (
                      <>
                        {/* Unread */}
                        <div className="px-4 py-2 text-xs font-semibold text-green-400 bg-white/5">
                          Unread ({unread.length})
                        </div>

                        {unread.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">No unread notifications</div>
                        ) : (
                          unread.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer border-b border-white/5"
                            >
                              {n.patient_name && (
                                <span
                                  className="text-xs float-right text-blue-400 underline cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();   // Prevent opening the notification modal
                                    onViewProfile(n);
                                  }}
                                >
                                  👤 {n.patient_name}
                                </span>
                              )}
                              <div className="text-white">{n.title}</div>
                              <div className="text-xs text-gray-400 mt-1">{n.message}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {moment.tz(n.created_at, "America/Chicago").fromNow()}
                              </div>
                            </div>
                          ))
                        )}

                        {/* Read */}
                        <div className="px-4 py-2 text-xs font-semibold text-blue-400 bg-white/5 mt-2">
                          Read ({read.length})
                        </div>

                        {read.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">No read notifications</div>
                        ) : (
                          read.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer border-b border-white/5 opacity-50"
                            >
                              {n.patient_name && (
                                <span
                                  className="text-xs float-right text-blue-400 underline cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();   // Prevent opening the notification modal
                                    onViewProfile(n);
                                  }}
                                >
                                  👤 {n.patient_name}
                                </span>
                              )}
                              <div className="text-white">{n.title}</div>
                              <div className="text-xs text-gray-400 mt-1">{n.message}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {moment.tz(n.created_at, "America/Chicago").fromNow()}
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}

                  </div>
                </div>
              )}
            </div>

            <Link href="/referrals/new" className="btn btn-primary text-xs px-3 py-3">New Referral</Link>
            <Link href="/tasks" className="btn hidden md:block">Create Task</Link>

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
