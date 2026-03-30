import { useState, useEffect } from "react";

const normalizeEmailList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }
  return [];
};

const hasAnyCaseTeamEmails = (team) =>
  team.lawyer_emails.length > 0 ||
  team.paralegal_emails.length > 0 ||
  team.case_manager_emails.length > 0;

export default function PatientFormFields({
  fnameRef,
  selectedCase,
  setSelectedCase,
  lawyers,
  caseTypes,
  languages,
  states,
  lawyerEmails,
  patientCaseTeamEmails = null
}) {
  
  const [caseManagerEmail, setCaseManagerEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const [lawyerEmail, setLawyerEmail] = useState("");
  const [lawyerEmailError, setLawyerEmailError] = useState("");

  const [paralegalEmail, setParalegalEmail] = useState("");
  const [paralegalEmailError, setParalegalEmailError] = useState("");
  const [usePatientCaseTeam, setUsePatientCaseTeam] = useState(false);
  
  const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const globalCaseTeam = {
    lawyer_emails: normalizeEmailList(lawyerEmails?.lawyer_emails),
    paralegal_emails: normalizeEmailList(lawyerEmails?.paralegal_emails),
    case_manager_emails: normalizeEmailList(lawyerEmails?.case_manager_emails),
  };

  const fetchedPatientCaseTeam = {
    lawyer_emails: normalizeEmailList(patientCaseTeamEmails?.lawyer_emails),
    paralegal_emails: normalizeEmailList(patientCaseTeamEmails?.paralegal_emails),
    case_manager_emails: normalizeEmailList(patientCaseTeamEmails?.case_manager_emails),
  };
  const selectedPatientCaseTeam = {
    lawyer_emails: normalizeEmailList(
      selectedCase.lawyer_emails
    ),
    paralegal_emails: normalizeEmailList(
      selectedCase.paralegal_emails
    ),
    case_manager_emails: normalizeEmailList(
      selectedCase.case_manager_emails
    ),
  };
  const patientCaseTeam = hasAnyCaseTeamEmails(selectedPatientCaseTeam)
    ? selectedPatientCaseTeam
    : fetchedPatientCaseTeam;
  const fetchedPatientHasCaseTeam = hasAnyCaseTeamEmails(fetchedPatientCaseTeam);

  const activeCaseTeam = usePatientCaseTeam ? patientCaseTeam : globalCaseTeam;
  const submittedCaseTeam = usePatientCaseTeam
    ? patientCaseTeam
    : {
        lawyer_emails: [],
        paralegal_emails: [],
        case_manager_emails: [],
      };

  // Set default language only ONCE when creating a new patient
  useEffect(() => {
    if (!selectedCase?.pid && languages.length > 0 && !selectedCase.preferred_language) {
      const defaultLang = languages.find(l => l.is_default == 1)?.option_id || "";
      setSelectedCase(prev => ({
        ...prev,
        preferred_language: defaultLang
      }));
    }
  }, [languages]);
  
  useEffect(() => {
    const explicitPatientCaseTeamEnabled =
      selectedCase?.use_patient_case_team === true ||
      selectedCase?.use_patient_case_team === 1 ||
      selectedCase?.use_patient_case_team === "1";
    const explicitPatientCaseTeamDisabled =
      selectedCase?.use_patient_case_team === false ||
      selectedCase?.use_patient_case_team === 0 ||
      selectedCase?.use_patient_case_team === "0";

    if (selectedCase?.pid) {
      const shouldUsePatientCaseTeam =
        explicitPatientCaseTeamEnabled ||
        (!explicitPatientCaseTeamDisabled && fetchedPatientHasCaseTeam);

      setUsePatientCaseTeam(shouldUsePatientCaseTeam);

      if (
        shouldUsePatientCaseTeam &&
        !explicitPatientCaseTeamEnabled &&
        !explicitPatientCaseTeamDisabled &&
        fetchedPatientHasCaseTeam
      ) {
        setSelectedCase((prev) => ({
          ...prev,
          lawyer_emails: normalizeEmailList(prev.lawyer_emails).length
            ? prev.lawyer_emails
            : patientCaseTeam.lawyer_emails,
          paralegal_emails: normalizeEmailList(prev.paralegal_emails).length
            ? prev.paralegal_emails
            : patientCaseTeam.paralegal_emails,
          case_manager_emails: normalizeEmailList(prev.case_manager_emails).length
            ? prev.case_manager_emails
            : patientCaseTeam.case_manager_emails,
          use_patient_case_team: "1",
        }));
      }

      return;
    }

    if (typeof selectedCase?.use_patient_case_team !== "undefined") {
      setUsePatientCaseTeam(explicitPatientCaseTeamEnabled);
      return;
    }

    setUsePatientCaseTeam(false);
  }, [
    selectedCase?.pid,
    selectedCase?.use_patient_case_team,
    selectedCase.lawyer_emails,
    selectedCase.paralegal_emails,
    selectedCase.case_manager_emails,
    fetchedPatientHasCaseTeam,
    setSelectedCase,
  ]);

  // Helper to update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSelectedCase(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // File upload handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedCase(prev => ({
      ...prev,
      lop_file: file
    }));
  };
  
  const handleAddEmail = (e, type, value, setValue, errorSetter) => {
    if (!usePatientCaseTeam) return;
    if (e.key !== "Enter") return;

    e.preventDefault();

    const email = value.trim();

    if (!email) {
      errorSetter("Email cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      errorSetter("Enter a valid email address");
      return;
    }

    if (normalizeEmailList(selectedCase[type]).includes(email)) {
      errorSetter("This email is already added");
      return;
    }

    setSelectedCase(prev => ({
      ...prev,
      [type]: [...normalizeEmailList(prev[type]), email]
    }));

    setValue("");
    errorSetter("");
  };
  
  const handleRemoveEmail = (type, emailToRemove) => {
    if (!usePatientCaseTeam) return;
    setSelectedCase(prev => ({
      ...prev,
      [type]: normalizeEmailList(prev[type]).filter((e) => e !== emailToRemove)
    }));
  };

  const handleCaseTeamToggle = (e) => {
    const enabled = e.target.checked;

    setUsePatientCaseTeam(enabled);
    setSelectedCase((prev) => {
      const next = {
        ...prev,
        use_patient_case_team: enabled ? "1" : "0",
      };

      if (enabled && !hasAnyCaseTeamEmails(patientCaseTeam)) {
        next.lawyer_emails = globalCaseTeam.lawyer_emails;
        next.paralegal_emails = globalCaseTeam.paralegal_emails;
        next.case_manager_emails = globalCaseTeam.case_manager_emails;
      }

      return next;
    });
  };

  return (
    <>
      {/* First Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          First Name *
        </label>
        <input
          ref={fnameRef}
          type="text"
          name="fname"
          required
          value={selectedCase.fname || ""}
          onChange={handleChange}
          placeholder="Enter First Name"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">
          Last Name *
        </label>
        <input
          type="text"
          name="lname"
          required
          value={selectedCase.lname || ""}
          onChange={handleChange}
          placeholder="Enter Last Name"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">DOB *</label>
        <input
          type="date"
          name="dob"
          required
          value={selectedCase.dob || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* DOI */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">Date of Injury *</label>
        <input
          type="date"
          name="doi"
          required
          value={selectedCase.doi || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">Gender *</label>
        <select
          name="gender"
          required
          value={selectedCase.gender || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Law Firm */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">Law Firm *</label>
        <select
          name="lawyer_id"
          required
          value={selectedCase.lawyer_id || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        >
          <option value="">Select Law Firm</option>
          {lawyers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.organization}
            </option>
          ))}
        </select>
      </div>
      
      <div className="md:col-span-2 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-col gap-3 mb-4 border-b border-gray-700 pb-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              Case Team
            </h3>

            <label className="inline-flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-gray-300">Patient Case Team</span>
              <input
                type="checkbox"
                checked={usePatientCaseTeam}
                onChange={handleCaseTeamToggle}
                className="h-4 w-4 accent-blue-500"
              />
            </label>
          </div>

          <p className="text-xs text-gray-400">
            {usePatientCaseTeam
              ? "Patient-specific case team is enabled. Updates here apply only to this patient."
              : "Global case team is enabled. Turn this on to assign a patient-specific case team."}
          </p>
        </div>

        <input
          type="hidden"
          name="use_patient_case_team"
          value={usePatientCaseTeam ? "1" : "0"}
        />

        <input
          type="hidden"
          name="lawyer_emails"
          value={submittedCaseTeam.lawyer_emails.join(",")}
        />

        <input
          type="hidden"
          name="paralegal_emails"
          value={submittedCaseTeam.paralegal_emails.join(",")}
        />

        <input
          type="hidden"
          name="case_manager_emails"
          value={submittedCaseTeam.case_manager_emails.join(",")}
        />

        {usePatientCaseTeam ? (
          <>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Lawyer Emails
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {activeCaseTeam.lawyer_emails.map((email, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail("lawyer_emails", email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="email"
                value={lawyerEmail}
                onChange={(e) => {
                  setLawyerEmail(e.target.value);
                  if (lawyerEmailError) setLawyerEmailError("");
                }}
                onKeyDown={(e) =>
                  handleAddEmail(e, "lawyer_emails", lawyerEmail, setLawyerEmail, setLawyerEmailError)
                }
                placeholder="Type email and press Enter"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />

              {lawyerEmailError && (
                <p className="text-xs text-red-400 mt-1">{lawyerEmailError}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Paralegal Emails
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {activeCaseTeam.paralegal_emails.map((email, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail("paralegal_emails", email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="email"
                value={paralegalEmail}
                onChange={(e) => {
                  setParalegalEmail(e.target.value);
                  if (paralegalEmailError) setParalegalEmailError("");
                }}
                onKeyDown={(e) =>
                  handleAddEmail(e, "paralegal_emails", paralegalEmail, setParalegalEmail, setParalegalEmailError)
                }
                placeholder="Type email and press Enter"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />

              {paralegalEmailError && (
                <p className="text-xs text-red-400 mt-1">{paralegalEmailError}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Case Manager Emails *
              </label>

              <div className="flex flex-wrap gap-2 mb-2">
                {activeCaseTeam.case_manager_emails.map((email, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail("case_manager_emails", email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="email"
                value={caseManagerEmail}
                onChange={(e) => {
                  setCaseManagerEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={(e) =>
                  handleAddEmail(
                    e,
                    "case_manager_emails",
                    caseManagerEmail,
                    setCaseManagerEmail,
                    setEmailError
                  )
                }
                placeholder="Type email and press Enter"
                className="w-full border rounded px-3 py-2 bg-black text-white"
              />

              {emailError && (
                <p className="text-xs text-red-400 mt-1">{emailError}</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4 rounded-lg border border-dashed border-gray-700 px-4 py-3">
            <p className="text-sm text-gray-400">
              Global case team will be used. Patient-specific lawyer, paralegal, and case manager emails will not be submitted.
            </p>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Lawyer Emails
              </label>
              <div className="flex flex-wrap gap-2">
                {globalCaseTeam.lawyer_emails.length > 0 ? (
                  globalCaseTeam.lawyer_emails.map((email, idx) => (
                    <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                      {email}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No global lawyer emails.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Paralegal Emails
              </label>
              <div className="flex flex-wrap gap-2">
                {globalCaseTeam.paralegal_emails.length > 0 ? (
                  globalCaseTeam.paralegal_emails.map((email, idx) => (
                    <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                      {email}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No global paralegal emails.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Case Manager Emails
              </label>
              <div className="flex flex-wrap gap-2">
                {globalCaseTeam.case_manager_emails.length > 0 ? (
                  globalCaseTeam.case_manager_emails.map((email, idx) => (
                    <span key={idx} className="flex items-center gap-2 bg-gray-800 text-sm text-white px-3 py-1 rounded-full">
                      {email}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No global case manager emails.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-300">Address</label>
        <input
          type="text"
          name="address"
          value={selectedCase.address || ""}
          onChange={handleChange}
          placeholder="Street address"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* City */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">City</label>
        <input
          type="text"
          name="city"
          value={selectedCase.city || ""}
          onChange={handleChange}
          placeholder="City"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* State */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">State</label>
        <select
          name="state"
          value={selectedCase.state || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 bg-black text-white"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={'state_'+s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ZIP */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-300">ZIP</label>
        <input
          type="text"
          name="zip"
          value={selectedCase.zip || ""}
          onChange={handleChange}
          placeholder="ZIP Code"
          className="w-full border rounded px-3 py-2 bg-black text-white"
        />
      </div>

      {/* Email + Phone */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={selectedCase.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Phone *</label>
          <input
            type="tel"
            name="phone"
            required
            value={selectedCase.phone || ""}
            onChange={handleChange}
            placeholder="Phone number"
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
        </div>
      </div>

      {/* Case Type + Language */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Case Type *</label>
          <select
            name="case_type_id"
            required
            value={selectedCase.case_type_id || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-black text-white"
          >
            <option value="">Select Case Type</option>
            {caseTypes.map((t) => (
              <option key={t.option_id} value={t.option_id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Preferred Language *</label>
          <select
            name="preferred_language"
            value={selectedCase.preferred_language || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-black text-white"
            required
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang.option_id} value={lang.option_id}>
                {lang.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-300">Notes</label>
        <textarea
          name="notes"
          value={selectedCase.notes || ""}
          onChange={handleChange}
          placeholder="Additional notes"
          className="w-full border rounded px-3 py-2 bg-black text-white min-h-[100px]"
        ></textarea>
      </div>

      {/* LOP Upload */}
      {!selectedCase?.pid && (
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-300">Upload LOP</label>
          <input
            type="file"
            name="lop_file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2 bg-black text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Allowed: PDF</p>
        </div>
      )}
    </>
  );
}

