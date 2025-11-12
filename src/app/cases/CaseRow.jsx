"use client";

import { useState } from "react";
import { apiRequest } from "../utils/api";
import ExpandedCaseDetails from "./ExpandedCaseDetails";

export default function CaseRow({
  caseItem,
  expandedRows,
  setExpandedRows,
  setSelectedCase,
  setShowRequestRecordModal,
  setShowSendMessageModal,
}) {
  const [expandedData, setExpandedData] = useState({});
  const isExpanded = expandedRows[caseItem.pid];

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

  return (
    <div
      className="mb-4 border border-stroke/30 rounded-xl md:border-0 md:rounded-none md:border-b md:border-stroke/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-2 md:gap-0 p-4 md:p-0">
        {/* Expand */}
        <div className="flex items-center md:col-span-1">
          <button className="badge" onClick={toggleRow}>
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

        <div className="md:col-span-2">
          {caseItem.status && (
            <>
              <span className="md:hidden font-semibold">Status: </span>
              <span className="badge text-mint-300">{caseItem.status}</span>
            </>
          )}
        </div>

        <div className="md:col-span-3 flex flex-col sm:flex-row md:justify-end gap-2">
          <button
            onClick={() => {
              setSelectedCase(caseItem);
              setShowRequestRecordModal(true);
            }}
            className="btn w-full sm:w-auto"
          >
            Request Records
          </button>
          <button
            onClick={() => {
              setSelectedCase(caseItem);
              setShowSendMessageModal(true);
            }}
            className="btn w-full sm:w-auto"
          >
            Back Office Msg
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <ExpandedCaseDetails data={expandedData[caseItem.pid]} />
      )}
    </div>
  );
}
