"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../utils/api";

export default function useFetchOptions(options = {}) {
  const {
    fetchLawyers = false,
    fetchCaseTypes = false,
    fetchLanguages = false,
    fetchStates = false,
    fetchCaseManagers = false,
    fetchRoles = false,
    fetchName = false
  } = options;

  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [states, setStates] = useState([]);
  const [caseManagerEmails, setCaseManagerEmails] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [isAffiliateLoading, setIsAffiliateLoading] = useState(true);
  const [name, setName] = useState("");

  const calledRef = useRef({});

  const shouldCall = (key) => {
    if (calledRef.current[key]) return false;
    calledRef.current[key] = true;
    return true;
  };

  // Lawyers
  useEffect(() => {
    if (!fetchLawyers || !shouldCall("lawyers")) return;

    (async () => {
      try {
        const res = await apiRequest("getLawyers.php");
        setLawyers(res.lawyers || []);
      } catch {}
    })();
  }, [fetchLawyers]);

  // Case Types
  useEffect(() => {
    if (!fetchCaseTypes || !shouldCall("caseTypes")) return;

    (async () => {
      try {
        const res = await apiRequest("getCaseTypeOptions.php");
        setCaseTypes(res.options || []);
      } catch {}
    })();
  }, [fetchCaseTypes]);

  // Languages
  useEffect(() => {
    if (!fetchLanguages || !shouldCall("languages")) return;

    (async () => {
      try {
        const res = await apiRequest("getLanguages.php");
        setLanguages(res.languages || []);
      } catch {}
    })();
  }, [fetchLanguages]);

  // States
  useEffect(() => {
    if (!fetchStates || !shouldCall("states")) return;

    (async () => {
      try {
        const res = await apiRequest("getStates.php?all=1");
        setStates(res.states || []);
      } catch {}
    })();
  }, [fetchStates]);

  // Case Manager Emails
  useEffect(() => {
    if (!fetchCaseManagers || !shouldCall("caseManagers")) return;

    (async () => {
      try {
        const res = await apiRequest("case_manager_emails.php");
        setCaseManagerEmails(res.data?.case_manager_emails || []);
      } catch {}
    })();
  }, [fetchCaseManagers]);

  // Roles
  useEffect(() => {
    if (!fetchRoles || !shouldCall("roles")) return;
    setIsAffiliateLoading(true);
    
    (async () => {
      try {
        const res = await apiRequest("getRoles.php");
        const roleList = res.roles || [];

        setRoles(roleList);
        setIsAffiliate(
          Array.isArray(roleList) && roleList.includes("affiliate")
        );
        setIsAffiliateLoading(false);
      } catch {}
    })();
  }, [fetchRoles]);

  useEffect(() => {
    if (!fetchName || !shouldCall("setName")) return;
    
    (async () => {
      try {
        const res = await apiRequest("lawyerName.php");

        setName(res.lawyer_name);
      } catch {}
    })();
  }, [fetchName]);

  return {
    lawyers,
    caseTypes,
    languages,
    states,
    caseManagerEmails,
    roles,
    isAffiliate,
    isAffiliateLoading,
    name,
  };
}
