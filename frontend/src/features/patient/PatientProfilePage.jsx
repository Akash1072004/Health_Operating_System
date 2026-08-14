import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { profileService } from '../../services/profileService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  User,
  ShieldCheck,
  Heart,
  Phone,
  MapPin,
  AlertTriangle,
  Save,
  CheckCircle2,
  Activity,
  FileText,
} from 'lucide-react';
import './PatientProfilePage.css';

export function PatientProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    allergies: '',
    conditions: '',
    current_medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    address: '',
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const data = await profileService.getPatientProfile(user?.id);
      setProfile({
        full_name: data.full_name || user?.full_name || '',
        email: data.email || user?.email || '',
        phone_number: data.phone_number || user?.phone_number || '',
        age: data.age !== undefined && data.age !== null ? data.age : '',
        gender: data.gender || 'Male',
        blood_group: data.blood_group || 'O+',
        allergies: data.allergies || '',
        conditions: data.conditions || '',
        current_medications: data.current_medications || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        emergency_contact_relation: data.emergency_contact_relation || '',
        address: data.address || 'Banda, Uttar Pradesh',
      });
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusNotice(null);

    const result = await profileService.savePatientProfile(user?.id, profile);

    // Update active LocalStorage session for immediate header badge updates
    const savedSess = localStorage.getItem('healthos_session');
    if (savedSess) {
      try {
        const parsedSess = JSON.parse(savedSess);
        localStorage.setItem(
          'healthos_session',
          JSON.stringify({
            ...parsedSess,
            full_name: profile.full_name,
            email: profile.email,
            phone_number: profile.phone_number,
          })
        );
      } catch (_e) {
        // Fallback
      }
    }

    setSaving(false);

    if (result.dbSaved) {
      setStatusNotice({
        type: 'success',
        text: 'Emergency Medical Profile successfully stored in Supabase PostgreSQL database!',
      });
    } else {
      setStatusNotice({
        type: 'warning',
        text: `Profile saved locally. Note: Supabase database table needs schema update (${result.dbErrorMsg || 'column missing'}). Please run the provided SQL migration in Supabase SQL Editor to enable cloud storage.`,
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontWeight: 600 }}>
        Loading patient emergency medical profile...
      </div>
    );
  }

  return (
    <div className="patient-profile-container">
      {/* PROFILE HEADER */}
      <div className="profile-header-card">
        <div className="profile-avatar-row">
          <div className="profile-large-avatar">
            {(profile.full_name || profile.email || 'P').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Badge variant="info">PATIENT EMERGENCY PROFILE</Badge>
              <Badge variant="success">SOS AUTO-FILL ACTIVE</Badge>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {profile.full_name || 'Patient Profile'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.1rem' }}>
              {profile.email} {profile.address ? `• 📍 ${profile.address}` : ''}
            </p>
          </div>
        </div>

        <Button variant="primary" size="md" onClick={handleSubmit} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* STATUS NOTIFICATION */}
      {statusNotice && (
        <div
          className="sos-auto-sync-banner"
          style={{
            background: statusNotice.type === 'success' ? '#f0fdf4' : '#fffbeb',
            borderColor: statusNotice.type === 'success' ? '#bbf7d0' : '#fde68a',
            color: statusNotice.type === 'success' ? '#14532d' : '#92400e',
          }}
        >
          {statusNotice.type === 'success' ? (
            <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          )}
          <div>
            <strong>{statusNotice.type === 'success' ? 'Database Synced:' : 'Notice:'}</strong> {statusNotice.text}
          </div>
        </div>
      )}

      {/* SOS AUTO-FILL EXPLANATION CARD */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#0369a1' }}>
        <ShieldCheck size={22} style={{ flexShrink: 0, color: '#0284c7' }} />
        <div>
          <strong>Emergency SOS Integration:</strong> Data saved here is stored directly in the database and automatically forwarded when you trigger an Emergency SOS (`/patient/emergency`), ensuring responding ER doctors & hospitals receive your complete clinical profile instantly without any manual form filling.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SECTION 1: PERSONAL & DEMOGRAPHICS */}
        <div className="profile-section-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} style={{ color: '#0284c7' }} /> 1. Personal & Contact Information
          </h3>

          <div className="profile-grid-2col">
            <div className="form-group">
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                name="full_name"
                className="input-field"
                placeholder="e.g. Rajesh Kumar"
                value={profile.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Primary Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                className="input-field"
                placeholder="e.g. +91 98390 12345"
                value={profile.phone_number}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="profile-grid-3col">
            <div className="form-group">
              <label className="input-label">Age *</label>
              <input
                type="number"
                name="age"
                className="input-field"
                placeholder="e.g. 45"
                value={profile.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Gender</label>
              <select name="gender" className="input-field" value={profile.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Blood Group *</label>
              <select name="blood_group" className="input-field" value={profile.blood_group} onChange={handleChange}>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Primary Residential Address</label>
            <input
              type="text"
              name="address"
              className="input-field"
              placeholder="e.g. Civil Lines, Banda, Uttar Pradesh"
              value={profile.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* SECTION 2: EMERGENCY CONTACT INFORMATION */}
        <div className="profile-section-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} style={{ color: '#e11d48' }} /> 2. Emergency Contact Information
          </h3>

          <div className="profile-grid-3col">
            <div className="form-group">
              <label className="input-label">Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_contact_name"
                className="input-field"
                placeholder="Relative or next of kin"
                value={profile.emergency_contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Relationship</label>
              <input
                type="text"
                name="emergency_contact_relation"
                className="input-field"
                placeholder="e.g. Spouse, Father, Sibling"
                value={profile.emergency_contact_relation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Contact Phone Number</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                className="input-field"
                placeholder="+91 Emergency Phone"
                value={profile.emergency_contact_phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CLINICAL EMERGENCY DATA REQUIRED BY HOSPITALS */}
        <div className="profile-section-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: '#16a34a' }} /> 3. Clinical & Hospital Emergency Intake Data
          </h3>

          <div className="profile-grid-2col">
            <div className="form-group">
              <label className="input-label">Known Drug/Food Allergies</label>
              <input
                type="text"
                name="allergies"
                className="input-field"
                placeholder="e.g. Penicillin, Latex, Aspirin, None"
                value={profile.allergies}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Chronic Medical Conditions</label>
              <input
                type="text"
                name="conditions"
                className="input-field"
                placeholder="e.g. Diabetes Type 2, Hypertension, Asthma"
                value={profile.conditions}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Current Regular Medications</label>
            <input
              type="text"
              name="current_medications"
              className="input-field"
              placeholder="e.g. Metformin 500mg (Daily), Amlodipine 5mg"
              value={profile.current_medications}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ textAlign: 'right' }}>
          <Button variant="primary" size="lg" type="submit" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving Emergency Profile...' : 'Save Emergency Medical Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
