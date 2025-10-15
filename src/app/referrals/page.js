"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api"; // common API helper
import { formatPhone } from "../utils/formatter"; // common formatter helper

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTagClass = (priority) => {
    if (priority.toLowerCase() === "urgent") return "tag tag-warn";
    if (priority.toLowerCase() === "standard") return "tag tag-ok";
    return "tag";
  };

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const data = await apiRequest("referrals.php");
        if (data.status && data.referrals) {
          const formatted = data.referrals.map((r) => ({
            patient: `${r.fname} ${r.lname}`,
            phone: r.phone_home,
            firm: r.organization,
            injury: r.type || "-", // API does not provide injury
            priority: r.priority_level,
            status: r.status || "-", // API does not provide status
            age: "-", // API does not provide age
          }));
          setReferrals(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch referrals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReferrals();
  }, []);

  return (
    <ProtectedRoute>
      <div className="card">
        <h3>Referrals</h3>
        <table style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Phone</th>
              <th>Firm</th>
              <th>Injury</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
                  Loading referrals...
                </td>
              </tr>
            ) : referrals.length > 0 ? (
              referrals.map((r, i) => (
                <tr key={i}>
                  <td>{r.patient}</td>
                  <td>{formatPhone(r.phone)}</td>
                  <td>{r.firm}</td>
                  <td>{r.injury}</td>
                  <td>
                    <span className={getTagClass(r.priority)}>
                      {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
                    </span>
                  </td>
                  <td>{r.status}</td>
                  <td>{r.age}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
                  No referrals available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
