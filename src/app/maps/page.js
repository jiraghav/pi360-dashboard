"use client";

import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiRequest } from "../utils/api";
import { useRouter } from "next/navigation";

const libraries = ["places"];
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

export default function ServiceLocations() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef();
  const addressInputRef = useRef();
  
  const router = useRouter();

  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [patientCoords, setPatientCoords] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [withinMiles, setWithinMiles] = useState(25);
  const [filterByDistance, setFilterByDistance] = useState(true);

  const [specialities, setSpecialities] = useState([]);
  const [activeSpecialities, setActiveSpecialities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [showFilters, setShowFilters] = useState(true);
  
  const [mapContainerStyle, setMapContainerStyle] = useState({
    width: "100%",
    height: "520px",
    borderRadius: "0.5rem",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("specialities.php");
        if (res?.specialities) setSpecialities(res.specialities);
      } catch (err) {
        console.error("Failed to fetch specialities:", err);
      }
    })();
  }, []);
  
  useEffect(() => {
    const updateHeight = () => {
      setMapContainerStyle({
        width: "100%",
        height: window.innerWidth < 768 ? "250px" : "520px", // 👈 mobile breakpoint
        borderRadius: "0.5rem",
      });
    };

    updateHeight(); // run on mount
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Google Autocomplete setup
  useEffect(() => {
    if (isLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["geocode", "establishment"],
          fields: ["geometry", "formatted_address", "name", "place_id"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry)
          return;
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPatientCoords(coords);
        setSearchInput(place.formatted_address || "");
        setSelected(null);
        moveMapToCoords(coords);
      });
  
      // 🟩 Add this block
      addressInputRef.current.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const query = addressInputRef.current.value.trim();
          if (!query) return;
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: query }, (results, status) => {
            if (status === "OK" && results[0]) {
              const location = results[0].geometry.location;
              const coords = { lat: location.lat(), lng: location.lng() };
              setPatientCoords(coords);
              setSearchInput(results[0].formatted_address || query);
              setSelected(null);
              moveMapToCoords(coords);
            } else {
              alert("Could not find that address. Try again.");
            }
          });
        }
      });
    }
  }, [isLoaded]);
  
  const moveMapToCoords = (coords) => {
    if (mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(coords);
      mapRef.current.fitBounds(bounds);
      mapRef.current.setZoom(Math.min(mapRef.current.getZoom(), 14));
    } else {
      // retry every 200ms until mapRef is ready
      const interval = setInterval(() => {
        if (mapRef.current) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(coords);
          mapRef.current.fitBounds(bounds);
          mapRef.current.setZoom(Math.min(mapRef.current.getZoom(), 14));
          clearInterval(interval);
        }
      }, 200);

      // optional safety timeout
      setTimeout(() => clearInterval(interval), 4000);
    }
  };

  // Fetch locations (only when BOTH speciality and address exist)
  useEffect(() => {
    async function fetchLocations() {
      if (!patientCoords) {
        setLocations([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const res = await apiRequest("service_locations.php", {
          method: "POST",
          body: {
            speciality_ids: activeSpecialities,
            lat: patientCoords.lat,
            lng: patientCoords.lng,
            miles: withinMiles,
          },
        });

        if (res?.locations?.length) {
          setLocations(res.locations);
        } else {
          setLocations([]);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    }

    fetchLocations();
  }, [activeSpecialities, patientCoords, withinMiles]);
  
  useEffect(() => {
    if (window.innerWidth >= 768) return; // only mobile
  
    if (patientCoords) {
      const timeout = setTimeout(() => {
        setShowFilters(false);
      }, 1000); // wait a bit before hiding
  
      return () => clearTimeout(timeout);
    }
  }, [activeSpecialities, patientCoords, withinMiles]);

  // Calculate distance (Haversine)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371;
  };

  // Filter and sort
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
    .filter((loc) =>
      filterByDistance && patientCoords ? loc.distance <= withinMiles : true
    )
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
    
    useEffect(() => {
      if (!mapRef.current || !window.google) return;
      if (!patientCoords) return;
    
      // If user just clicked a facility, skip this one re-fit
      if (selected && !loadingLocations) return;
    
      const visibleMarkers = [...filteredLocations];
      if (visibleMarkers.length === 0) return;
    
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(patientCoords); // Include patient marker
    
      visibleMarkers.forEach((loc) =>
        bounds.extend({
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lng),
        })
      );
    
      // Fit map to include only filtered markers
      mapRef.current.fitBounds(bounds);
    
      // Add slight zoom adjustment for better visual
      const listener = window.google.maps.event.addListenerOnce(
        mapRef.current,
        "bounds_changed",
        () => {
          if (mapRef.current.getZoom() > 14) {
            mapRef.current.setZoom(14);
          }
        }
      );
    
      return () => window.google.maps.event.removeListener(listener);
    }, [
      filteredLocations,
      withinMiles,
      activeSpecialities,
      patientCoords,
      loadingLocations,
    ]);
    
    useEffect(() => {
    if (!selected) return;

    // Check if the selected marker still exists in filtered list
    const stillExists = filteredLocations.some((loc) => loc.id === selected.id);

    if (!stillExists) {
      setSelected(null); // 👈 Close InfoWindow automatically
    }
  }, [filteredLocations, selected]);

  const handleSpecialityClick = (id) => {
    setActiveSpecialities((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // 👇 Updated for smooth scroll to map
  // When user clicks "View on Map"
  const handleListClick = (loc) => {
    if (!mapRef.current) return;
  
    setSelected(loc);
  
    // Wait a tiny bit so InfoWindow doesn’t fight the map pan
    setTimeout(() => {
      if (patientCoords) {
        const bounds = new window.google.maps.LatLngBounds();
  
        // Include both patient and facility
        bounds.extend(patientCoords);
        bounds.extend({
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lng),
        });
  
        // Fit to both markers
        mapRef.current.fitBounds(bounds);
  
        // Prevent over-zoom (e.g., if they’re very close)
        const listener = window.google.maps.event.addListenerOnce(
          mapRef.current,
          "bounds_changed",
          () => {
            if (mapRef.current.getZoom() > 14) {
              mapRef.current.setZoom(14);
            }
          }
        );
  
        // Clean up listener
        setTimeout(
          () => window.google.maps.event.removeListener(listener),
          1000
        );
      } else {
        // Fallback — just pan to facility
        mapRef.current.panTo({
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lng),
        });
        mapRef.current.setZoom(14);
      }
  
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 150);
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p></p>;

  const shouldShowMap = patientCoords;
  
  const handleSendReferral = (loc) => {
    if (!loc?.id) return;

    localStorage.setItem(
      "selectedReferralFacility",
      JSON.stringify({
        id: loc.id,
        name: loc.name,
        address: loc.address || "",
      })
    );

    router.push(`/referrals/new?facility_id=${loc.id}&facility_name=${encodeURIComponent(loc.name)}`);
  };

  return (
    <ProtectedRoute>
      <main className="px-4 md:px-6 md:py-8 py-4 max-w-7xl mx-auto space-y-8">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Service Locations</h3>
          
            {/* 👇 Toggle Button */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="btn text-sm px-3 py-1 bg-[#1a1f2e] border border-stroke hover:bg-[#23293a] right-4 bottom-4 shadow-lg md:hidden"
            >
              {showFilters ? "Hide Filters" : "Change Filters"}
            </button>
          </div>
          
          {/* 👇 Filters Section (Collapsible) */}
          <div
            className={`transition-all duration-500 overflow-hidden ${
              showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {/* Search + Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                ref={addressInputRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter address…"
                className="px-3 py-2 rounded-lg bg-[#0b0f16] border border-stroke w-full md:w-96"
              />
              {searchInput && (
                <button
                  className="btn ml-2"
                  onClick={() => {
                    setSearchInput("");
                    setPatientCoords(null);
                    setSelected(null);
                    setLocations([]);
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
                />
                Within <span className="font-semibold">{withinMiles}</span> miles
              </label>
            </div>
          
            {/* Speciality Filters */}
            <div className="flex flex-wrap gap-2 mb-2">
              <label htmlFor="speciality" className="text-sm font-medium">
                Choose service (optional):
              </label>
              {specialities.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSpecialityClick(s.id)}
                  className={`badge transition-all ${
                    activeSpecialities.includes(s.id)
                      ? "ring-2 ring-sky-400"
                      : ""
                  }`}
                >
                  <span className="dot" style={{ background: s.color }}></span>
                  {s.description}
                </button>
              ))}
          
              {activeSpecialities.length > 0 && (
                <button
                  className="badge px-2 py-1 text-xs bg-[#1a1f2e] border border-stroke text-gray-300 hover:bg-[#23293a]"
                  onClick={() => {
                    setActiveSpecialities([]);
                    setLocations([]);
                  }}
                >
                  ✖ Clear All
                </button>
              )}
            </div>
          </div>

          {/* Map + Facility List */}
          {shouldShowMap ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map */}
              <div
                className="lg:col-span-9 relative"
              >
                {loadingLocations && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-sm z-10 rounded-lg">
                    Loading locations...
                  </div>
                )}

                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={4}
                  center={defaultCenter}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                  }}
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
                      icon={{
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                            <path fill="${loc.color}" stroke="white" stroke-width="2"
                              d="M16 0C9 0 3 6 3 13c0 9 13 19 13 19s13-10 13-19C29 6 23 0 16 0z"/>
                          </svg>
                        `)}`,
                        scaledSize: new window.google.maps.Size(36, 36),
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
                      options={{
                        pixelOffset: new window.google.maps.Size(0, -30),
                      }}
                    >
                      <div className="text-xs text-black max-w-xs">
                        <h4 className="text-blue-600 text-sm font-semibold">
                          {selected.name}
                        </h4>
                        <div>
                          📍 <strong>Address:</strong> {selected.address}
                        </div>
                        {selected.specialities && (
                          <div>
                            🏥 <strong>Specialities:</strong>{" "}
                            {selected.specialities}
                          </div>
                        )}
                        {selected.distance !== null && (
                          <div>
                            📏 <strong>Distance:</strong>{" "}
                            {selected.distance.toFixed(2)} miles
                          </div>
                        )}
                        <div className="mt-3 flex justify-center">
                          <button
                            onClick={() => handleSendReferral(selected)}
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-sky-600 to-blue-600 
                                       text-white font-medium px-3 py-1.5 rounded-lg text-xs shadow-sm 
                                       hover:from-sky-700 hover:to-blue-700 active:scale-[0.98] transition-all"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10m-7 4h4m-9 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            Send Referral
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>

              {/* Facility List */}
              <aside className="lg:col-span-3 space-y-3 md:max-h-[500px] overflow-y-auto pr-2 mt-6 lg:mt-0">
                {filteredLocations.length > 0 && !loadingLocations && (
                  <div className="text-sm text-gray-400 mb-2">
                    Showing <span className="font-semibold text-gray-200">{filteredLocations.length}</span>{" "}
                    service {filteredLocations.length === 1 ? "location" : "locations"}
                  </div>
                )}
                {loadingLocations ? (
                  <p className="text-center py-10">Loading facilities...</p>
                ) : filteredLocations.length === 0 ? (
                  <p className="text-center py-10">No facilities found.</p>
                ) : (
                  filteredLocations.map((loc) => (
                    <div key={loc.id} className="card p-3">
                    <div className="flex items-start gap-2">
                      <span
                        className="inline-block w-3.5 h-3.5 rounded-full flex-shrink-0 mt-[2px]"
                        style={{
                          backgroundColor: loc.color || "#3b82f6",
                        }}
                      ></span>
                      <div className="font-medium leading-snug">{loc.name}</div>
                    </div>
                      <div className="text-xs text-mute line-clamp-2">
                        {loc.address}
                      </div>
                      {loc.distance !== null && (
                        <div className="text-xs text-gray-500 mt-1">
                          📏 {loc.distance.toFixed(2)} miles
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button
                          onClick={() => handleListClick(loc)}
                          className="flex-1 inline-flex items-center justify-center gap-1 
                                     px-3 py-2 rounded-lg text-sm font-medium border border-stroke 
                                     bg-[#1a1f2e] hover:bg-[#23293a] text-gray-200 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314l-4.243-4.243"
                            />
                          </svg>
                          View on Map
                        </button>
                      
                        <button
                          onClick={() => handleSendReferral(loc)}
                          className="flex-1 inline-flex items-center justify-center gap-1 
                                     px-3 py-2 rounded-lg text-sm font-medium 
                                     bg-gradient-to-r from-sky-600 to-blue-600 text-white 
                                     hover:from-sky-700 hover:to-blue-700 shadow-sm 
                                     active:scale-[0.98] transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10m-7 4h4m-9 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Send Referral
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </aside>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              🔍 Please enter an <strong>address</strong> to view nearby facilities on the map.
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
