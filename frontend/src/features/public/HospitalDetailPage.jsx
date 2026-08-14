import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../app/providers/AuthProvider';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  Star,
  Bed,
  Activity,
  Ambulance,
  Calendar,
  Navigation,
  User,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import './HospitalDetailPage.css';

export function HospitalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  useEffect(() => {
    async function loadHospital() {
      setLoading(true);
      const data = await hospitalService.getHospitalById(id);
      setHospital(data);
      setLoading(false);
    }
    loadHospital();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: '#64748b' }}>
        <Activity className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#0284c7' }} />
        Loading clinical profile & live capacity...
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Hospital Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/hospitals')} style={{ marginTop: '1rem' }}>
          Back to Hospital Search
        </Button>
      </div>
    );
  }

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/patient/appointments&hospitalId=${hospital.id}`);
    } else {
      navigate(`/patient/appointments?hospitalId=${hospital.id}`);
    }
  };

  return (
    <div className="hosp-detail-container">
      {/* BANNER HEADER */}
      <div className="hosp-banner-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge variant="success">
                <ShieldCheck size={14} /> 🟢 HealthOS Verified Facility
              </Badge>
              <Badge variant={hospital.emergencyCapable ? 'danger' : 'info'}>
                {hospital.type}
              </Badge>
              {hospital.healthos_hospital_id && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                  ID: {hospital.healthos_hospital_id}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.75rem' }}>
              {hospital.name}
            </h1>

            <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} style={{ color: '#0284c7' }} /> {hospital.address} ({hospital.distanceKm} km away)
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              <Star size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> {hospital.rating}
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>({hospital.reviewsCount} reviews)</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>License: {hospital.licenseNumber}</span>
          </div>
        </div>

        {/* PRIMARY CTAS */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={handleBookClick}>
            <Calendar size={18} /> Book Appointment
          </Button>

          {hospital.emergencyCapable && (
            <Button variant="emergency" size="lg" onClick={() => navigate('/emergency')}>
              🚨 Request Emergency Intake
            </Button>
          )}

          <Button variant="secondary" size="lg" onClick={() => setShowDirectionsModal(true)}>
            <Navigation size={18} /> Get Directions
          </Button>
        </div>
      </div>

      {/* LIVE CAPACITY METRICS */}
      <div className="hosp-capacity-grid">
        <div className="hosp-capacity-box">
          <Bed size={24} style={{ color: '#0284c7', margin: '0 auto' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {hospital.availableBeds} / {hospital.totalBeds}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Available Inpatient Beds</div>
        </div>

        <div className="hosp-capacity-box">
          <Activity size={24} style={{ color: '#10b981', margin: '0 auto' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {hospital.availableIcu} / {hospital.totalIcu}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ICU Units Ready</div>
        </div>

        <div className="hosp-capacity-box">
          <Stethoscope size={24} style={{ color: '#f59e0b', margin: '0 auto' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {hospital.ventilatorsAvailable}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Ventilators Ready</div>
        </div>

        <div className="hosp-capacity-box">
          <Ambulance size={24} style={{ color: '#e11d48', margin: '0 auto' }} />
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: hospital.emergencyCapable ? '#e11d48' : '#64748b', marginTop: '0.5rem' }}>
            {hospital.emergencyCapable ? 'ACTIVE 24/7' : 'OFFLINE'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Emergency Triage Desk</div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="hosp-layout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* DOCTORS ROSTER */}
          <Card title="Available Specialists & Doctors" subtitle="Clinical staff on active duty">
            {hospital.doctors && hospital.doctors.map((doc) => (
              <div className="doctor-card-item" key={doc.id}>
                <img src={doc.avatarUrl} alt={doc.name} className="doctor-avatar-img" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{doc.name}</h4>
                    <Badge variant="success">{doc.availability}</Badge>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600, marginTop: '0.15rem' }}>{doc.title}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {doc.specialty} • {doc.experienceYears} Years Clinical Experience
                  </p>
                </div>
              </div>
            ))}
          </Card>

          {/* CLINICAL DEPARTMENTS */}
          <Card title="Clinical Departments & Wait Times" subtitle="Real-time operational status">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {hospital.departments && hospital.departments.map((dept, i) => (
                <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ fontWeight: 700, color: '#0f172a' }}>{dept.name}</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.825rem' }}>
                    <span style={{ color: '#15803d', fontWeight: 600 }}>{dept.status}</span>
                    <span style={{ color: '#64748b' }}>Avg Wait: <strong>{dept.waitTimeMin} mins</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* SIDEBAR INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Hospital Direct Contact" subtitle="Official communication lines">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>EMERGENCY HOTLINE</span>
                <div style={{ color: '#e11d48', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem' }}>
                  <PhoneCall size={16} style={{ display: 'inline', marginRight: '6px' }} /> {hospital.emergencyHotline}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>GENERAL PHONE</span>
                <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '0.15rem' }}>{hospital.phone}</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>OFFICIAL EMAIL</span>
                <div style={{ color: '#0284c7', fontWeight: 500, marginTop: '0.15rem' }}>{hospital.email}</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>OPERATING HOURS</span>
                <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '0.15rem' }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {hospital.operatingHours}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Specializations & Services">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {hospital.specializations.map((spec, idx) => (
                <Badge key={idx} variant="info">{spec}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* DIRECTIONS MODAL */}
      {showDirectionsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '500px', width: '90%', boxShadow: 'var(--shadow-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Navigation & Directions</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem' }}>
              Hospital Address: <strong>{hospital.address}</strong>
            </p>
            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.25rem 0', fontSize: '0.85rem', color: '#0369a1' }}>
              🗺️ GPS Navigation simulation: 8 mins estimated travel time (2.4 km via Metro Central Blvd).
            </div>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => setShowDirectionsModal(false)}>
              Close Directions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
