"use client";

import { useState } from "react";
import TaskModal from "../tasks/TaskModal";
import DocumentNotificationModal from "../components/DocumentNotificationModal";
import ReviewNotesModal from "../dashboard/ReviewNotesModal";
import { FileText } from "lucide-react";
import CaseInfoModal from "./CaseInfoModal";
import { useRouter } from "next/navigation";

export default function ExpandedCaseDetails({
    data,
    caseItem,
    setSelectedCase,
    setShowUploadDocumentModal,
    updateSectionLOP,
    markCaseHasLOP,
    refreshCaseDetails,
    isAffiliate,
    showTaskModal,
    setShowTaskModal,
    selectedCase,
    setSelectedCaseNewTask
  }) {
  
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocNotification, setSelectedDocNotification] = useState(null);
  
  const [showReviewNotes, setShowReviewNotes] = useState(false);
  const [selectedPid, setSelectedPid] = useState(null);
  
  const [showCaseInfoModal, setShowCaseInfoModal] = useState(false);

  const router = useRouter();

  return (
    <div className="mt-2 md:mt-4 p-3 md:p-4 rounded-xl border border-stroke bg-card">
      {data ? (
        <>
          <div className="flex items-center justify-end mb-1">            
            {
              caseItem.tasks_count > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const query = encodeURIComponent(
                      `${caseItem.fname} ${caseItem.lname}`
                    );
                    router.push(`/tasks?status=open&patient=${query}`);
                  }}
                  title="View Open Tasks"
                  className="text-xs px-2 py-1 rounded btn cursor-pointer"
                >
                  View Tasks
                </button>
              )
            }

            <button
              className="text-xs px-2 py-1 rounded btn cursor-pointer ml-2"
              onClick={() => {
                setSelectedCaseNewTask({
                  pid: data.detail.pid,
                  fname: data.detail.fname,
                  lname: data.detail.lname,
                  case_pid: data.detail.pid,
                });
                setShowTaskModal(true);
              }}            >
              + Add Task
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {/* Case Info Card */}
          <div className="card p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-slate-500 font-medium">Case Info</div>

                <button
                  onClick={() => setShowCaseInfoModal(true)}
                  className="text-xs px-2 py-1 rounded btn bg-blue-500 text-white cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <ul className="text-sm space-y-1">
                <li className="flex justify-between">
                  <span className="text-slate-500">MVA:</span>
                  <span className="font-medium">{data.detail.casetype || "—"}</span>
                </li>
            
                <li className="flex justify-between">
                  <span className="text-slate-500">Limits:</span>
                  <span className="font-medium">{data.detail.limits || "—"}</span>
                </li>
            
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Liability Cleared:</span>
                  <span
                    className={`font-semibold ${
                      data.detail.liability_cleared == null
                        ? "text-slate-400"
                        : Number(data.detail.liability_cleared)
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {data.detail.liability_cleared == null
                      ? "—"
                      : Number(data.detail.liability_cleared)
                      ? "Yes"
                      : "No"}
                  </span>
                </li>
              </ul>
            </div>
            {data.sections?.map((section, i) => (
              <div key={i}
              className={`card p-3
                ${
                  isAffiliate && !section.affiliate_has_access
                    ? "opacity-50 cursor-not-allowed select-none"
                    : ""
                }
              `}
              >
                <div className="flex items-center justify-between text-mute text-xs">
                  {/* Title on left */}
                  
                  <span>
                  {
                    section.color && (
                      <span
                        key={i}
                        className="dot"
                        style={{ backgroundColor: section.color }}
                      ></span>
                    )
                  }
                  {section.title}</span>
                
                  {/* Button on right */}
                  {section.has_lop === '0' ? (
                    <button 
                      onClick={() => {
                        if (isAffiliate && !section.affiliate_has_access) {
                          return;
                        }
                        setSelectedCase({
                          ...data.detail,
                          pid: section.pid,
                          case_pid: data.detail.pid,
                          doc_type: 'lop',
                          onSuccess: () => {
                            updateSectionLOP(section.pid);
                            markCaseHasLOP(data.detail.pid);
                            refreshCaseDetails();
                          }
                        });
                        setShowUploadDocumentModal(true);
                      }}
                      className={`text-xs px-2 py-1 rounded btn bg-red-500 text-white
                        ${
                          isAffiliate && !section.affiliate_has_access
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-default"
                        }
                      `}
                    >
                      Upload LOP
                    </button>
                  ) : (
                    <button
                      className="text-xs px-2 py-1 rounded btn cursor-default bg-green-500 text-white"
                    >
                      LOP Uploaded
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div className="font-semibold">{section.status}</div>
                
                  {section.has_notes !== '0' && (
                    <button
                      onClick={() => {
                        if (isAffiliate && !section.affiliate_has_access) {
                          return;
                        }
                        setSelectedPid(section.pid);
                        setShowReviewNotes(true);
                      }}
                      className={`text-xs px-2 py-1 mt-1 rounded btn bg-blue-500 text-white
                        ${
                          isAffiliate && !section.affiliate_has_access
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                    >
                      Review Notes
                    </button>
                  )}
                </div>

                {(section.last_visit || section.visits || section.balance) && (
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-1 text-xs text-gray-400">
                    {section.visits && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Visits:</span>
                        <span>{section.visits}</span>
                      </div>
                    )}
                    {section.last_visit && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Last Visit:</span>
                        <span className="truncate">{section.last_visit}</span>
                      </div>
                    )}
                    {section.balance && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Bill:</span>
                        <span>${section.balance}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-500 font-medium">Documents:</div>
                
                    {/* Add Document Button */}
                    <button
                      onClick={() => {
                        if (isAffiliate && !section.affiliate_has_access) {
                          return;
                        }
                        setSelectedCase({
                          ...data.detail,
                          pid: section.pid,
                          case_pid: data.detail.pid,
                          doc_type: '',
                          onSuccess: () => {
                            refreshCaseDetails();
                          }
                        });
                        setShowUploadDocumentModal(true);
                      }}
                      className={`text-xs px-2 py-1 rounded btn
                        ${
                          isAffiliate && !section.affiliate_has_access
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      `}
                    >
                      + Add Document
                    </button>
                  </div>
                
                  {section.document_ids ? (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {section.document_ids
                        .split(",")
                        .map((docId) => docId.trim())
                        .filter(Boolean)
                        .map((docId) => (
                          <a
                            key={docId}
                            onClick={() => {
                              if (isAffiliate && !section.affiliate_has_access) {
                                return;
                              }
                              setSelectedDocNotification({
                                document_id: docId,
                                patient_name: `${data.detail.fname} ${data.detail.lname}`,
                                case_id: data.detail.pid,
                                id: 0,
                              });
                              setDocModalOpen(true);
                            }}
                            className={`w-6 h-6 flex items-center justify-center rounded bg-gray-700 text-white text-sm
                              ${
                                isAffiliate && !section.affiliate_has_access
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-gray-900"
                              }
                            `}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No documents</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DocumentNotificationModal
            open={docModalOpen}
            onClose={() => setDocModalOpen(false)}
            notification={selectedDocNotification}
            fetchNotifications={() => {}}
          />
          
          <ReviewNotesModal
            isOpen={showReviewNotes}
            onClose={() => setShowReviewNotes(false)}
            pid={selectedPid}
          />
          
          <CaseInfoModal
            isOpen={showCaseInfoModal}
            onClose={() => setShowCaseInfoModal(false)}
            data={data.detail}
            caseItem={caseItem}
            onUpdated={() => {
              refreshCaseDetails();
            }}
          />
        </>
      ) : (
        <div className="py-3 text-center text-mute text-sm">Loading details...</div>
      )}
    </div>
  );
}
