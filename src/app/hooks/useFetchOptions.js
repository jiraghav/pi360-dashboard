"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function useFetchOptions() {
  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [states, setStates] = useState([]);
  const [caseManagerEmails, setCaseManagerEmails] = useState([]);

  // Lawyers
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("getLawyers.php");
        setLawyers(res.lawyers || []);
      } catch {}
    })();
  }, []);

  // Case Types
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("getCaseTypeOptions.php");
        setCaseTypes(res.options || []);
      } catch {}
    })();
  }, []);

  // Preferred Languages
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("getLanguages.php");
        setLanguages(res.languages || []);
      } catch {}
    })();
  }, []);

  // States
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("getStates.php?all=1");
        setStates(res.states || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("case_manager_emails.php");
        setCaseManagerEmails(res.data.case_manager_emails || []);
      } catch {}
    })();
  }, []);

  return { lawyers, caseTypes, languages, states, caseManagerEmails };
}
