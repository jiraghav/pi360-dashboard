"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [withinMiles, setWithinMiles] = useState(25);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((loc) => bounds.extend({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }));
      map.fitBounds(bounds);
    }
  }, [locations]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await apiRequest("service_locations.php");
        if (res?.locations) setLocations(res.locations);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, { types: ["address"] });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return alert("No details available for this address.");
        const coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        setPatientCoords(coords);
        mapRef.current?.panTo(coords);
        mapRef.current?.setZoom(10);
      });
    }
  }, [isLoaded]);

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // miles
  };

  const filteredLocations = locations
    .map((loc) => ({
      ...loc,
      distance: patientCoords
        ? getDistance(patientCoords.lat, patientCoords.lng, parseFloat(loc.lat), parseFloat(loc.lng))
        : null,
    }))
    .filter((loc) => (patientCoords ? loc.distance <= withinMiles : true));

  const handleListClick = (loc) => {
    mapRef.current?.panTo({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });
    mapRef.current?.setZoom(14);
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
              <button className="btn btn-primary">New Referral</button>
              <button className="btn">Send Message</button>
              <button className="btn">Create Task</button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-9">
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  ref={addressInputRef}
                  placeholder="Search locations…"
                  className="px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke w-full md:w-96"
                />
                <label className="badge flex items-center gap-2">
                  <input type="checkbox" className="accent-sky-500" checked={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} /> Patients heatmap
                </label>
                <label className="badge flex items-center gap-2">
                  <input type="checkbox" className="accent-sky-500" checked={true} /> Within <span className="font-semibold">{withinMiles}</span> miles
                </label>
              </div>

              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={4}
                center={defaultCenter}
                onLoad={onMapLoad}
              >
                {patientCoords && (
                  <Marker
                    position={patientCoords}
                    icon={{ url: "/patient-marker.png", scaledSize: new window.google.maps.Size(40, 40) }}
                  />
                )}

                {filteredLocations.map((loc, idx) => (
                  <Marker
                    key={loc.id}
                    position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
                    label={{ text: `${idx + 1}`, color: "#000", fontWeight: "bold" }}
                    onClick={() => setSelected(loc)}
                  />
                ))}

                {selected && (
                  <InfoWindow
                    position={{ lat: parseFloat(selected.lat), lng: parseFloat(selected.lng) }}
                    onCloseClick={() => setSelected(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                  >
                    <div className="text-xs text-black max-w-xs">
                      <h4 className="text-blue-600 text-sm font-semibold">{selected.name}</h4>
                      <div>📍 <strong>Address:</strong> {selected.address}</div>
                      {selected.specialities && <div>🏥 <strong>Specialities:</strong> {selected.specialities}</div>}
                      {selected.distance !== null && <div>📏 <strong>Distance:</strong> {selected.distance.toFixed(2)} miles</div>}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>

              {/* Speciality Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {["Chiropractic", "Pain Mgmt", "Neurology", "Imaging", "Orthopedic", "Pharmacy", "PT"].map((s, i) => (
                  <span key={i} className="badge">
                    <span className="dot" style={{ background: ["#ec4899","#f59e0b","#818cf8","#38bdf8","#10b981","#14b8a6","#84cc16"][i] }}></span>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Facility List */}
            <aside className="lg:col-span-3 space-y-3">
              {filteredLocations.map((loc) => (
                <div key={loc.id} className="card p-3">
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-xs text-mute">
                    {loc.status || "Active"} · {loc.last_visit || "No visit"}
                  </div>
                  <button className="btn mt-2 w-full" onClick={() => alert(`Call ${loc.name}`)}>
                    Call
                  </button>
                </div>
              ))}
            </aside>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
