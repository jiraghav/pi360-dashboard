"use client";

import { useState, useEffect, useCallback } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { apiRequest } from "../utils/api";

/** Human-readable phrase for a doc_type value (no "Upload" prefix). */
function docTypePhrase(dt) {
  if (!dt) return "document";
  const map = {
    reduction: "reduction",
    lop: "LOP",
    id: "ID",
    intake: "intake",
    oswestry_disability_index: "Oswestry Disability Index",
    headache_disability_index: "Headache Disability Index",
    duties_performed_under_duress: "duties under duress form",
    police_report: "police report",
    liability_cleared: "liability cleared",
    mri_report: "MRI report",
    pain_report: "pain report",
    ortho_report: "ortho report",
    neuro_report: "neuro report",
    chiro_report: "chiro report",
    other: "document",
  };
  return map[dt] || dt.replace(/_/g, " ");
}

function labelsForDocType(dt) {
  if (!dt) {
    return {
      title: "Upload document",
      intro: "Uploading document for:",
      fileLabel: "Select PDF file",
      submit: "Upload document",
      uploading: "Uploading…",
      patientHint: "Select a patient to choose document type and upload a PDF.",
    };
  }
  const phrase = docTypePhrase(dt);
  const cap = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  return {
    title: `Upload ${phrase}`,
    intro: `Uploading ${phrase} for:`,
    fileLabel: `Select ${phrase} PDF`,
    submit: `Upload ${phrase}`,
    uploading: `Uploading ${phrase}…`,
    patientHint: `Select a patient to upload your ${phrase} PDF.`,
  };
}

export default function UploadDocumentModal({
  selectedCase,
  onClose,
  onConfirm,
  showPatientSelection = false,
  setSelectedCase,
}) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState(() =>
    selectedCase?.doc_type === "reduction" ? "reduction" : (selectedCase?.doc_type ?? "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasPatient =
    Boolean(selectedCase?.pid) &&
    Boolean(selectedCase?.fname || selectedCase?.lname);

  const rawDocType = selectedCase?.doc_type;
  const hasPresetDocType =
    typeof rawDocType === "string" && rawDocType.trim() !== "";

  /** When parent opens with doc_type "reduction", uploads must stay reduction-only. */
  const lockReduction = rawDocType === "reduction";

  const getEffectiveDocType = useCallback(() => {
    if (lockReduction) return "reduction";
    if (typeof rawDocType === "string" && rawDocType !== "") return rawDocType;
    return docType;
  }, [lockReduction, rawDocType, docType]);

  const effectiveDocType = getEffectiveDocType();
  const uiLabels = labelsForDocType(effectiveDocType);

  useEffect(() => {
    if (lockReduction) {
      setDocType("reduction");
      return;
    }
    const dt = selectedCase?.doc_type;
    if (typeof dt === "string" && dt !== "") {
      setDocType(dt);
    }
  }, [selectedCase?.pid, selectedCase?.doc_type, lockReduction]);

  const loadPatients = async (inputValue, loadedOptions, { page }) => {
    try {
      const params = new URLSearchParams({ limit: 10, page: page || 1 });
      if (inputValue) params.append("search", inputValue);

      const data = await apiRequest(`cases.php?${params.toString()}`);

      return {
        options: (data.patients || []).map((p) => ({
          label: `${p.fname} ${p.lname}${p.dob ? ` — DOB: ${p.dob}` : ""}`,
          value: p,
        })),
        hasMore: page * 10 < (data.total || 0),
        additional: { page: (page || 1) + 1 },
      };
    } catch (err) {
      console.error("Failed to load patients", err);
      return { options: [], hasMore: false, additional: { page: 1 } };
    }
  };

  const patientSelectValue =
    hasPatient && setSelectedCase
      ? {
          label: `${selectedCase.fname} ${selectedCase.lname}${
            selectedCase.dob ? ` — DOB: ${selectedCase.dob}` : ""
          }`,
          value: selectedCase,
        }
      : null;

  const mergeDocTypeForPatient = useCallback(
    (prev) => {
      if (lockReduction) return "reduction";
      const prevDt = prev?.doc_type;
      const preset = typeof prevDt === "string" && prevDt !== "";
      if (preset) return prevDt;
      return docType || "";
    },
    [lockReduction, docType]
  );

  useEffect(() => {
    document.body.style.overflow = selectedCase ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCase]);

  if (!selectedCase) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected && selected.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showPatientSelection && !hasPatient) {
      setError("Please select a patient.");
      return;
    }

    const submitType = getEffectiveDocType();
    if (!submitType) {
      setError("Please select a document type.");
      return;
    }

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pid", selectedCase.pid);
      formData.append("doc_type", submitType);
      formData.append("document", file);

      await onConfirm(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">{uiLabels.title}</h4>
          <button onClick={onClose} className="badge cursor-pointer hover:bg-stroke/40">
            Close
          </button>
        </div>

        {/* Patient search (dashboard / global entry) */}
        {showPatientSelection && setSelectedCase && (
          <div className="mb-4">
            <label className="block text-sm mb-1 text-white">
              Patient <span className="text-rose-500">*</span>
            </label>
            <AsyncPaginate
              placeholder="Search and select patient"
              value={patientSelectValue}
              loadOptions={loadPatients}
              onChange={(val) => {
                if (val?.value) {
                  setSelectedCase((prev) => ({
                    ...val.value,
                    doc_type: mergeDocTypeForPatient(prev),
                    onSuccess: prev?.onSuccess,
                  }));
                } else {
                  setSelectedCase((prev) => ({
                    doc_type: mergeDocTypeForPatient(prev),
                    onSuccess: prev?.onSuccess,
                  }));
                }
                setError("");
              }}
              additional={{ page: 1 }}
              styles={{
                control: (p) => ({
                  ...p,
                  backgroundColor: "#0b0f16",
                  borderColor: "#1f2937",
                }),
                singleValue: (p) => ({ ...p, color: "white" }),
                input: (p) => ({ ...p, color: "white" }),
                placeholder: (p) => ({ ...p, color: "#9ca3af" }),
                option: (p) => ({
                  ...p,
                  color: "white",
                  backgroundColor: "black",
                }),
              }}
            />
          </div>
        )}

        {/* Case Info */}
        {hasPatient && (
          <p className="text-sm text-mute mb-4">
            {uiLabels.intro}
            <br />
            <strong className="text-white">
              {selectedCase.fname} {selectedCase.mname} {selectedCase.lname}
            </strong>
            <br />
            DOB: {selectedCase.dob}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {showPatientSelection && !hasPatient && (
            <p className="text-sm text-slate-400">
              {hasPresetDocType
                ? uiLabels.patientHint
                : "Select a patient to choose document type and upload a PDF."}
            </p>
          )}

          {(!showPatientSelection || hasPatient) && (
            <>
              {!hasPresetDocType && (
                <div>
                  <label className="block text-sm mb-1 text-white">
                    Document type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
                    required
                  >
                    <option value="">Select document type</option>
                    <option value="id">ID</option>
                    <option value="intake">Intake</option>
                    <option value="oswestry_disability_index">Oswestry Disability Index</option>
                    <option value="headache_disability_index">Headache Disability Index</option>
                    <option value="duties_performed_under_duress">Duties Performed Under Duress at Work and Home</option>
                    <option value="police_report">Police Report</option>
                    <option value="liability_cleared">Liability Cleared</option>
                    <option value="lop">LOP</option>
                    <option value="mri_report">MRI Report</option>
                    <option value="pain_report">Pain Report</option>
                    <option value="ortho_report">Ortho Report</option>
                    <option value="neuro_report">Neuro Report</option>
                    <option value="chiro_report">Chiro Report</option>
                    <option value="reduction">Reduction</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm mb-1 text-white">
                  {uiLabels.fileLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-rose-500">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (showPatientSelection && !hasPatient)}
            >
              {loading ? uiLabels.uploading : uiLabels.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
