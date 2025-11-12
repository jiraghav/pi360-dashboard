"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CasesHeader({ statusFilter, setStatusFilter, setSearch }) {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    const params = new URLSearchParams(window.location.search);
    if (newStatus) params.set("status", newStatus);
    else params.delete("status");
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <h3 className="text-lg font-semibold">
        {statusFilter === "active"
          ? "Active Cases"
          : statusFilter === "pending_reports"
          ? "Pending Report Cases"
          : statusFilter === "completed"
          ? "Completed Cases"
          : "All Cases"}
      </h3>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
        <div className="flex flex-row flex-wrap gap-2">
          <Link href="/referrals/new" className="btn btn-primary whitespace-nowrap">
            New Referral
          </Link>
          <Link href="/patients/new" className="btn whitespace-nowrap">
            New Patient
          </Link>
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

        <input
          type="text"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-64 border rounded px-3 py-2 bg-black text-white placeholder-gray-400"
        />
      </div>
    </div>
  );
}
