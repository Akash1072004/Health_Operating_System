import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';

export function EmergencyLocation({ onLocationCaptured, initialAddress = 'Banda, Uttar Pradesh' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState(initialAddress);
  const [coords, setCoords] = useState({ latitude: 25.4850, longitude: 80.3400, accuracy: 15 });

  const detectLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation service is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const captured = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 10),
          address_text: 'Current GPS Location (Detected)',
        };
        setCoords(captured);
        setLoading(false);
        if (onLocationCaptured) onLocationCaptured(captured);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError('Unable to access your current location. Please check browser permissions.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      const customLoc = {
        latitude: 25.4775,
        longitude: 80.3347,
        accuracy: 50,
        address_text: manualAddress.trim(),
      };
      setCoords(customLoc);
      setManualMode(false);
      if (onLocationCaptured) onLocationCaptured(customLoc);
    }
  };

  return (
    <div className="emergency-location-box">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <MapPin size={18} style={{ color: '#0284c7' }} />
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.925rem' }}>Location Telemetry:</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={14} className="spin-icon" /> Detecting current GPS location...
        </div>
      ) : error && !manualMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
          <div style={{ color: '#dc2626', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <AlertCircle size={15} /> {error}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={detectLocation}>
              <RefreshCw size={14} /> RETRY
            </Button>
            <Button variant="outline" size="sm" onClick={() => setManualMode(true)}>
              <Edit3 size={14} /> ENTER LOCATION MANUALLY
            </Button>
          </div>
        </div>
      ) : manualMode ? (
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
          <input
            type="text"
            className="input-field"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
            placeholder="Enter landmark, road, or city..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
          />
          <Button variant="primary" size="sm" type="submit">
            Save
          </Button>
        </form>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
            📍 {coords.address_text || 'Banda, Uttar Pradesh'}
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginLeft: '0.4rem' }}>
              ({coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)} • ±{coords.accuracy}m)
            </span>
          </div>
          <button
            style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.775rem', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setManualMode(true)}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
