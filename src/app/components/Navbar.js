"use client";

import Link from "next/link";
import { useState } from "react";
import { routeMap } from "../config/routes";

import TaskNotificationModal from "./TaskNotificationModal";
import NoteNotificationModal from "./NoteNotificationModal";
import DocumentNotificationModal from "./DocumentNotificationModal";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);

  function handleNotificationClick(n) {
    setSelectedNotification(n);

    if (n.notification_type === "task") setTaskModalOpen(true);
    else if (n.notification_type === "note") setNoteModalOpen(true);
    else if (n.notification_type === "document") setDocumentModalOpen(true);
  }

  return (
    <>
      <header className="hidden md:block sticky top-0 z-40 glass border-b border-stroke/70">
        <div className="px-6 py-4 flex items-center justify-between">

          <div>
            <div className="text-xl font-bold tracking-wide">
              Complete Injury Centers
            </div>
            <div className="text-xs text-mute">Powered by PI360</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-300 whitespace-nowrap">
              Text{" "}
              <a href="sms:2146666651" className="underline font-semibold text-white">
                214-666-6651
              </a>{" "}
              24/7 for instant help
            </div>

            <NotificationBell onNotificationClick={handleNotificationClick} />

            <Link href="/referrals/new" className="btn btn-primary">New Referral</Link>
            <Link href="/tasks" className="btn">Create Task</Link>
          </div>
        </div>
      </header>

      {/* Modals */}
      <TaskNotificationModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        notification={selectedNotification}
      />

      <NoteNotificationModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        notification={selectedNotification}
      />

      <DocumentNotificationModal
        open={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        notification={selectedNotification}
      />
    </>
  );
}
