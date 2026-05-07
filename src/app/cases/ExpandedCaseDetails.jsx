"use client";

import { useState } from "react";
import TaskModal from "../tasks/TaskModal";
import DocumentNotificationModal from "../components/DocumentNotificationModal";
import ReviewNotesModal from "../dashboard/ReviewNotesModal";
import { FileText } from "lucide-react";
import CaseInfoModal from "./CaseInfoModal";
import { useRouter } from "next/navigation";
import { MapPin, AlertCircle, RefreshCw, ListTodo, PlusCircle, Sigma } from "lucide-react";
import UpdateBillingModal from "./UpdateBillingModal";
import { apiRequest } from "../utils/api";

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
    setSelectedCaseNewTask,
    setShowEditDemographicsModal
  }) {
  
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocNotification, setSelectedDocNotification] = useState(null);
  
  const [showReviewNotes, setShowReviewNotes] = useState(false);
  const [selectedPid, setSelectedPid] = useState(null);
  
  const [showCaseInfoModal, setShowCaseInfoModal] = useState(false);

  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleUpdate = (section) => {
    setSelectedSection(section);
    setShowUpdateModal(true);
  };

  return (
    <div className="mt-2 xl:mt-4 p-3 xl:p-4 rounded-xl border border-stroke bg-card">
      {data ? (
        <>
          <div className="flex items-center justify-end mb-1">            
            {
              caseItem.tasks_count > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const query = encodeURIComponent(
                      `${caseItem.fname} ${caseItem.lname}`
                    );
                    router.push(`/tasks?status=open&patient=${query}`);
                  }}
                  title="View Open Tasks"
                  className="text-xs px-2 py-1 rounded btn cursor-pointer flex items-center gap-1"
                >
                  <ListTodo size={14} />
                  View Tasks
                </button>
              ) : (
                <span
                  className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 flex items-center gap-1"
                  title="No pending tasks"
                >
                  <ListTodo size={14} />
                  No Pending Tasks
                </span>
              )
            }

            <button
              className="text-xs px-2 py-1 rounded btn cursor-pointer ml-2 flex items-center gap-1"
              onClick={() => {
                setSelectedCaseNewTask({
                  pid: data.detail.pid,
                  fname: data.detail.fname,
                  lname: data.detail.lname,
                  case_pid: data.detail.pid,
                });
                setShowTaskModal(true);
              }}
            >
              <PlusCircle size={14} />
              Add Task
            </button>
            
            <button
              className="text-xs px-2 py-1 rounded btn cursor-pointer ml-2 disabled:opacity-60 flex items-center gap-1"
              disabled={refreshing}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  setRefreshing(true);
                  await refreshCaseDetails();
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-2">
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
                {!isAffiliate && data.detail.has_case_team == "1" && (
                  <>
                    <li className="pt-3 mt-2 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
                      <span>Patient Case Team / Patient-specific updates go here</span>

                      <button
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setShowEditDemographicsModal(true);
                        }}
                        className="ml-2 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Update
                      </button>
                    </li>

                    {data.detail.lawyer_email && (
                      <li className="flex justify-between">
                        <span className="text-slate-500">Lawyer:</span>
                        <span className="font-medium break-all text-right">
                          {data.detail.lawyer_email.split(',').map((email, index) => (
                            <div key={index} className="break-all">
                              {email.trim()}
                            </div>
                          ))}
                        </span>
                      </li>
                    )}

                    {data.detail.paralegal_email && (
                      <li className="flex justify-between">
                        <span className="text-slate-500">Paralegal:</span>
                        <span className="font-medium break-all text-right">
                          {data.detail.paralegal_email.split(',').map((email, index) => (
                            <div key={index} className="break-all">
                              {email.trim()}
                            </div>
                          ))}
                        </span>
                      </li>
                    )}

                    {data.detail.case_manager && (
                      <li className="flex justify-between">
                        <span className="text-slate-500">Case Manager:</span>
                        <span className="font-medium break-all text-right">
                          {data.detail.case_manager.split(',').map((email, index) => (
                            <div key={index} className="break-all">
                              {email.trim()}
                            </div>
                          ))}
                        </span>
                      </li>
                    )}
                  </>
                )}
              </ul>
          </div>
          {
            data.sections.length > 0 && (
              <div className="card p-3 flex flex-col h-full min-h-[250px]">
          
                {/* Top Content (grows) */}
                <div className="flex-1 flex flex-col">
          
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-slate-500 font-medium">
                      CIC Medical Summary
                    </div>
                  </div>
          
                  <ul className="text-sm space-y-2 flex-1">
                    {data.sections?.map((section, i) => {
                      return (
                        <li key={i} className="flex justify-between items-start">
                          <span className="font-medium">
                            <div className="flex flex-col gap-0.5">
                              {/* Title row */}
                              <div className="flex items-center gap-2">
                                {section.color && (
                                  <span
                                    className="dot"
                                    style={{ backgroundColor: section.color }}
                                  />
                                )}
                                <span>{section.title}</span>
          
                                {section.fac_street && (
                                  <div className="relative group">
                                    <MapPin
                                      size={14}
                                      className="text-slate-400 hover:text-mint-400 cursor-pointer"
                                    />
          
                                    <div
                                      className="absolute z-50 mt-1 left-0 w-64 rounded-md
                                                 bg-slate-800 text-slate-100 text-xs p-2 shadow-lg
                                                 opacity-0 invisible
                                                 group-hover:opacity-100 group-hover:visible
                                                 transition-opacity duration-150"
                                    >
                                      <div className="break-words">
                                        {[
                                          section.fac_street,
                                          section.fac_city,
                                          section.fac_state,
                                          section.fac_postal_code,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </div>
                                    </div>
                                  </div>
                                )}
          
                                {section.fac_outside_of_cic == 1 && (
                                  <div className="relative group">
                                    <AlertCircle
                                      size={14}
                                      className="text-red-500 cursor-pointer"
                                    />
                                    <div
                                      className="absolute z-50 mt-1 left-0 rounded-md
                                                 bg-slate-800 text-slate-100 text-xs px-2 py-1 shadow-lg
                                                 whitespace-nowrap
                                                 opacity-0 invisible
                                                 group-hover:opacity-100 group-hover:visible"
                                    >
                                      Not in CIC Network
                                    </div>
                                  </div>
                                )}
                              </div>
          
                              <div className="ml-5 text-xs text-slate-400">
                                {section.fac_name}
                              </div>
                            </div>
                          </span>
          
                          <span className="whitespace-nowrap font-medium">
                            ${section.balance || '0.00'}
                          </span>
                        </li>
                      );
                    })}
                    <li className="flex justify-between items-center pt-2 mt-2 border-t border-slate-700 font-semibold">
                      <span className="flex items-center gap-2">
                        <span
                          className="dot"
                          style={{ backgroundColor: '#94A3B8' }}
                        />
                        <span>Total</span>
                      </span>
          
                      <span className="whitespace-nowrap">
                        $
                        {data.sections
                          ?.reduce((sum, s) => sum + Number(s.balance || 0), 0)
                          .toFixed(2)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )
          }
            {data.sections?.map((section, i) => {
              const shouldHighlight =
                isAffiliate && section.affiliate_has_access &&
                (
                  !section.custom_data_bill_or_encounter_updated_at ||
                  ((new Date() - new Date(section.custom_data_bill_or_encounter_updated_at)) 
                    / (1000 * 60 * 60 * 24)) > 7
                );

              return (
              <div key={i}
              className={`card p-3 ${shouldHighlight ? "pulse-strong attention-ring" : ""}
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
                    {section.title} (<span className="text-xs">{section.fac_name}</span>)
                  </span>
                
                  {/* Button on right */}
                  {caseItem.has_lop === "0" ? (
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
                <div className="flex flex-col gap-1">
                  
                  {/* Top Row */}
                  <div className="font-semibold">{section.status}</div>
                
                  {/* Bottom Row (Right aligned) */}
                  <div className="flex items-center justify-end gap-2">
                    
                    {section.has_notes !== '0' && (
                      <button
                        onClick={() => {
                          if (isAffiliate && !section.affiliate_has_access) {
                            return;
                          }
                          setSelectedPid(section.pid);
                          setShowReviewNotes(true);
                        }}
                        className={`text-xs px-2 py-1 rounded bg-blue-500 text-white
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
                
                    {
                      isAffiliate && (
                        <div className="relative inline-flex items-center">
                        
                          <button
                            onClick={() => {
                                if (isAffiliate && !section.affiliate_has_access) {
                                  return;
                                }
                              handleUpdate(section)}
                            }
                            className={`
                              flex items-center gap-1.5
                              px-3 py-1 text-xs font-semibold rounded-full
                              text-white
                              transition-all duration-200
                              active:scale-95
                              ${
                                shouldHighlight
                                  ? "bg-red-600 shadow-lg shadow-red-500/30 ring-2 ring-red-400/40"
                                  : "bg-gray-600"
                              }
                              ${
                                isAffiliate && !section.affiliate_has_access
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                              hover:bg-red-700
                            `}
                          >
                            <AlertCircle size={14} className={shouldHighlight ? "animate-pulse" : ""} />
                            Update Bills & Visits
                          </button>
                        
                          {/* Tooltip */}
                          {shouldHighlight && (
                            <div
                              className="
                                pointer-events-none
                                absolute left-1/2 -translate-x-1/2 top-full mt-2
                                px-2.5 py-1.5 rounded-md
                                bg-slate-900 text-white text-xs
                                shadow-xl border border-slate-700
                                opacity-0 scale-95
                                transition-all duration-150
                                group-hover:opacity-100 group-hover:scale-100
                              "
                            >
                              {!section.custom_data_bill_or_encounter_updated_at
                                ? "No billing or visit data available"
                                : "Billing or visit data not updated in last 7 days"}
                            </div>
                          )}
                        
                        </div>
                      )
                    }
                  </div>
                </div>

                {(section.last_visit || section.visits || section.balance) && (
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-1 text-xs text-gray-400">
                    {section.visits && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Total Visits:</span>
                        <span>{section.visits}</span>
                      </div>
                    )}
                    {section.last_visit && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Last Visit:</span>
                        <span className="truncate">{section.last_visit}</span>
                      </div>
                    )}
                    {section.missed_visit && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Missed Visit:</span>
                        <span className="truncate">{section.missed_visit}</span>
                      </div>
                    )}
                    {section.next_visit && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Next Visit:</span>
                        <span className="truncate">{section.next_visit}</span>
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
                
                  {section.document_data ? (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {section.document_data
                        ?.split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((item) => {
                          const [docId, url] = item.split("|");
                          const fileName = decodeURIComponent(url.split("/").pop());
                    
                          return (
                            <div key={docId} className="relative group">
                              <button
                                onClick={() => {
                                  if (isAffiliate && !section.affiliate_has_access) return;
                    
                                  setSelectedDocNotification({
                                    document_id: docId,
                                    document_url: url,
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
                              </button>
                    
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                              hidden group-hover:block 
                                              bg-black text-white text-xs px-2 py-1 rounded shadow-lg 
                                              whitespace-nowrap z-50">
                                {fileName}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No documents</p>
                  )}
                </div>
              </div>
            )}
          )}
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
      {showUpdateModal && selectedSection && (
        <UpdateBillingModal
          section={selectedSection}
          onClose={() => setShowUpdateModal(false)}
          onConfirm={async (data) => {
            await apiRequest("update-billing.php", {
              method: "POST",
              body: data,
            });

            setShowUpdateModal(false);
            refreshCaseDetails(); // already using this
          }}
        />
      )}
    </div>
  );
}
