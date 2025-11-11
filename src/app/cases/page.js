"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import RequestRecordsModal from "./RequestRecordsModal";
import SendMessageModal from "./SendMessageModal";
import Link from "next/link";
import { useToast } from "../hooks/ToastContext";

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
  const [expandedData, setExpandedData] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [initialized, setInitialized] = useState(false);
  const limit = 10;
  
  const { showToast } = useToast();

  // ✅ Initialize from URL once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get("status") || "";
    setStatusFilter(statusParam);
    setInitialized(true); // mark ready to fetch
  }, []);

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
    if (!initialized) return;
    async function fetchCases() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
        });
        if (statusFilter) query.append("status", statusFilter);

        const data = await apiRequest(`/cases.php?${query.toString()}`);
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
  }, [page, search, statusFilter, initialized])

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    if (newStatus) params.set("status", newStatus);
    else params.delete("status");
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  const handleRequestRecords = (caseItem) => {
    setSelectedCase(caseItem);
    setShowRequestRecordModal(true);
  };

  const handleSendMessage = (caseItem) => {
    setSelectedCase(caseItem);
    setShowSendMessageModal(true);
  };

  const toggleRow = async (pid) => {
    setExpandedRows((prev) => {
      if (prev[pid]) return {};
      return { [pid]: true };
    });

    if (!expandedData[pid]) {
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
    }
  };

  const confirmRequestRecord = async () => {
    if (!selectedCase) return;

    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("note", selectedCase.description || "");

      const response = await apiRequest("request_records.php", {
        method: "POST",
        body: formData,
      });

      if (response.status) {
        showToast("success", `Records requested for ${selectedCase.fname} ${selectedCase.lname}`);
        setShowRequestRecordModal(false);
        setSelectedCase(null);
      } else {
      }
    } catch (err) {
      console.error("Error requesting records:", err);
    }
  };

  const sendBackOfficeMessage = async () => {
    if (!selectedCase) return;

    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("message", selectedCase.message || "");

      const response = await apiRequest("send_back_office_msg.php", {
        method: "POST",
        body: formData,
      });

      if (response.status) {
        showToast("success", response.message);
        setShowSendMessageModal(false);
        setSelectedCase(null);
      } else {
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const statusLabels = {
    active: "Active Cases",
    pending_reports: "Pending Report Cases",
    completed: "Completed Cases",
    all: "All Cases",
  };

  const displayLabel = statusLabels[statusFilter] || "All Cases";

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold">{displayLabel}</h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {/* Buttons */}
              <div className="flex flex-row flex-wrap gap-2">
                <Link href="/referrals/new" className="btn btn-primary whitespace-nowrap">
                  New Referral
                </Link>
                <Link href="/patients/new" className="btn whitespace-nowrap">
                  New Patient
                </Link>
              </div>

              {/* ✅ Status Filter */}
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="border rounded px-3 py-2 bg-black text-white"
              >
                <option value="">All Cases</option>
                <option value="active">Active</option>
                <option value="pending_reports">Pending Reports</option>
                <option value="completed">Completed</option>
              </select>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-64 border rounded px-3 py-2 bg-black text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 text-mute text-xs uppercase tracking-wide pb-3 border-b border-stroke">
            <div className="col-span-1">Expand</div>
            <div className="col-span-2">First</div>
            <div className="col-span-2">Last</div>
            <div className="col-span-1">DOB</div>
            <div className="col-span-1">DOI</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Case rows */}
          {loading ? (
            <div className="py-4 text-center text-mute">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="py-4 text-center text-mute">No cases found</div>
          ) : (
            cases.map((c) => (
              <div
                key={c.pid}
                className="mb-4 border border-stroke/30 rounded-xl md:border-0 md:rounded-none md:border-b md:border-stroke/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-2 md:gap-0 p-4 md:p-0">
                  {/* Expand */}
                  <div className="flex items-center md:col-span-1">
                    {c.super_facilities && (
                      <button className="badge" onClick={() => toggleRow(c.pid)}>
                        {expandedRows[c.pid] ? "-" : "+"}
                      </button>
                    )}
                    <span className="ml-2 flex gap-1">
                      {c.super_facilities?.split(",").map((facility, i) => {
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
                    {c.fname}
                  </div>
                  <div className="md:col-span-2">
                    <span className="md:hidden font-semibold">Last: </span>
                    {c.lname}
                  </div>
                  <div className="md:col-span-1">
                    <span className="md:hidden font-semibold">DOB: </span>
                    {c.dob}
                  </div>
                  <div className="md:col-span-1">
                    <span className="md:hidden font-semibold">DOI: </span>
                    {c.doi}
                  </div>

                  <div className="md:col-span-2">
                    {c.status && (<><span className="md:hidden font-semibold">Status: </span><span className="badge text-mint-300">{c.status}</span></>)}
                  </div>

                  <div className="md:col-span-3 flex flex-col sm:flex-row md:justify-end gap-2">
                    <button onClick={() => handleRequestRecords(c)} className="btn w-full sm:w-auto">
                      Request Records
                    </button>
                    <button onClick={() => handleSendMessage(c)} className="btn w-full sm:w-auto">
                      Back Office Msg
                    </button>
                  </div>
                </div>

                {/* Expanded section */}
                {expandedRows[c.pid] && (
                  <div className="mt-2 md:mt-4 p-3 md:p-4 rounded-xl border border-stroke bg-card">
                    {expandedData[c.pid] ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {expandedData[c.pid].sections?.map((section, i) => (
                          <div key={i} className="card p-3">
                            <div className="text-mute text-xs">{section.title}</div>
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-3 text-center text-mute text-sm">Loading details...</div>
                    )}
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
              className={`btn ${
                page === 1 || loading
                  ? "opacity-50 cursor-not-allowed bg-gray-700 text-gray-400 hover:bg-gray-700"
                  : ""
              }`}
            >
              Previous
            </button>
            
            <span>
              Page {page} of {totalPages} ({total} cases)
            </span>
            
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className={`btn ${
                page === totalPages || loading
                  ? "opacity-50 cursor-not-allowed bg-gray-700 text-gray-400 hover:bg-gray-700"
                  : ""
              }`}
            >
              Next
            </button>
          </div>
        </section>
      </main>

      {/* Modals */}
      {showRequestRecordModal && selectedCase && (
        <RequestRecordsModal
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          onClose={() => setShowRequestRecordModal(false)}
          onConfirm={confirmRequestRecord}
        />
      )}
      {showSendMessageModal && selectedCase && (
        <SendMessageModal
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          onClose={() => setShowSendMessageModal(false)}
          onConfirm={sendBackOfficeMessage}
        />
      )}
    </ProtectedRoute>
  );
}
