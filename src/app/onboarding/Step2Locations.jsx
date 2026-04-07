"use client";

import LocationCard from "./LocationCard";

export default function Step2Locations({ clinic, setClinic, errors }) {

  const addLocation = () => {
    setClinic(prev => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          clinic_name: "",
          full_address: "",
          address_validated: false,
          street: "",
          city: "",
          state: "",
          zip: "",
          phone: "",
          email: "",
          website: "",

          services: [],
          service_other: "",

          age_range: "",
          languages_enabled: false,
          languages: "",
          insurance: "",
          requirements: ""
        }
      ]
    }));
  };

  const updateLocation = (index, field, value) => {
    setClinic(prev => ({
      ...prev,
      locations: prev.locations.map((location, locationIndex) =>
        locationIndex === index
          ? {
              ...location,
              [field]: value
            }
          : location
      )
    }));
  };

  const removeLocation = (index) => {

    if (clinic.locations.length === 1) return;

    const updated = clinic.locations.filter((_, i) => i !== index);

    setClinic(prev => ({
      ...prev,
      locations: updated
    }));
  };

  return (

    <div>

      <h2 className="text-xl font-bold mb-6">
        Step 2: Clinic Locations
      </h2>

      <div className="space-y-8">

        {clinic.locations.map((loc, index) => (
          <LocationCard
            key={index}
            index={index}
            location={loc}
            updateLocation={updateLocation}
            removeLocation={removeLocation}
            errors={errors?.locations?.[index] || {}}
            canRemove={clinic.locations.length > 1}
          />
        ))}

      </div>

      {/* <button
        type="button"
        onClick={addLocation}
        className="mt-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      >
        + Add Another Clinic Location
      </button> */}

    </div>

  );
}
