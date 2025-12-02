"use client";

import { useEffect, useState, useRef } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useToast } from "../hooks/ToastContext";
import CasesHeader from "./CasesHeader";
import CasesTable from "./CasesTable";
import RequestRecordsModal from "./RequestRecordsModal";
import SendMessageModal from "./SendMessageModal";
import SendTelemedLinkModal from "./SendTelemedLinkModal";
import SendTeleneuroLinkModal from "./SendTeleneuroLinkModal";
import SendIntakeLinkModal from "./SendIntakeLinkModal";
import UploadLOPModal from "./UploadLOPModal";
import DroppedCaseModal from "./DroppedCaseModal";
import EditDemographicsModal from "./EditDemographicsModal";

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
  const [showDroppedCaseModal, setShowDroppedCaseModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showSendTelemedLinkModal, setShowSendTelemedLinkModal] = useState(false);
  const [showSendTeleneuroLinkModal, setShowSendTeleneuroLinkModal] = useState(false);
  const [showSendIntakeLinkModal, setShowSendIntakeLinkModal] = useState(false);
  const [showUploadLOPModal, setShowUploadLOPModal] = useState(false);
  const [showEditDemographicsModal, setShowEditDemographicsModal] = useState(false);
  const limit = 10;
  const { showToast } = useToast();
  
  const casesTableRef = useRef(null);

  // Initialize filter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search") || "");
    setStatusFilter(params.get("status") || "");
    setInitialized(true);
  }, []);

  // Fetch cases
  useEffect(() => {
    if (!initialized) return;
    loadCases();
  }, [page, search, statusFilter, initialized]);
  
  const loadCases = async () => {
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

      if (casesTableRef.current) {
        casesTableRef.current.clearExpanded();
      }

    } catch (e) {
      console.error("Fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

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
  
  const confirmDroppedCaseRequest = async (formData) => {
    if (!selectedCase) return;
    try {
      const res = await apiRequest("dropped_request.php", { method: "POST", body: formData });
      if (res.status) {
        showToast("success", `Drop requested for ${selectedCase.fname} ${selectedCase.lname}`);
        setShowDroppedCaseModal(false);
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
  
  const sendTelemedLink = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("phone", selectedCase.phone_home || "");

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
  
  const sendTeleneuroLink = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("phone", selectedCase.phone_home || "");

      const res = await apiRequest("send_teleneuro_link.php", {
        method: "POST",
        body: formData,
      });

      if (res.status) {
        showToast("success", res.message || "Teleneuro link sent successfully");
        setShowSendTeleneuroLinkModal(false);
      } else {
        showToast("error", res.message || "Failed to send teleneuro link");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Something went wrong while sending the teleneuro link");
    }
  };
  
  const sendIntakeLink = async () => {
    if (!selectedCase) return;
    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("phone", selectedCase.phone_home || "");

      const res = await apiRequest("send_intake_link.php", {
        method: "POST",
        body: formData,
      });

      if (res.status) {
        showToast("success", res.message || "Intake link sent successfully");
        setShowSendIntakeLinkModal(false);
      } else {
        showToast("error", res.message || "Failed to send intake link");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Something went wrong while sending the intake link");
    }
  };

  const uploadLOP = async (formData) => {
    try {
      const res = await apiRequest("upload_lop.php", {
        method: "POST",
        body: formData,
      });

      if (res.status) {
        showToast("success", res.message || "LOP uploaded successfully");
        if (selectedCase.onSuccess) {
          selectedCase.onSuccess();
        }
        setShowUploadLOPModal(false);
      } else {
        showToast("error", res.message || "Failed to upload LOP");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Something went wrong");
    }
  };
  
  const markCaseHasLOP = (pid) => {
    setCases((prev) =>
      prev.map((c) =>
        c.pid === pid ? { ...c, has_lop: "1" } : c
      )
    );
  };

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          <CasesHeader
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setSearch={setSearch}
            search={search}
          />

          <CasesTable
            cases={cases}
            loading={loading}
            ref={casesTableRef}
            page={page}
            total={total}
            limit={limit}
            setPage={setPage}
            setSelectedCase={setSelectedCase}
            setShowRequestRecordModal={setShowRequestRecordModal}
            setShowSendMessageModal={setShowSendMessageModal}
            setShowSendTelemedLinkModal={setShowSendTelemedLinkModal}
            setShowSendTeleneuroLinkModal={setShowSendTeleneuroLinkModal}
            setShowSendIntakeLinkModal={setShowSendIntakeLinkModal}
            setShowUploadLOPModal={setShowUploadLOPModal}
            setShowDroppedCaseModal={setShowDroppedCaseModal}
            markCaseHasLOP={markCaseHasLOP}
            setShowEditDemographicsModal={setShowEditDemographicsModal}
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
      {showSendTeleneuroLinkModal && selectedCase && (
        <SendTeleneuroLinkModal
          selectedCase={selectedCase}
          onClose={() => setShowSendTeleneuroLinkModal(false)}
          onConfirm={sendTeleneuroLink}
          setSelectedCase={setSelectedCase}
        />
      )}
      {showSendIntakeLinkModal && selectedCase && (
        <SendIntakeLinkModal
          selectedCase={selectedCase}
          onClose={() => setShowSendIntakeLinkModal(false)}
          onConfirm={sendIntakeLink}
          setSelectedCase={setSelectedCase}
        />
      )}
      {showUploadLOPModal && selectedCase && (
        <UploadLOPModal
          selectedCase={selectedCase}
          onClose={() => setShowUploadLOPModal(false)}
          onConfirm={uploadLOP}
        />
      )}
      {showDroppedCaseModal && selectedCase && (
        <DroppedCaseModal
          selectedCase={selectedCase}
          onClose={() => setShowDroppedCaseModal(false)}
          onConfirm={confirmDroppedCaseRequest}
          setSelectedCase={setSelectedCase}
        />
      )}
      {showEditDemographicsModal && selectedCase && (
        <EditDemographicsModal
          selectedCase={selectedCase}
          onClose={() => setShowEditDemographicsModal(false)}
          onConfirm={async () => {
            setShowEditDemographicsModal(false);
            await loadCases();
          }}
          setSelectedCase={setSelectedCase}
        />
      )}
    </ProtectedRoute>
  );
}
