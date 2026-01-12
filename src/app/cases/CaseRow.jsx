"use client";

import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../utils/api";
import ExpandedCaseDetails from "./ExpandedCaseDetails";
import { Phone, Mail, MessageSquare } from "lucide-react";
import MessagesModal from "./MessagesModal";

export default function CaseRow({
  caseItem,
  expandedRows,
  setExpandedRows,
  setSelectedCase,
  setShowRequestRecordModal,
  setShowSendMessageModal,
  setShowSendTelemedLinkModal,
  setShowSendTeleneuroLinkModal,
  setShowSendIntakeLinkModal,
  setShowUploadDocumentModal,
  markCaseHasLOP,
  setShowDroppedCaseModal,
  setShowEditDemographicsModal,
  isAffiliate
}) {
  const [expandedData, setExpandedData] = useState({});
  const isExpanded = expandedRows[caseItem.pid];
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRow = async () => {
    setExpandedRows((prev) => {
      const isCurrentlyOpen = !!prev[caseItem.pid];
      if (isCurrentlyOpen) {
        // 🔹 Close if it's already open — no API call
        return {};
      } else {
        // 🔹 Open this row (collapse others)
        return { [caseItem.pid]: true };
      }
    });
  
    // Only fetch when opening
    if (!expandedRows[caseItem.pid]) {
      try {
        const details = await apiRequest(`/case_details.php?pid=${caseItem.pid}`);
        if (details.status) {
          setExpandedData((prev) => ({
            ...prev,
            [caseItem.pid]: details.data,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch case details:", err);
      }
    }
  };
  
  const fetchCaseDetails = async (pid) => {
    try {
      const details = await apiRequest(`/case_details.php?pid=${pid}`);
      if (details.status) {
        setExpandedData((prev) => ({
          ...prev,
          [pid]: details.data,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch case details:", err);
    }
  };
  
  const updateSectionLOP = (sectionPid) => {
    setExpandedData((prev) => {
      const updated = { ...prev };
      const entry = updated[caseItem.pid];
  
      if (!entry) return prev;
  
      updated[caseItem.pid] = {
        ...entry,
        sections: entry.sections.map((sec) =>
          sec.pid === sectionPid ? { ...sec, has_lop: "1" } : sec
        ),
      };
  
      return updated;
    });
  };

  return (
    <div
      className="mb-4 border border-stroke/30 rounded-xl md:border-0 md:rounded-none md:border-b md:border-stroke/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-2 md:gap-0 p-4 md:p-0"
        onClick={toggleRow}
        >
        {/* Expand */}
        <div className="flex items-center md:col-span-3">
          <button
            className={`badge w-10 cursor-default ${
              caseItem.has_lop !== "0" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            LOP
          </button>
          {caseItem.email && (
            <div className="ml-1 relative group">
              <button
                className="badge w-8 cursor-default flex items-center justify-center bg-blue-500"
              >
                <Mail className="w-4 h-4" />
              </button>
          
              {/* Tooltip */}
              <div
                className="
                  absolute 
                  left-1/2 
                  -translate-x-1/2 
                  mt-1
                  px-2 py-1 
                  text-xs 
                  bg-black text-white 
                  rounded 
                  shadow-lg 
                  whitespace-nowrap
                  opacity-0
                  group-hover:opacity-100
                  pointer-events-none
                  transition
                "
              >
                {caseItem.email}
              </div>
            </div>
          )}
          
          {caseItem.phone_home && (
            <div className="ml-1 relative group">
              <button
                className="badge w-8 cursor-default flex items-center justify-center bg-blue-500"
              >
                <Phone className="w-4 h-4" />
              </button>
          
              {/* Tooltip */}
              <div
                className="
                  absolute 
                  left-1/2 
                  -translate-x-1/2 
                  mt-1
                  px-2 py-1 
                  text-xs 
                  bg-black text-white 
                  rounded 
                  shadow-lg 
                  whitespace-nowrap
                  opacity-0
                  group-hover:opacity-100
                  pointer-events-none
                  transition
                "
              >
                {caseItem.phone_home}
              </div>
            </div>
          )}
          {caseItem.has_messages !== "0" && (
            <div className="ml-1 relative group">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMessagesModal(true)
                }}
                className="badge w-8 cursor-default flex items-center justify-center bg-blue-500"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          )}
          <button className="badge ml-2">
            {isExpanded ? "-" : "+"}
          </button>
          <span className="ml-2 flex gap-1">
            {caseItem.super_facilities?.split(",").map((facility, i) => {
              const trimmed = facility.trim();
              const [title, colorCode] = trimmed.split(";");
              const displayTitle = title ? title.trim() : "Unknown";
              const color = colorCode ? colorCode.trim() : "#999";
              return (
                <span
                  key={i}
                  className="dot"
                  title={displayTitle}
                  style={{ backgroundColor: color }}
                ></span>
              );
            })}
          </span>
        </div>

        <div className="md:col-span-2">
          <span className="md:hidden font-semibold">First: </span>
          {caseItem.fname}
        </div>
        <div className="md:col-span-2">
          <span className="md:hidden font-semibold">Last: </span>
          {caseItem.lname}
        </div>
        <div className="md:col-span-1">
          <span className="md:hidden font-semibold">DOB: </span>
          {caseItem.dob}
        </div>
        <div className="md:col-span-1">
          <span className="md:hidden font-semibold">DOI: </span>
          {caseItem.doi}
        </div>

        <div className="md:col-span-1">
          {caseItem.status && (
            <>
              <span className="md:hidden font-semibold">Status: </span>
              <span className="badge text-mint-300">{caseItem.status}</span>
            </>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col sm:flex-row">
          <div ref={menuRef} className="relative inline-block text-left w-full sm:w-auto">
            {/* Toggle Button */}
            <button
              className="btn btn-sm flex items-center justify-center gap-1 w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              View Actions ▾
            </button>
    
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-stroke/30 rounded-md shadow-lg z-20">
                <button
                  disabled={isAffiliate}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAffiliate) return;

                    setSelectedCase(caseItem);
                    setShowEditDemographicsModal(true);
                    setMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm transition
                    ${
                      isAffiliate
                        ? "opacity-50 cursor-not-allowed text-slate-400"
                        : "text-slate-100 hover:bg-slate-700 hover:text-mint-300"
                    }
                  `}
                >
                  Edit Demographics
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(caseItem);
                    setShowRequestRecordModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Request Records
                </button>
    
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(caseItem);
                    setShowSendMessageModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Back Office Msg
                </button>
    
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(caseItem);
                    setShowSendTelemedLinkModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Schedule Telemed
                </button>
    
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(caseItem);
                    setShowSendTeleneuroLinkModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Schedule Teleneuro
                </button>
    
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(caseItem);
                    setShowSendIntakeLinkModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Send Intake
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(caseItem);
                    setShowDroppedCaseModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Dropped Case
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase({
                      ...caseItem,
                      pid: caseItem.pid,
                      case_pid: caseItem.pid,
                      doc_type: 'reduction',
                      onSuccess: () => {
                        fetchCaseDetails(caseItem.pid);
                      }
                    });
                    setShowUploadDocumentModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 hover:text-mint-300 transition"
                >
                  Upload Reduction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <ExpandedCaseDetails
          data={expandedData[caseItem.pid]}
          caseItem={caseItem}
          setSelectedCase={setSelectedCase}
          setShowUploadDocumentModal={setShowUploadDocumentModal}
          updateSectionLOP={updateSectionLOP}
          markCaseHasLOP={markCaseHasLOP}
          refreshCaseDetails={() => fetchCaseDetails(caseItem.pid)}
          isAffiliate={isAffiliate}
        />
      )}
      
      {showMessagesModal && (
        <MessagesModal
          open={showMessagesModal}
          onClose={() => setShowMessagesModal(false)}
          pid_group={caseItem.pid_group || ''}
        />
      )}
    </div>
  );
}
