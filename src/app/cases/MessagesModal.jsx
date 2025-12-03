"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { apiRequest } from "../utils/api";

export default function MessagesModal({ onClose, pid_group }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!pid_group) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ pid_group });
        const data = await apiRequest(`/messages.php?${query.toString()}`);
        setMessages(data.messages || []);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [pid_group]);

  // Format initials
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // Format date "2024-08-19"
  const formatDate = (dateString) => {
    const d = new Date(dateString);
  
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // force local tz
    }).format(d);
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-6 rounded-xl bg-[#0c1017] shadow-xl border border-stroke">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Message History</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto px-1 space-y-6">

          {loading && <p className="text-mute text-sm">Loading messages...</p>}

          {!loading && messages.length === 0 && (
            <p className="text-mute text-sm">No messages found.</p>
          )}

          {/* Group by date */}
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const showDate =
              !prev ||
              prev.created_date.split(" ")[0] !== msg.created_date.split(" ")[0];

            return (
              <div key={idx} ref={messagesEndRef}>
                {/* Date Separator */}
                {showDate && (
                  <div className="flex justify-center my-2">
                    <div className="px-4 py-1 text-xs text-gray-300 bg-white/10 rounded-full border border-white/20">
                      {formatDate(msg.created_date)}
                    </div>
                  </div>
                )}

                <div
                  className={`flex gap-3 ${
                    msg.direction === "outbound" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar bubble */}
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold text-white">
                    {
                      msg.direction === "outbound" ? "CIC" : msg.sender_name
                    }
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`p-3 rounded-xl max-w-[75%] text-sm border 
                      ${
                        msg.direction === "outbound"
                          ? "bg-blue-600/20 border-blue-500/40 text-blue-100"
                          : "bg-white/10 border-white/20 text-gray-100"
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.mms_url && (
                      <div className="mt-3 space-y-2">
                        <img
                          src={msg.mms_url}
                          alt="attachment"
                          className="max-h-40 rounded-lg border border-white/10 object-cover cursor-pointer"
                          onClick={() => window.open(msg.mms_url, "_blank")}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-1 text-xs opacity-80">
                      <span className="capitalize"></span>
                      <span>
                        {new Date(msg.created_date + "Z").toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
