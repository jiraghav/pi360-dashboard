"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";
import CasesHeader from "./CasesHeader";
import CasesTable from "./CasesTable";
import RequestRecordsModal from "./RequestRecordsModal";
import SendMessageModal from "./SendMessageModal";
import SendTelemedLinkModal from "./SendTelemedLinkModal";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showRequestRecordModal, setShowRequestRecordModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showSendTelemedLinkModal, setShowSendTelemedLinkModal] = useState(false);
  const limit = 10;
  const { showToast } = useToast();

  // Initialize filter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatusFilter(params.get("status") || "");
    setInitialized(true);
  }, []);

  // Fetch cases
  useEffect(() => {
    if (!initialized) return;
    (async () => {
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
      } catch (e) {
        console.error("Fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, search, statusFilter, initialized]);

  // Request Records
  const confirmRequestRecord = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("note", selectedCase.description || "");
      const res = await apiRequest("request_records.php", { method: "POST", body: formData });
      if (res.status) {
        showToast("success", `Records requested for ${selectedCase.fname} ${selectedCase.lname}`);
        setShowRequestRecordModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send Message
  const sendBackOfficeMessage = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("message", selectedCase.message || "");
      const res = await apiRequest("send_back_office_msg.php", { method: "POST", body: formData });
      if (res.status) {
        showToast("success", res.message);
        setShowSendMessageModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  // Send Telemed Link
  const sendTelemedLink = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("phone", selectedCase.phone_home || "");
      formData.append("telemed_link", selectedCase.telemedLink || "");

      const res = await apiRequest("send_telemed_link.php", {
        method: "POST",
        body: formData,
      });

      if (res.status) {
        showToast("success", res.message || "Telemed link sent successfully");
        setShowSendTelemedLinkModal(false);
      } else {
        showToast("error", res.message || "Failed to send telemed link");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Something went wrong while sending the telemed link");
    }
  };

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          <CasesHeader
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setSearch={setSearch}
          />

          <CasesTable
            cases={cases}
            loading={loading}
            page={page}
            total={total}
            limit={limit}
            setPage={setPage}
            setSelectedCase={setSelectedCase}
            setShowRequestRecordModal={setShowRequestRecordModal}
            setShowSendMessageModal={setShowSendMessageModal}
            setShowSendTelemedLinkModal={setShowSendTelemedLinkModal}
          />
        </section>
      </main>

      {showRequestRecordModal && selectedCase && (
        <RequestRecordsModal
          selectedCase={selectedCase}
          onClose={() => setShowRequestRecordModal(false)}
          onConfirm={confirmRequestRecord}
          setSelectedCase={setSelectedCase}
        />
      )}
      {showSendMessageModal && selectedCase && (
        <SendMessageModal
          selectedCase={selectedCase}
          onClose={() => setShowSendMessageModal(false)}
          onConfirm={sendBackOfficeMessage}
          setSelectedCase={setSelectedCase}
        />
      )}
      {showSendTelemedLinkModal && selectedCase && (
        <SendTelemedLinkModal
          selectedCase={selectedCase}
          onClose={() => setShowSendTelemedLinkModal(false)}
          onConfirm={sendTelemedLink}
          setSelectedCase={setSelectedCase}
        />
      )}
    </ProtectedRoute>
  );
}
