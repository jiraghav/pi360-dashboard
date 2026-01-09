"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";

export default function CasesHeader({
  statusFilter,
  setStatusFilter,
  setSearch,
  search,
  doiFrom,
  doiTo,
  setDoiFrom,
  setDoiTo,
  isAffiliate,
  affiliateFilter,
  setAffiliateFilter,
  affiliateList
}) {
  const [searchInput, setSearchInput] = useState(search || "");

  // Local state to store the date range for DatePicker
  const [dateRange, setDateRange] = useState([
    doiFrom ? new Date(doiFrom) : null,
    doiTo ? new Date(doiTo) : null,
  ]);

  const [startDate, endDate] = dateRange;
  
  const [showAffiliateDropdown, setShowAffiliateDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAffiliateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  
  const toggleAffiliate = (id) => {
    let updated;

    if (affiliateFilter.includes(id)) {
      updated = affiliateFilter.filter(a => a !== id);
    } else {
      updated = [...affiliateFilter, id];
    }

    setAffiliateFilter(updated);
    updateAffiliateParams(updated);
  };

  const selectAllAffiliates = () => {
    const all = affiliateList.map(a => String(a.id));
    setAffiliateFilter(all);
    updateAffiliateParams(all);
  };

  const clearAffiliates = () => {
    setAffiliateFilter([]);
    updateAffiliateParams([]);
  };
  
  // Debounced search update
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Sync UI when query param changes externally
  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

  // Sync date range UI if doiFrom / doiTo change outside
  useEffect(() => {
    setDateRange([
      doiFrom ? new Date(doiFrom) : null,
      doiTo ? new Date(doiTo) : null,
    ]);
  }, [doiFrom, doiTo]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);

    const params = new URLSearchParams(window.location.search);
    if (newStatus) params.set("status", newStatus);
    else params.delete("status");

    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  const formatLocalDate = (date) =>
    date ? date.toLocaleDateString("en-CA") : "";
  
  const handleDateChange = (range) => {
    setDateRange(range);
    const [start, end] = range;
  
    const params = new URLSearchParams(window.location.search);
  
    if (start) {
      const f = formatLocalDate(start);
      setDoiFrom(f);
      params.set("doi_from", f);
    } else {
      setDoiFrom("");
      params.delete("doi_from");
    }
  
    if (end) {
      const t = formatLocalDate(end);
      setDoiTo(t);
      params.set("doi_to", t);
    } else {
      setDoiTo("");
      params.delete("doi_to");
    }
  
    window.history.replaceState({}, "", `?${params.toString()}`);
  };
  
  const toDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d); // Local timezone → No shift
  };
  
  const updateAffiliateParams = (values) => {
    const params = new URLSearchParams(window.location.search);

    if (values.length) {
      params.set("affiliates", values.join(","));
    } else {
      params.delete("affiliates");
    }

    window.history.replaceState({}, "", `?${params}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
      <h3 className="text-lg font-semibold">
        {statusFilter === "active"
          ? "Active Cases"
          : statusFilter === "pending_reports"
          ? "Pending Report Cases"
          : statusFilter === "completed"
          ? "Completed Cases"
          : "All Cases"}
      </h3>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 w-full md:w-auto">
        <div className="flex flex-row gap-2 shrink-0">
          <Link href="/referrals/new" className="btn btn-primary whitespace-nowrap">
            New Referral
          </Link>
          {isAffiliate ? (
            <span
              className="btn whitespace-nowrap opacity-50 cursor-not-allowed"
            >
              New Patient
            </span>
          ) : (
            <Link
              href="/patients/new"
              className="btn whitespace-nowrap"
            >
              New Patient
            </Link>
          )}
        </div>

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

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => {
            const val = e.target.value;
            setSearchInput(val);

            const params = new URLSearchParams(window.location.search);
            if (val) params.set("search", val);
            else params.delete("search");

            window.history.replaceState({}, "", `?${params.toString()}`);
          }}
          className="w-full sm:w-64 border rounded px-3 py-2 bg-black text-white placeholder-gray-400"
        />

        {/* 🔥 Date Range Picker (single input) */}
        <DatePicker
          selectsRange
          startDate={toDate(doiFrom)}
          endDate={toDate(doiTo)}
          onChange={handleDateChange}
          placeholderText="Select DOI Range"
          className="w-full px-3 py-2 bg-[#111] text-white border border-gray-700 rounded-lg"
          calendarClassName="dark-datepicker"
          isClearable
        />

        {
          isAffiliate && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowAffiliateDropdown(v => !v)}
                className="
  bg-black border flex items-center justify-between
  w-full sm:w-auto shrink-0
  min-w-[200px]
  px-3 py-2 rounded text-white
"
              >
                <span>
                  {affiliateFilter.length
                    ? `Affiliates (${affiliateFilter.length})`
                    : "All Affiliates"}
                </span>
                <span className="text-xs">▾</span>
              </button>
            
              {showAffiliateDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-[#111] border border-gray-700 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                  
                  {/* Select All */}
                  <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={affiliateFilter.length === affiliateList.length && affiliateList.length > 0}
                      onChange={(e) =>
                        e.target.checked ? selectAllAffiliates() : clearAffiliates()
                      }
                    />
                    <span>Select All</span>
                  </label>
            
                  <div className="border-t border-gray-700 my-1" />
            
                  {/* Affiliate list */}
                  {affiliateList.map(a => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={affiliateFilter.includes(String(a.id))}
                        onChange={() => toggleAffiliate(String(a.id))}
                      />
                      <span className="truncate">{a.name}</span>
                    </label>
                  ))}
            
                  <div className="border-t border-gray-700 my-1" />
            
                  <button
                    type="button"
                    onClick={clearAffiliates}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
}
