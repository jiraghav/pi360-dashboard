"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import RequestRecordsModal from "./RequestRecordsModal";
import SendMessageModal from "./SendMessageModal";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [showRequestRecordModal, setShowRequestRecordModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch cases
  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const data = await apiRequest(
          `/cases.php?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );
        if (data.status && data.patients) {
          setCases(data.patients);
          setTotal(data.total || data.patients.length);
        } else {
          setCases([]);
          setTotal(0);
        }
      } catch (err) {
        console.error("Failed to fetch cases:", err);
        setCases([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleRequestRecords = (caseItem) => {
    setSelectedCase(caseItem);
    setShowRequestRecordModal(true);
  };

  const handleSendMessage = (caseItem) => {
    setSelectedCase(caseItem);
    setShowSendMessageModal(true);
  };

  const toggleRow = (pid) => {
    setExpandedRows((prev) => ({ ...prev, [pid]: !prev[pid] }));
  };

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Cases</h3>
            <div className="flex gap-2">
              <button className="btn">Export</button>
              <button className="btn btn-primary">New Referral</button>
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 text-mute text-xs uppercase tracking-wide pb-3 border-b border-stroke">
            <div className="col-span-1">Expand</div>
            <div className="col-span-2">First</div>
            <div className="col-span-2">Last</div>
            <div className="col-span-2">DOB</div>
            <div className="col-span-2">DOI</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Cases rows */}
          {loading ? (
            <div className="py-4 text-center col-span-12 text-mute">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="py-4 text-center col-span-12 text-mute">No cases found</div>
          ) : (
            cases.map((c) => (
              <div key={c.pid} className="mb-4">
                {/* Main row */}
                <div className="grid grid-cols-12 items-center py-4 border-b border-stroke/50">
                  <div className="col-span-1 flex items-center">
                    <button
                      className="badge"
                      onClick={() => toggleRow(c.pid)}
                    >
                      {expandedRows[c.pid] ? "-" : "+"}
                    </button>
                    <span className="ml-2 flex gap-1">
                      {/* Example dots for services */}
                      <span className="dot bg-mint-500" title="Chiro"></span>
                      <span className="dot bg-sky-500" title="Imaging"></span>
                      <span className="dot bg-amber-500" title="Pain Mgmt"></span>
                    </span>
                  </div>
                  <div className="col-span-2">{c.fname}</div>
                  <div className="col-span-2">{c.lname}</div>
                  <div className="col-span-2">{c.dob}</div>
                  <div className="col-span-2">{c.doi}</div>
                  <div className="col-span-1">
                    <span className="badge text-mint-300">Active</span>
                  </div>
                  <div className="col-span-2 text-right flex justify-end gap-2">
                    <button onClick={() => handleRequestRecords(c)} className="btn">Request Records</button>
                    <button onClick={() => handleSendMessage(c)} className="btn">Back Office Msg</button>
                  </div>
                </div>

                {/* Expanded row */}
                {expandedRows[c.pid] && (
                  <div className="mt-4 p-4 rounded-xl border border-stroke bg-card">
                    <div className="text-sm text-mute mb-2">Week of Oct 7</div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      <li>MRI report pending</li>
                      <li>PT 2/12 completed</li>
                      <li>Pain Mgmt consult scheduled 10/22</li>
                    </ul>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                      <div className="card p-3">
                        <div className="text-mute text-xs">Chiropractic</div>
                        <div className="font-semibold">Completed</div>
                        <div className="text-xs text-mute mt-1">Last Visit 09/27/2023</div>
                      </div>
                      <div className="card p-3">
                        <div className="text-mute text-xs">Imaging (MRI/CT)</div>
                        <div className="font-semibold">Pending Report</div>
                        <div className="text-xs text-mute mt-1">Last Visit 10/07/2023</div>
                      </div>
                      <div className="card p-3">
                        <div className="text-mute text-xs">Orthopedic</div>
                        <div className="font-semibold">Next Appt 12/21/2023</div>
                      </div>
                      <div className="card p-3">
                        <div className="text-mute text-xs">Pain Management</div>
                        <div className="font-semibold">$1,200 total · $400 avg</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="btn"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages} ({total} cases)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="btn"
            >
              Next
            </button>
          </div>
        </section>

        {/* Modals */}
        {showRequestRecordModal && selectedCase && (
          <RequestRecordsModal
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
            onClose={() => setShowRequestRecordModal(false)}
            onConfirm={() => {
              alert(`Records requested for ${selectedCase.fname}`);
              setShowRequestRecordModal(false);
              setSelectedCase(null);
            }}
          />
        )}
        {showSendMessageModal && selectedCase && (
          <SendMessageModal
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
            onClose={() => setShowSendMessageModal(false)}
            onConfirm={() => {
              alert(`Message sent to ${selectedCase.fname}`);
              setShowSendMessageModal(false);
              setSelectedCase(null);
            }}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
