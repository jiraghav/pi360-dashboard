"use client";

import { useState } from "react";
import TaskModal from "../tasks/TaskModal";
import DocumentNotificationModal from "../components/DocumentNotificationModal";
import { FileText } from "lucide-react";

export default function ExpandedCaseDetails({ data, setSelectedCase, setShowUploadLOPModal, updateSectionLOP, markCaseHasLOP }) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedCase, setSelectedCaseNewTask] = useState(null);
  
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocNotification, setSelectedDocNotification] = useState(null);

  return (
    <div className="mt-2 md:mt-4 p-3 md:p-4 rounded-xl border border-stroke bg-card">
      {data ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-slate-500 font-medium">Case Info</div>
        
            <button
              className="text-xs px-2 py-1 rounded btn cursor-pointer"
              onClick={() => {
                setSelectedCaseNewTask({
                  pid: data.detail.pid,
                  fname: data.detail.fname,
                  lname: data.detail.lname,
                  case_pid: data.detail.pid,
                });
                setShowTaskModal(true);
              }}            >
              Add Task
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {/* Case Info Card */}
          <div className="card p-3">
            <div className="text-xs text-slate-500 mb-1 font-medium">Case Info</div>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between">
                  <span className="text-slate-500">MVA:</span>
                  <span className="font-medium">
                    {data.detail.casetype || "—"}
                  </span>
                </li>
          
                <li className="flex justify-between">
                  <span className="text-slate-500">Limits:</span>
                  <span className="font-medium">
                    {data.detail.limits || "—"}
                  </span>
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
              <div key={i} className="card p-3">
                <div className="flex items-center justify-between text-mute text-xs">
                  {/* Title on left */}
                  <span>{section.title}</span>
                
                  {/* Button on right */}
                  {section.has_lop === '0' ? (
                    <button 
                      onClick={() => {
                        setSelectedCase({
                          ...data.detail,
                          pid: section.pid,
                          case_pid: data.detail.pid,
                          onSuccess: () => {
                            updateSectionLOP(section.pid);       // updates section
                            markCaseHasLOP(data.detail.pid);     // updates main case
                          }
                        });
                        setShowUploadLOPModal(true);
                      }}
                      className="text-xs px-2 py-1 rounded btn cursor-default bg-red-500 text-white"
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
                <div className="font-semibold">{section.status}</div>

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
                
                {section.document_ids && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {section.document_ids
                      .split(",")
                      .map((docId) => docId.trim())
                      .filter(Boolean)
                      .map((docId) => (
                        <a
                          key={docId}
                          onClick={() => {
                            setSelectedDocNotification({
                              document_id: docId,
                              patient_name: `${data.detail.fname} ${data.detail.lname}`,
                              case_id: data.detail.pid,
                              id: 0
                            });
                            setDocModalOpen(true);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 text-white text-sm hover:bg-gray-900"
                        >
                          <FileText className="w-3.5 h-3.5 text-white" />
                        </a>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            selectedCase={selectedCase}   // <-- send case here
            onCreated={(task) => {
            }}
          />
          <DocumentNotificationModal
            open={docModalOpen}
            onClose={() => setDocModalOpen(false)}
            notification={selectedDocNotification}
            fetchNotifications={() => {}}
          />
        </>
      ) : (
        <div className="py-3 text-center text-mute text-sm">Loading details...</div>
      )}
    </div>
  );
}
