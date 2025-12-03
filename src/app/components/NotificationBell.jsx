"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Pusher from "pusher-js";
import { jwtDecode } from "jwt-decode";
import moment from "moment-timezone";

import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";

export default function NotificationBell({ onNotificationClick }) {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // -----------------------
  // FETCH NOTIFICATIONS
  // -----------------------
  const fetchNotifications = async () => {
    try {
      const res = await apiRequest("notifications.php", "GET");
      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Error loading notifications", err);
    }
  };

  function getUserIdFromToken() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded?.id || null;
    } catch {
      return null;
    }
  }

  // -----------------------
  // PUSHER SETUP
  // -----------------------
  useEffect(() => {
    fetchNotifications();

    const userId = getUserIdFromToken();
    if (!userId) return;

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
      fetchNotifications();
      handleInAppNotification(data);
    });

    return () => {
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  // -----------------------
  // IN-APP / BROWSER NOTIF
  // -----------------------
  const handleInAppNotification = (data) => {
    const title = data.title || "New Notification";

    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: data.message });
      return;
    }

    showToast("success", title);
  };

  // -----------------------
  // Outside click close
  // -----------------------
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => n.is_read == 0);
  const read = notifications.filter((n) => n.is_read == 1);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10"
      >
        <Bell className="w-5 h-5 text-gray-200" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-[#0D0F11] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-slide-down">
          <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm text-white">
            Notifications
          </div>

          <div className="max-h-96 overflow-y-auto">
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
                  onClick={() => onNotificationClick(n)}
                  className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer border-b border-white/5"
                >
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
                  onClick={() => onNotificationClick(n)}
                  className="px-4 py-3 text-sm hover:bg-white/5 cursor-pointer border-b border-white/5 opacity-50"
                >
                  <div className="text-white">{n.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{n.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {moment.tz(n.created_at, "America/Chicago").fromNow()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
