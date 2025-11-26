"use client";

import { useState, useEffect } from "react";

export default function DroppedCaseModal({
  selectedCase,
  onClose,
  onConfirm,
}) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pid: selectedCase.pid,
    dropType: "",
    otherDropType: "",
    effectiveDate: "",
    newLawyerName: "",
    newLawyerContact: "",
    liabilityCarrier: "",
    claimNumber: "",
    adjusterContact: "",
    settlementStatus: "",
    settlementAmount: "",
    settlementDate: "",
    fundsHeld: "",
    fundsAmount: "",
    doc_withdraw_notice: false,
    file_withdraw_notice: null,
    doc_lop: false,
    file_lop: null,
    doc_settlement: false,
    file_settlement: null,
    clinicNote: "",
    confirmAccurate: false,
  });

  useEffect(() => {
    if (selectedCase) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCase, onClose]);

  if (!selectedCase) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dropType) return alert("Drop type is required.");
    if (!formData.effectiveDate) return alert("Effective date is required.");

    setLoading(true);
    try {
      await onConfirm(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="droppedCaseModal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm"
      onClick={(e) => e.target.id === "droppedCaseModal" && onClose()}
    >
      <div className="card max-w-2xl w-full p-6 shadow-xl rounded-2xl bg-[#111827] border border-stroke overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg text-white">Case Dropped (Lawyer)</h4>
          <button
            onClick={onClose}
            className="badge cursor-pointer transition"
          >
            Close
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 text-gray-200">

          {/* DROP TYPE */}
          <div>
            <label className="font-semibold text-white block mb-2">
              Drop type <span className="text-red-400">*</span>
            </label>

            <div className="space-y-2">
              {["Client fired firm", "Firm withdrew", "Referred to new lawyer", "Other"].map(
                (type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dropType"
                      value={type}
                      required
                      checked={formData.dropType === type}
                      onChange={handleChange}
                    />
                    {type}
                  </label>
                )
              )}

              {formData.dropType === "Other" && (
                <input
                  type="text"
                  name="otherDropType"
                  placeholder="Specify other reason"
                  value={formData.otherDropType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
                  required
                />
              )}
            </div>
          </div>

          {/* EFFECTIVE DATE */}
          <div>
            <label className="font-semibold text-white block mb-2">
              Effective date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="effectiveDate"
              required
              value={formData.effectiveDate}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />
          </div>

          {/* NEW LAWYER */}
          <div className="space-y-2">
            <label className="font-semibold text-white block mb-1">
              New lawyer (if any)
            </label>

            <input
              name="newLawyerName"
              placeholder="Name / Firm"
              value={formData.newLawyerName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />

            <input
              name="newLawyerContact"
              placeholder="Phone / Email"
              value={formData.newLawyerContact}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />
          </div>

          {/* CLAIM INFO */}
          <div className="space-y-2">
            <label className="font-semibold text-white block">Claim info</label>

            <input
              name="liabilityCarrier"
              placeholder="Liability carrier"
              value={formData.liabilityCarrier}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />

            <input
              name="claimNumber"
              placeholder="Claim #"
              value={formData.claimNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />

            <input
              name="adjusterContact"
              placeholder="Adjuster contact"
              value={formData.adjusterContact}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            />
          </div>

          {/* MONEY STATUS */}
          <div className="mb-4">
            <h5 className="text-white font-medium mb-2">Money Status</h5>
          
            {/* Settlement Status */}
            <label className="text-gray-300 font-semibold block mb-1">
              Settlement?
            </label>
          
            <div className="space-y-1 text-gray-300 ml-1">
              {["No", "Yes", "Unknown"].map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="settlementStatus"
                    value={status}
                    checked={formData.settlementStatus === status}
                    onChange={handleChange}
                  />
                  {status}
                </label>
              ))}
            </div>
          
            {/* If YES → Show Amount & Date */}
            {formData.settlementStatus === "Yes" && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-gray-300 block mb-1">Settlement Amount ($)</label>
                  <input
                    type="number"
                    name="settlementAmount"
                    placeholder="Amount $"
                    value={formData.settlementAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
                  />
                </div>
          
                <div>
                  <label className="text-gray-300 block mb-1">Settlement Date</label>
                  <input
                    type="date"
                    name="settlementDate"
                    value={formData.settlementDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
                  />
                </div>
              </div>
            )}
          
            {/* FUNDS HELD */}
            <label className="text-gray-300 font-semibold block mt-5 mb-1">
              Any funds held by firm?
            </label>
          
            <div className="space-y-1 text-gray-300 ml-1">
              {["No", "Yes"].map((val) => (
                <label key={val} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="fundsHeld"
                    value={val}
                    checked={formData.fundsHeld === val}
                    onChange={handleChange}
                  />
                  {val}
                </label>
              ))}
            </div>
          
            {/* If YES → Ask Amount */}
            {formData.fundsHeld === "Yes" && (
              <div className="mt-3">
                <label className="text-gray-300 block mb-1">Amount held ($)</label>
                <input
                  type="number"
                  name="fundsAmount"
                  placeholder="Amount $"
                  value={formData.fundsAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
                />
              </div>
            )}
          </div>
          
          {/* DOCS UPLOAD */}
          <div className="mb-4">
            <h5 className="text-white font-medium mb-2">Docs (Upload)</h5>

            {/* Withdrawal Notice */}
            <label className="flex items-start gap-2 text-gray-300 mb-2">
              <input
                type="checkbox"
                name="doc_withdraw_notice"
                className="mt-1"
                checked={formData.doc_withdraw_notice}
                onChange={handleChange}
              />
              <span>Withdrawal / Substitution notice</span>
            </label>
            {formData.doc_withdraw_notice && (
              <input
                type="file"
                name="file_withdraw_notice"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    file_withdraw_notice: e.target.files[0],
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white mb-3"
              />
            )}

            {/* LOP / lien / direction letter */}
            <label className="flex items-start gap-2 text-gray-300 mb-2">
              <input
                type="checkbox"
                name="doc_lop"
                className="mt-1"
                checked={formData.doc_lop}
                onChange={handleChange}
              />
              <span>LOP / Lien / Direction Letter (if any)</span>
            </label>
            {formData.doc_lop && (
              <input
                type="file"
                name="file_lop"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    file_lop: e.target.files[0],
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white mb-3"
              />
            )}

            {/* Settlement Statement */}
            <label className="flex items-start gap-2 text-gray-300 mb-2">
              <input
                type="checkbox"
                name="doc_settlement"
                className="mt-1"
                checked={formData.doc_settlement}
                onChange={handleChange}
              />
              <span>Settlement Statement (if any)</span>
            </label>
            {formData.doc_settlement && (
              <input
                type="file"
                name="file_settlement"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    file_settlement: e.target.files[0],
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
              />
            )}
          </div>

          {/* CLINIC NOTE */}
          <div>
            <label className="font-semibold text-white block">
              Clinic note (optional)
            </label>
            <textarea
              rows={3}
              name="clinicNote"
              value={formData.clinicNote}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke text-white"
            ></textarea>
          </div>

          {/* CONFIRM CHECKBOX */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="confirmAccurate"
              checked={formData.confirmAccurate}
              required
              onChange={handleChange}
            />
            <span className="text-sm">
              I confirm information is accurate and the clinic should contact carrier/new counsel for billing.
            </span>
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn border border-stroke text-white hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Case Dropped"}
            </button>
          </div>
        </form>

        {/* ANIMATION */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
