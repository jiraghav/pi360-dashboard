"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";

const libraries = ["places"];
const defaultCenter = { lat: 39.8283, lng: -98.5795 };
const mapContainerStyle = { width: "100%", height: "100%", borderRadius: "8px" };

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
  const [nearestCount, setNearestCount] = useState("");
  const [withinMiles, setWithinMiles] = useState(100);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // Fit all locations initially
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((loc) => {
        bounds.extend({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });
      });
      map.fitBounds(bounds);
    }
  }, [locations]);

  // Fetch facility locations
  const fetchLocations = async () => {
    try {
      const res = await apiRequest("service_locations.php");
      if (res && res.locations) setLocations(res.locations);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, { types: ["address"] });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          alert("No details available for this address.");
          return;
        }
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPatientCoords(coords);

        if (mapRef.current) {
          mapRef.current.panTo(coords);
          mapRef.current.setZoom(10);
        }
      });
    }
  }, [isLoaded]);

  // Reset patient location and close InfoWindows if input cleared
  const handleAddressChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setPatientCoords(null);
      setSelected(null);
      if (mapRef.current) {
        mapRef.current.panTo(defaultCenter);
        mapRef.current.setZoom(4);
      }
    }
  };

  // Haversine distance calculation
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // miles
  };

  // Filter and sort locations
  const getFilteredLocations = () => {
    if (!patientCoords) return locations.map((loc) => ({ ...loc, distance: null }));

    let filtered = locations.map((loc) => ({
      ...loc,
      distance: getDistance(patientCoords.lat, patientCoords.lng, parseFloat(loc.lat), parseFloat(loc.lng)),
    }));

    filtered = filtered.filter((loc) => loc.distance <= withinMiles);
    filtered.sort((a, b) => a.distance - b.distance);

    if (nearestCount) return filtered.slice(0, nearestCount);
    return filtered;
  };

  const filteredLocations = getFilteredLocations();

  // Close InfoWindow if selected location is no longer in filtered list
  useEffect(() => {
    if (selected) {
      const exists = filteredLocations.find((loc) => loc.id === selected.id);
      if (!exists) setSelected(null);
    }
  }, [filteredLocations]);

  const handleListClick = (loc) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });
      mapRef.current.setZoom(14);
      setSelected(loc);
    }
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <ProtectedRoute>
      <div className="card" style={{ padding: "20px" }}>
        <h3>Service Locations</h3>

        {/* Inputs */}
        <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "5px", fontWeight: 500 }}>Patient Address</label>
            <input
              type="text"
              placeholder="Enter patient address"
              className="form-control"
              ref={addressInputRef}
              onChange={handleAddressChange}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "5px", fontWeight: 500 }}>Nearest Locations</label>
            <input
              type="number"
              value={nearestCount}
              min={1}
              placeholder="Number of locations"
              className="form-control"
              onChange={(e) => setNearestCount(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "5px", fontWeight: 500 }}>Within Miles</label>
            <input
              type="number"
              value={withinMiles}
              min={1}
              className="form-control"
              onChange={(e) => setWithinMiles(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        {/* Map + Table */}
        <div style={{ display: "flex", gap: "20px", height: "600px" }}>
          <div style={{ flex: 1, minWidth: "400px" }}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={4}
              center={defaultCenter}
              onLoad={onMapLoad}
            >
              {/* Patient Marker */}
              {patientCoords && (
                <Marker
                  position={patientCoords}
                  icon={{
                    url: "/patient-marker.png",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              )}

              {/* Facility Markers */}
              {filteredLocations.map((loc, idx) => (
                <Marker
                  key={loc.id}
                  position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
                  label={{ text: `${idx + 1}`, color: "#000", fontWeight: "bold" }}
                  onClick={() => setSelected(loc)}
                />
              ))}

              {/* InfoWindow */}
              {selected && (
                <InfoWindow
                  position={{ lat: parseFloat(selected.lat), lng: parseFloat(selected.lng) }}
                  onCloseClick={() => setSelected(null)}
                  options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                >
                  <div style={{ maxWidth: "250px", fontSize: "13px", lineHeight: "1.5", color: '#000' }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", color: "#007bff" }}>{selected.name}</h4>
                    <div>📍 <strong>Address:</strong><br />{selected.address}</div>
                    {selected.specialities && <div>🏥 <strong>Specialities:</strong><br />{selected.specialities}</div>}
                    {selected.distance !== null && <div>📏 <strong>Distance:</strong> {selected.distance.toFixed(2)} miles</div>}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: "scroll", maxHeight: "600px" }}>
            <table className="table table-striped" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Specialities</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((loc, idx) => (
                  <tr key={loc.id} style={{ cursor: "pointer" }} onClick={() => handleListClick(loc)}>
                    <td>{idx + 1}</td>
                    <td>{loc.name}</td>
                    <td>{loc.address}</td>
                    <td>{loc.specialities}</td>
                    <td>{loc.distance !== null ? loc.distance.toFixed(2) + ' miles' : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
