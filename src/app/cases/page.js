"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import RequestRecordsModal from "./RequestRecordsModal";
import SendMessageModal from "./SendMessageModal";
import Link from "next/link";

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

  const toggleRow = async (pid) => {
    setExpandedRows((prev) => {
      // If already open, close it
      if (prev[pid]) return {};
      // Otherwise open only this pid, close others
      return { [pid]: true };
    });
  
    // Fetch data only the first time it's expanded
    if (!expandedData[pid]) {
      try {
        const details = await apiRequest(`/case_details.php?pid=${pid}`);
        if (details.status) {
          console.log(details);
          setExpandedData((prev) => ({
            ...prev,
            [pid]: details.data, // whatever your API returns
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
        alert(`Records requested for ${selectedCase.fname} ${selectedCase.lname}`);
        setShowRequestRecordModal(false);
        setSelectedCase(null);
      } else {
        alert("Failed to request records. Please try again.");
      }
    } catch (err) {
      console.error("Error requesting records:", err);
      alert("Error requesting records. Check console for details.");
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
        alert(response.message);
        setShowSendMessageModal(false);
        setSelectedCase(null);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Error sending message. Check console for details.");
    };
  }

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Cases</h3>
            <div className="flex gap-2">
              <button className="btn">Export</button>
              <Link href="/referrals/new" className="btn btn-primary">New Referral</Link>
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
                    {c.super_facilities?.split(",").map((facility, i) => {
                      const trimmed = facility.trim();

                      // Split description and color by semicolon
                      const [title, colorCode] = trimmed.split(";");

                      const displayTitle = title ? title.trim() : "Unknown";
                      const color = colorCode ? colorCode.trim() : "#999"; // default gray if missing

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
                    {expandedData[c.pid] ? (
                      <>
                      {/*
                        <div className="text-sm text-mute mb-2">
                          {expandedData[c.pid].week_summary || "Recent Updates"}
                        </div>
                
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {expandedData[c.pid].notes?.length > 0 ? (
                            expandedData[c.pid].notes.map((note, i) => (
                              <li key={i}>{note}</li>
                            ))
                          ) : (
                            <li>No updates available</li>
                          )}
                        </ul>
                      */}
                        
                
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                          {expandedData[c.pid].sections?.map((section, i) => (
                            <div key={i} className="card p-3">
                              <div className="text-mute text-xs">{section.title}</div>
                              <div className="font-semibold">{section.status}</div>
                              {section.last_visit && (
                                <div className="text-xs text-mute mt-1">Last Visit: {section.last_visit}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-3 text-center text-mute text-sm">
                        Loading details...
                      </div>
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
