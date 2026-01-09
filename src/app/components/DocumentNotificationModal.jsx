"use client";

import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { apiRequest } from "../utils/api";

export default function DocumentNotificationModal({
  open,
  onClose,
  notification,
  fetchNotifications
}) {
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, []);

  useEffect(() => {
    if (!open || !notification?.document_id) return;

    const fetchDocument = async () => {
      setLoadingDoc(true);

      try {
        const data = await apiRequest(
          `get-document-by-id.php?document_id=${notification.document_id}&notification_id=${notification.id}`
        );

        setDocumentData(data.document || null);
        fetchNotifications(); // mark notification read
      } catch (error) {
        console.error("Failed to load document:", error);
      } finally {
        setLoadingDoc(false);
      }
    };

    fetchDocument();
  }, [open, notification?.document_id]);

  if (!open) return null;

  const isPdf = documentData?.url?.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="card max-w-3xl w-full p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Document</h4>
          <button type="button" className="badge" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Patient Info */}
        {notification.patient_name && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Patient</div>

            <div className="font-semibold text-white text-base">
              {notification.patient_name}
            </div>

            {notification.case_id && (
              <div className="text-xs text-gray-500">
                Case ID: {notification.case_id}
              </div>
            )}
          </div>
        )}

        {/* Document Content */}
        <div className="mb-4">

          {loadingDoc ? (
            <div className="text-gray-400 text-sm">Loading document...</div>
          ) : !documentData ? (
            <div className="text-gray-500 text-sm">No document found.</div>
          ) : (
            <>
              <div className="bg-white/5 p-3 rounded border border-white/10 text-white max-h-[50vh] overflow-auto">

                {isPdf ? (
                  <iframe
                    src={documentData.url}
                    className="w-full h-[65vh] rounded"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={documentData.url}
                    alt="Document Preview"
                    className="max-w-full max-h-[65vh] rounded mx-auto"
                  />
                )}

              </div>
            </>
          )}
        </div>

        {/* Uploaded Time */}
        {documentData?.uploaded_at && (
          <div className="text-xs text-gray-500 border-t border-stroke pt-3">
            Uploaded:{" "}
            {moment(documentData.uploaded_at).format("MMM DD, YYYY • hh:mm A")}
          </div>
        )}
      </div>
    </div>
  );
}
