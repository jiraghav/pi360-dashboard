"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // immediate input for debouncing
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1); // reset to first page on search
      setSearch(searchInput);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const data = await apiRequest(
          `/cases.php?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );
        if (data.status && data.patients) {
          const mappedCases = data.patients.map((p) => ({
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

  return (
    <ProtectedRoute>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Cases</h3>
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ padding: "0.3rem 0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Referral Date</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>DOB</th>
              <th>DOI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#999" }}>
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
    </ProtectedRoute>
  );
}
