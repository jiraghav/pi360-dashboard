"use client";

import {
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import CaseRow from "./CaseRow";

const CasesTable = forwardRef(function CasesTable(
  {
    cases,
    loading,
    page,
    total,
    limit,
    setPage,
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
    isAffiliate,
    loadCases,
    orderBy,
    orderDir,
    setOrderBy,
    setOrderDir,
  },
  ref
) {
  const [expandedRows, setExpandedRows] = useState({});
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ⭐ Expose function to parent
  useImperativeHandle(ref, () => ({
    clearExpanded() {
      setExpandedRows({});
    },
  }));
  
  const toggleSort = (column) => {
    let nextDir = "asc";
  
    if (orderBy === column) {
      nextDir = orderDir === "asc" ? "desc" : "asc";
      setOrderDir(nextDir);
    } else {
      setOrderBy(column);
      setOrderDir("asc");
      nextDir = "asc";
    }
  
    setOrderBy(column);
    updateSortInUrl(column, nextDir);
  };
  
  const updateSortInUrl = (orderBy, orderDir) => {
    const params = new URLSearchParams(window.location.search);

    params.set("order_by", orderBy);
    params.set("order_dir", orderDir);

    window.history.replaceState({}, "", `?${params.toString()}`);
  };
  
  const SortIcon = ({ column }) =>
  orderBy === column ? (orderDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <>
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 text-mute text-xs uppercase tracking-wide pb-3 border-b border-stroke">
        <div className="col-span-3">Expand</div>
        <div className="col-span-1 cursor-pointer select-none" onClick={() => toggleSort("patient_data.fname")}>
          First <SortIcon column="patient_data.fname" />
        </div>
        <div className="col-span-1 cursor-pointer select-none" onClick={() => toggleSort("patient_data.lname")}>
          Last <SortIcon column="patient_data.lname" />
        </div>
        <div className="col-span-1 cursor-pointer select-none" onClick={() => toggleSort("patient_data.dob")}>
          DOB <SortIcon column="patient_data.dob" />
        </div>
        <div className="col-span-1 cursor-pointer select-none" onClick={() => toggleSort("patient_data.doi")}>
          DOI <SortIcon column="patient_data.doi" />
        </div>
        <div className="col-span-1 cursor-pointer select-none" onClick={() => toggleSort("patient_data.referral_date")}>
          Referral Date <SortIcon column="patient_data.referral_date" />
        </div>
        <div className="col-span-2">
          Status
        </div>
        <div className="col-span-2">
          Actions
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-center text-mute">Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="py-4 text-center text-mute">No cases found</div>
      ) : (
        cases.map((c) => (
          <CaseRow
            key={c.pid}
            caseItem={c}
            expandedRows={expandedRows}
            setExpandedRows={setExpandedRows}
            setSelectedCase={setSelectedCase}
            setShowRequestRecordModal={setShowRequestRecordModal}
            setShowDroppedCaseModal={setShowDroppedCaseModal}
            setShowSendMessageModal={setShowSendMessageModal}
            setShowSendTelemedLinkModal={setShowSendTelemedLinkModal}
            setShowSendTeleneuroLinkModal={setShowSendTeleneuroLinkModal}
            setShowSendIntakeLinkModal={setShowSendIntakeLinkModal}
            setShowUploadDocumentModal={setShowUploadDocumentModal}
            markCaseHasLOP={markCaseHasLOP}
            setShowEditDemographicsModal={setShowEditDemographicsModal}
            isAffiliate={isAffiliate}
            loadCases={loadCases}
          />
        ))
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="btn disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages} ({total} cases)
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="btn disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
});

export default CasesTable;
