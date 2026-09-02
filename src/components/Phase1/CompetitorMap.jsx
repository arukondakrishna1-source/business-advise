import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { MapPin, AlertCircle, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import L from 'leaflet';

export const CompetitorMap = () => {
  const {
    locationData,
    selectedCategory,
    competitorsData,
    setCompetitorsData,
    setCurrentStep,
    t
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Fetch competitor search data from server
    apiFetch('/api/competitors/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_code: selectedCategory?.code,
        state: locationData.state,
        district: locationData.district,
        mandal: locationData.mandal,
        lat: locationData.lat,
        lng: locationData.lng
      })
    })
      .then(data => {
        setCompetitorsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, locationData]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!loading && competitorsData && mapContainerRef.current && !mapInstanceRef.current) {
      const userLat = locationData.lat || 16.483;
      const userLng = locationData.lng || 80.601;

      const map = L.map(mapContainerRef.current).setView([userLat, userLng], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom User Pin Icon
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `<div style="background-color:#1E3A8A; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.4); font-weight:bold;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      // User Proposed Location Marker
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Proposed Location</b><br/>${locationData.village}, ${locationData.mandal}`)
        .openPopup();

      // 15 KM Radius Circle
      L.circle([userLat, userLng], {
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        radius: 15000 // 15 KM in meters
      }).addTo(map);

      // Competitors Markers
      const compIcon = L.divIcon({
        className: 'custom-comp-icon',
        html: `<div style="background-color:#EF4444; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:12px;">🏬</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      competitorsData.competitors.forEach(comp => {
        L.marker([comp.lat, comp.lng], { icon: compIcon })
          .addTo(map)
          .bindPopup(`<b>${comp.name}</b><br/>${comp.address}<br/>Distance: <b>${comp.distanceKm} KM</b>`);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, competitorsData, locationData]);

  const handleNext = () => {
    setCurrentStep(5); // Move to AI Advisory Analysis
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-slate-200/80">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {t.competitorHeading}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t.competitorSub}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 font-semibold">
          Analyzing 15 KM spatial competitor radius...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Map Container */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-inner border border-slate-300">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase">{t.proposedLocation}</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">{locationData.village}, {locationData.mandal}</div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-bold text-blue-700 uppercase">15 KM Radius Search</div>
              <div className="text-base font-extrabold text-blue-900 mt-1">15.0 KM Area Scan</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-700 uppercase">{t.nearbyCompetitors}</div>
              <div className="text-xl font-extrabold text-emerald-900 mt-1">
                {competitorsData?.totalFound || 0} Businesses
              </div>
            </div>
          </div>

          {/* List of Nearby Competitors */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-blue-600" />
              Identified Competitor Locations
            </h4>

            {competitorsData?.competitors?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {competitorsData.competitors.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{comp.name}</div>
                      <div className="text-slate-500">{comp.address}</div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 font-extrabold px-2.5 py-1 rounded-lg shrink-0 ml-2">
                      {comp.distanceKm} KM
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No direct registered competitors found within 15 KM radius.</p>
            )}
          </div>

          {/* Data Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start text-amber-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-amber-600" />
            <span>{t.disclaimerData}</span>
          </div>

        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backStep}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
        >
          <span>Generate Full AI Advisory Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
