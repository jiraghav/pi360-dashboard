"use client";

import { useState } from "react";
import CaseRow from "./CaseRow";

export default function CasesTable({
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
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 text-mute text-xs uppercase tracking-wide pb-3 border-b border-stroke">
        <div className="col-span-1">Expand</div>
        <div className="col-span-2">First</div>
        <div className="col-span-2">Last</div>
        <div className="col-span-2">DOB</div>
        <div className="col-span-1">DOI</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Actions</div>
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
            setShowSendMessageModal={setShowSendMessageModal}
            setShowSendTelemedLinkModal={setShowSendTelemedLinkModal}
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
}
