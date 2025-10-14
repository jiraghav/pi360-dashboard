"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { formatPhone } from "../utils/formatter";

export default function Attorney() {
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttorneys() {
      try {
        const data = await apiRequest("/attorneys.php");
        if (data.status && Array.isArray(data.lawyerPatientCounts)) {
          setAttorneys(
            data.lawyerPatientCounts.map((item) => ({
              firm: item.organization || "N/A",
              primary: item.primary || "-",
              activeCases: item.patientCount || 0,
              phone: item.phone || "-",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch attorneys:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAttorneys();
  }, []);

  return (
    <ProtectedRoute>
      <div className="card">
        <h3>Attorney Portal</h3>
        <table>
          <thead>
            <tr>
              <th>Firm</th>
              <th>Primary</th>
              <th>Active Cases</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Loading attorneys...
                </td>
              </tr>
            ) : attorneys.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No attorneys found
                </td>
              </tr>
            ) : (
              attorneys.map((a, i) => (
                <tr key={i}>
                  <td>{a.firm}</td>
                  <td>{a.primary}</td>
                  <td>{a.activeCases}</td>
                  <td>{formatPhone(a.phone)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
