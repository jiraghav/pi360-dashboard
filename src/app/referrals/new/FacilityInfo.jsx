"use client";

export default function FacilityInfo({ facility, onClear }) {
  if (!facility) return null;

  return (
    <div className="mt-6 border border-sky-700 rounded-xl p-5 bg-black text-white shadow-md">
      <div className="flex justify-between items-start">
        {/* Facility details */}
        <div>
          <h4 className="text-sky-400 font-semibold mb-2 text-sm uppercase tracking-wide">
            Refer to location
          </h4>
          <p className="text-base font-medium text-white">{facility.name}</p>

          {facility.address && (
            <p className="text-gray-400 text-sm mt-1">{facility.address}</p>
          )}

          {facility.phone && (
            <p className="text-gray-400 text-sm mt-1">📞 {facility.phone}</p>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
