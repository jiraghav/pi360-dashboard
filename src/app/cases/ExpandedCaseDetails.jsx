"use client";

export default function ExpandedCaseDetails({ data }) {
  return (
    <div className="mt-2 md:mt-4 p-3 md:p-4 rounded-xl border border-stroke bg-card">
      {data ? (
        <>
          <div class="text-sm text-mute mb-2">Case Details:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {/* Case Info Card */}
          <div className="card p-3">
            <div className="text-xs text-slate-500 mb-1 font-medium">Case Info</div>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between">
                  <span className="text-slate-500">CMVA:</span>
                  <span className="font-medium">
                    {data.detail.casetype || "—"}
                  </span>
                </li>
          
                <li className="flex justify-between">
                  <span className="text-slate-500">Limits:</span>
                  <span className="font-medium">
                    {data.detail.limits || "—"}
                  </span>
                </li>
          
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Liability Cleared:</span>
                  <span
                    className={`font-semibold ${
                      data.detail.liability_cleared == null
                        ? "text-slate-400"
                        : Number(data.detail.liability_cleared)
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {data.detail.liability_cleared == null
                      ? "—"
                      : Number(data.detail.liability_cleared)
                      ? "Yes"
                      : "No"}
                  </span>
                </li>
              </ul>
            </div>
            {data.sections?.map((section, i) => (
              <div key={i} className="card p-3">
                <div className="text-mute text-xs">{section.title}</div>
                <div className="font-semibold">{section.status}</div>

                {(section.last_visit || section.visits || section.balance) && (
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-1 text-xs text-gray-400">
                    {section.visits && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Visits:</span>
                        <span>{section.visits}</span>
                      </div>
                    )}
                    {section.last_visit && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Last Visit:</span>
                        <span className="truncate">{section.last_visit}</span>
                      </div>
                    )}
                    {section.balance && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-300">Bill:</span>
                        <span>${section.balance}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-3 text-center text-mute text-sm">Loading details...</div>
      )}
    </div>
  );
}
