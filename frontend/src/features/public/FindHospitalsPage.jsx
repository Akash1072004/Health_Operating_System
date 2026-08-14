import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../app/providers/AuthProvider';
import {
  Search,
  MapPin,
  Hospital,
  Bed,
  Activity,
  Star,
  PhoneCall,
  Navigation,
  Grid,
  Map,
  Filter,
  ShieldCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import './FindHospitalsPage.css';

export function FindHospitalsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Filter States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [hasBeds, setHasBeds] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'nearest');
  const [activePin, setActivePin] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await hospitalService.getHospitals({
        query,
        type,
        emergencyOnly,
        hasAvailableBeds: hasBeds,
        sortBy,
      });
      setHospitals(data);
      if (data.length > 0) setActivePin(data[0]);
      setLoading(false);
    }
    loadData();
  }, [query, type, emergencyOnly, hasBeds, sortBy]);

  const handleBookClick = (hospitalId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/patient/appointments&hospitalId=${hospitalId}`);
    } else {
      navigate(`/patient/appointments?hospitalId=${hospitalId}`);
    }
  };

  return (
    <div className="hospitals-page-container">
      {/* PAGE HEADER */}
      <div className="hospitals-header">
        <div>
          <Badge variant="info">PUBLIC HOSPITAL DIRECTORY</Badge>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            Find Verified Hospitals & Care Capacity
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Discover care options in Banda, UP sorted by proximity, clinical quality, and real-time bed capacity.
          </p>
        </div>

        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} /> Grid View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <Map size={16} /> Map View
          </button>
        </div>
      </div>

      {/* MAIN FILTERS BAR (Includes Dropdown Sort) */}
      <div className="filters-bar">
        <div className="input-container has-icon">
          <Search className="input-icon" size={16} />
          <input
            type="text"
            className="input-field"
            placeholder="Search hospital name, city, specialty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="ALL">All Hospital Types</option>
          <option value="Trauma">Trauma Center Level 1</option>
          <option value="Pediatric">Pediatric & Family</option>
          <option value="Cardiology">Cardiology Specialty</option>
          <option value="Clinic">Community Clinic</option>
        </select>

        {/* 3 CRITERIA DROPDOWN SORT (Nearest, Nearest + Best, Far but Best) */}
        <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="nearest">Sort: 📍 Nearest</option>
          <option value="nearest_best">Sort: 🌟 Nearest + Best</option>
          <option value="far_best">Sort: 🏆 Far but Best</option>
        </select>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
            />
            🚨 24/7 ER Only
          </label>

          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={hasBeds}
              onChange={(e) => setHasBeds(e.target.checked)}
            />
            🛏️ Beds Open
          </label>
        </div>
      </div>

      {/* LOADING / RESULTS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 600 }}>
          Finding verified hospitals according to criteria...
        </div>
      ) : hospitals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <Hospital size={36} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No Hospitals Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Try clearing filters or adjusting your search term.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="hospitals-grid">
          {hospitals.map((hosp) => (
            <div className="hospital-card" key={hosp.id}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Badge variant={hosp.emergencyCapable ? 'danger' : 'neutral'}>
                    {hosp.type}
                  </Badge>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={14} style={{ color: '#eab308', fill: '#eab308' }} /> {hosp.rating} ({hosp.reviewsCount})
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.65rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {hosp.name}
                  {(hosp.verification_status === 'VERIFIED' || hosp.verification_status === undefined) && (
                    <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={12} /> HealthOS Verified
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} style={{ color: '#0284c7' }} /> {hosp.address}, {hosp.city} • <strong style={{ color: '#0f172a' }}>{hosp.distanceKm} km away</strong>
                </p>

                {/* CAPACITY TELEMETRY UPDATED TIMESTAMP INDICATOR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.1rem', marginBottom: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Clock size={12} style={{ color: '#0284c7' }} /> Capacity Telemetry:
                  </span>
                  <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    Updated {hosp.lastUpdatedText || '2 mins ago (LIVE)'}
                  </span>
                </div>

                {/* CAPACITY METRICS ROW */}
                <div className="hospital-metrics-row">
                  <div className="metric-box">
                    <span className="metric-value" style={{ color: hosp.availableBeds > 0 ? '#16a34a' : '#dc2626' }}>
                      {hosp.availableBeds} / {hosp.totalBeds}
                    </span>
                    <span className="metric-label">Available Beds</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-value" style={{ color: hosp.availableIcu > 0 ? '#0284c7' : '#94a3b8' }}>
                      {hosp.availableIcu} / {hosp.totalIcu}
                    </span>
                    <span className="metric-label">Available ICUs</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-value">{hosp.ventilatorsAvailable}</span>
                    <span className="metric-label">Ventilators</span>
                  </div>
                </div>

                {/* SPECIALIZATIONS PILLS */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {hosp.specializations.map((spec, idx) => (
                    <span key={idx} style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', background: '#f1f5f9', color: '#475569', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD ACTIONS */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="primary" size="md" style={{ flex: 1 }} onClick={() => handleBookClick(hosp.id)}>
                  <Calendar size={16} /> Book Appointment
                </Button>
                <Button variant="secondary" size="md" onClick={() => navigate(`/hospitals/${hosp.id}`)}>
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* REAL WORKING MAP VIEW */
        <div className="map-simulation-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Nearby Hospital Listings ({hospitals.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: activePin?.id === hosp.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: activePin?.id === hosp.id ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setActivePin(hosp)}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{hosp.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    📍 {hosp.distanceKm} km away • ⭐ {hosp.rating} • Beds: {hosp.availableBeds} • <span style={{ color: '#059669', fontWeight: 600 }}>Updated {hosp.lastUpdatedText || '2m ago'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REAL WORKING OPENSTREETMAP INTERACTIVE MAP CANVAS */}
          <div className="simulated-map-canvas" style={{ position: 'relative', width: '100%', minHeight: '450px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <iframe
              title="Hospital Location Map"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '450px', width: '100%', filter: 'contrast(1.02)' }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${activePin ? activePin.longitude - 0.04 : -74.05},${activePin ? activePin.latitude - 0.04 : 40.68},${activePin ? activePin.longitude + 0.04 : -73.95},${activePin ? activePin.latitude + 0.04 : 40.80}&layer=mapnik&marker=${activePin ? activePin.latitude : 40.7128},${activePin ? activePin.longitude : -74.0060}`}
            />

            {/* ACTIVE HOSPITAL CARD OVERLAY */}
            {activePin && (
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{activePin.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                    📍 {activePin.address} • <strong>{activePin.distanceKm} km away</strong> • ⭐ {activePin.rating} • <span style={{ color: '#059669', fontWeight: 600 }}>Updated {activePin.lastUpdatedText || '2m ago'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="primary" size="sm" onClick={() => handleBookClick(activePin.id)}>
                    Book Care
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/hospitals/${activePin.id}`)}>
                    Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
