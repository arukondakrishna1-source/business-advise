import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { MapPin, Navigation, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const LocationSelector = () => {
  const { locationData, setLocationData, setCurrentStep, t } = useContext(AppContext);
  const [geoLocating, setGeoLocating] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [locSuccessMsg, setLocSuccessMsg] = useState('');
  const [locErrorMsg, setLocErrorMsg] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Maharashtra',
    'Gujarat', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan', 'Madhya Pradesh',
    'Odisha', 'Kerala', 'Punjab', 'Haryana'
  ];

  // Geolocation + Reverse Geocoding
  const handleUseCurrentLocation = () => {
    setLocErrorMsg('');
    setLocSuccessMsg('');

    if (!navigator.geolocation) {
      setLocErrorMsg("Geolocation is not supported by your browser. Please enter details manually.");
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Free Nominatim reverse geocoding API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          const addr = data.address || {};
          const detectedState = addr.state || locationData.state;
          const detectedDistrict = addr.state_district || addr.county || addr.city || locationData.district;
          const detectedMandal = addr.suburb || addr.town || addr.village || addr.municipality || locationData.mandal;
          const detectedVillage = addr.village || addr.neighbourhood || addr.road || locationData.village;
          const detectedPin = addr.postcode || locationData.pincode;

          setLocationData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            state: indianStates.includes(detectedState) ? detectedState : prev.state,
            district: detectedDistrict,
            mandal: detectedMandal,
            village: detectedVillage,
            pincode: detectedPin
          }));

          setLocSuccessMsg(`Detected: ${detectedVillage}, ${detectedDistrict} (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})`);
        } catch (e) {
          setLocationData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude
          }));
          setLocSuccessMsg(`GPS Coordinates captured: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        } finally {
          setGeoLocating(false);
        }
      },
      (error) => {
        setGeoLocating(false);
        setLocErrorMsg(`GPS lookup failed (${error.message}). You can select State, District, Mandal & PIN code below.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Indian PIN Code Auto-Lookup
  const handlePincodeLookup = async (pincodeVal) => {
    if (pincodeVal.length === 6 && /^\d+$/.test(pincodeVal)) {
      setPinLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeVal}`);
        const data = await res.json();
        if (data[0] && data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          setLocationData(prev => ({
            ...prev,
            pincode: pincodeVal,
            state: indianStates.includes(po.State) ? po.State : prev.state,
            district: po.District || prev.district,
            mandal: po.Block !== 'NA' ? po.Block : prev.mandal,
            village: po.Name || prev.village
          }));
          setLocSuccessMsg(`Auto-populated location for PIN ${pincodeVal}: ${po.Name}, ${po.District}`);
        }
      } catch (e) {
        // Silently fail lookup
      } finally {
        setPinLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData({ ...locationData, [name]: value });

    if (name === 'pincode') {
      handlePincodeLookup(value);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-slate-200/80">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {t.locationHeading}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            AI business advice & 15 KM spatial competitor mapping will adapt to your exact location.
          </p>
        </div>
      </div>

      {/* GPS Button Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <Navigation className="w-6 h-6 text-blue-600 shrink-0 hidden sm:block animate-bounce" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Automatic GPS Detection & Reverse Geocoding</h4>
            <p className="text-xs text-slate-600">Click to fetch your precise GPS coordinates and auto-fill address.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLocating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 shrink-0 disabled:opacity-60"
        >
          {geoLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          <span>{geoLocating ? 'Detecting Location...' : t.useCurrentLocation}</span>
        </button>
      </div>

      {locSuccessMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{locSuccessMsg}</span>
        </div>
      )}

      {locErrorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          ⚠️ {locErrorMsg}
        </div>
      )}

      {/* Manual & Auto Form */}
      <form onSubmit={handleNext} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.pincode} (Enter 6-digit PIN for auto-fill)</label>
            <div className="relative">
              <input
                type="text"
                name="pincode"
                required
                maxLength="6"
                placeholder="e.g. 522501"
                value={locationData.pincode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {pinLoading && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-600 animate-spin" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.state} *</label>
            <select
              name="state"
              value={locationData.state}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {indianStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.district} *</label>
            <input
              type="text"
              name="district"
              required
              placeholder="e.g. Guntur / Rangareddy"
              value={locationData.district}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.mandal} *</label>
            <input
              type="text"
              name="mandal"
              required
              placeholder="e.g. Tadepalli / Shamshabad"
              value={locationData.mandal}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.village} / Area *</label>
            <input
              type="text"
              name="village"
              required
              placeholder="e.g. Tadepalli Village / Shamshabad Town"
              value={locationData.village}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 text-sm transition-all"
          >
            <span>{t.nextStep}: Select Category</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
};
