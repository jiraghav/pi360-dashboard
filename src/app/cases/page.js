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
  const [selectedCase, setSelectedCase] = useState(null); // for modal
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
          const mappedCases = data.patients.map((p) => ({
            pid: p.pid,
            referral_date: p.referral_date,
            fname: p.fname,
            mname: p.mname,
            lname: p.lname,
            dob: p.dob,
            doi: p.doi,
          }));
          setCases(mappedCases);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  // Open modal
  const handleRequestRecords = (caseItem) => {
    setSelectedCase(caseItem);
    setShowRequestRecordModal(true);
  };

  const handleSendMessage = (caseItem) => {
    setSelectedCase(caseItem);
    setShowSendMessageModal(true);
  };

  // Confirm request
  const confirmRequestRecord = async () => {
    if (!selectedCase) return;

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("note", selectedCase.description || "");

      // API call using FormData
      const response = await apiRequest("request_records.php", {
        method: "POST",
        body: formData, // send as form data
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
      // Prepare form data
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("message", selectedCase.message || ""); // use message instead of note

      // API call to send message
      const response = await apiRequest("send_back_office_msg.php", {
        method: "POST",
        body: formData, // send as form data
      });

      if (response.status) {
        alert(response.message);
        setShowSendMessageModal(false); // close message modal
        setSelectedCase(null); // reset selected case
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Error sending message. Check console for details.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3>Cases</h3>
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              padding: "0.3rem 0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>Referral Date</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>DOB</th>
              <th>DOI</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
                  Loading cases...
                </td>
              </tr>
            ) : cases.length > 0 ? (
              cases.map((c, i) => (
                <tr key={i}>
                  <td>{c.referral_date}</td>
                  <td>{c.fname}</td>
                  <td>{c.mname}</td>
                  <td>{c.lname}</td>
                  <td>{c.dob}</td>
                  <td>{c.doi}</td>
                  <td>
                    <button
                      onClick={() => handleRequestRecords(c)}
                      className="btn"
                    >
                      Request Records
                    </button>
                    <button
                      onClick={() => handleSendMessage(c)}
                      className="btn"
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      Send Back Office Message
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span style={{ margin: "0 1rem" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>

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
