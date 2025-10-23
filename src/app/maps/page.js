"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";

const libraries = ["places"];
const defaultCenter = { lat: 39.8283, lng: -98.5795 };
const mapContainerStyle = { width: "100%", height: "520px", borderRadius: "0.5rem" };

export default function ServiceLocations() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef();
  const addressInputRef = useRef();

  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [patientCoords, setPatientCoords] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [withinMiles, setWithinMiles] = useState(25);
  const [filterByDistance, setFilterByDistance] = useState(false);

  const [specialities, setSpecialities] = useState([]);
  const [activeSpecialities, setActiveSpecialities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Map load
  function onMapLoad(map) {
    mapRef.current = map;
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((loc) =>
        bounds.extend({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) })
      );
      map.fitBounds(bounds);
    }
  }

  // Fetch locations
  async function fetchLocations(specialityIds = []) {
    setLoadingLocations(true);
    try {
      const res = await apiRequest("service_locations.php", {
        method: "POST",
        body: { speciality_ids: specialityIds },
      });
      if (res?.locations) setLocations(res.locations);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    } finally {
      setLoadingLocations(false);
    }
  }

  // Fetch specialities
  async function fetchSpecialities() {
    try {
      const res = await apiRequest("specialities.php");
      if (res?.specialities) setSpecialities(res.specialities);
    } catch (err) {
      console.error("Failed to fetch specialities:", err);
    }
  }

  useEffect(() => {
    fetchSpecialities();
    fetchLocations(); // initial load
  }, []);

  // Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return alert("No details available for this address.");
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPatientCoords(coords);
        setSearchInput(place.formatted_address || "");
        setSelected(null);
        mapRef.current?.panTo(coords);
        mapRef.current?.setZoom(10);
      });
    }
  }, [isLoaded]);

  // Haversine distance
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // miles
  };

  // Filter and sort locations
  const filteredLocations = locations
    .map((loc) => ({
      ...loc,
      distance: patientCoords
        ? getDistance(
            patientCoords.lat,
            patientCoords.lng,
            parseFloat(loc.lat),
            parseFloat(loc.lng)
          )
        : null,
    }))
    .filter((loc) => (filterByDistance && patientCoords ? loc.distance <= withinMiles : true))
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  const handleSpecialityClick = (id) => {
    setActiveSpecialities((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id];
      fetchLocations(newSelection);
      return newSelection;
    });
  };

  const handleListClick = (loc) => {
    if (mapRef.current) {
      if (patientCoords) {
        // Center between patient and facility
        const midLat = (parseFloat(loc.lat) + patientCoords.lat) / 2;
        const midLng = (parseFloat(loc.lng) + patientCoords.lng) / 2;
        mapRef.current.panTo({ lat: midLat, lng: midLng });

        // Optional zoom based on distance
        const distance = getDistance(
          patientCoords.lat,
          patientCoords.lng,
          parseFloat(loc.lat),
          parseFloat(loc.lng)
        );
        const zoomLevel = distance > 50 ? 5 : distance > 20 ? 7 : 10;
        mapRef.current.setZoom(zoomLevel);
      } else {
        mapRef.current.panTo({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });
        mapRef.current.setZoom(14);
      }
    }
    setSelected(loc);
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Maps</h3>
            <div className="flex gap-2">
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-9">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  ref={addressInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search locations…"
                  className="px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke w-full md:w-96"
                />
                {searchInput && (
                  <button
                    className="btn ml-2"
                    onClick={() => {
                      setSearchInput("");
                      setPatientCoords(null);
                      setSelected(null);
                    }}
                  >
                    Clear
                  </button>
                )}
                <label className="badge flex items-center gap-2 ml-2">
                  <input
                    type="checkbox"
                    className="accent-sky-500"
                    checked={filterByDistance}
                    onChange={() => setFilterByDistance(!filterByDistance)}
                  />{" "}
                  Within <span className="font-semibold">{withinMiles}</span> miles
                </label>
              </div>

              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={4}
                center={defaultCenter}
                onLoad={onMapLoad}
                onDragStart={() => setSelected(null)}
                onZoomChanged={() => setSelected(null)}
              >
                {patientCoords && (
                  <Marker
                    position={patientCoords}
                    icon={{
                      url: "/patient-map.webp",
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                  />
                )}

                {filteredLocations.map((loc, idx) => (
                  <Marker
                    key={loc.id}
                    position={{
                      lat: parseFloat(loc.lat),
                      lng: parseFloat(loc.lng),
                    }}
                    label={{
                      text: `${idx + 1}`,
                      color: "#000",
                      fontWeight: "bold",
                    }}
                    onClick={() => setSelected(loc)}
                  />
                ))}

                {selected && (
                  <InfoWindow
                    position={{
                      lat: parseFloat(selected.lat),
                      lng: parseFloat(selected.lng),
                    }}
                    onCloseClick={() => setSelected(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                  >
                    <div className="text-xs text-black max-w-xs">
                      <h4 className="text-blue-600 text-sm font-semibold">{selected.name}</h4>
                      <div>
                        📍 <strong>Address:</strong> {selected.address}
                      </div>
                      {selected.specialities && (
                        <div>
                          🏥 <strong>Specialities:</strong> {selected.specialities}
                        </div>
                      )}
                      {selected.distance !== null && (
                        <div>
                          📏 <strong>Distance:</strong> {selected.distance.toFixed(2)} miles
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>

              {/* Speciality Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {specialities.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSpecialityClick(s.id)}
                    className={`badge transition-all ${
                      activeSpecialities.includes(s.id)
                        ? "ring-2 ring-offset-2 ring-sky-400"
                        : ""
                    }`}
                  >
                    <span className="dot" style={{ background: s.color }}></span>
                    {s.description}
                  </button>
                ))}
              </div>
            </div>

            {/* Facility List */}
            <aside className="lg:col-span-3 space-y-3 max-h-[580px] overflow-y-auto pr-2">
              {loadingLocations ? (
                <p className="text-center py-10">Loading facilities...</p>
              ) : filteredLocations.length === 0 ? (
                <p className="text-center py-10">No facilities found.</p>
              ) : (
                filteredLocations.map((loc) => (
                  <div key={loc.id} className="card p-3">
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-xs text-mute line-clamp-2">{loc.address}</div>
                    {loc.distance !== null && (
                      <div className="text-xs text-gray-500 mt-1">
                        📏 {loc.distance.toFixed(2)} miles
                      </div>
                    )}
                    <button
                      className="btn mt-2 w-full"
                      onClick={() => handleListClick(loc)}
                    >
                      View on Map
                    </button>
                  </div>
                ))
              )}
            </aside>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
