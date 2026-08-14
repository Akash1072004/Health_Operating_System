import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { hospitalVerificationService } from '../../services/hospitalVerificationService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Building2,
  FileCheck,
  ShieldCheck,
  UploadCloud,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import './HospitalVerificationForm.css';

export function HospitalVerificationForm({ hospitalId }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  const [status, setStatus] = useState('PENDING'); // PENDING, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED
  const [healthosId, setHealthosId] = useState('');

  const [formData, setFormData] = useState({
    legalName: user?.full_name || '',
    displayName: user?.full_name || '',
    hospitalType: 'Government Hospital',
    ownershipType: 'Government',
    address: 'Kanpur Road, Banda, Uttar Pradesh',
    city: 'Banda',
    district: 'Banda',
    state: 'Uttar Pradesh',
    pincode: '210001',
    country: 'India',
    officialPhone: '+91 94150 12345',
    officialEmail: user?.email || 'admin@hospital.org.in',
    registrationNumber: '',
    registrationAuthority: 'State Medical Council Uttar Pradesh',
    registrationState: 'Uttar Pradesh',
    registrationDate: '',
    registrationExpiryDate: '',
    abdmFacilityId: '',
    repName: '',
    repDesignation: 'Hospital Administrator',
    repPhone: '',
    repEmail: '',
    repRole: 'AUTHORIZED_REPRESENTATIVE',
  });

  const [files, setFiles] = useState({
    registrationCertificate: null,
    authorizationDocument: null,
  });

  useEffect(() => {
    // Check existing application state
    const saved = localStorage.getItem(`healthos_verification_${hospitalId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.status) setStatus(parsed.status);
        if (parsed.healthos_hospital_id) setHealthosId(parsed.healthos_hospital_id);
        if (parsed.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }));
      } catch (_e) {
        // Fallback
      }
    }
  }, [hospitalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDuplicateAlert(null);
  };

  const handleFileChange = (e, key) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [key]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setDuplicateAlert(null);
    setSuccessNotice(null);
    setErrorNotice(null);

    try {
      const app = await hospitalVerificationService.submitVerificationApplication(
        hospitalId,
        formData,
        files,
        user?.id
      );

      setStatus('UNDER_REVIEW');
      setHealthosId(app.healthos_hospital_id);
      setSuccessNotice('Hospital Verification Application submitted to HealthOS Regional Authority. Status updated to UNDER REVIEW.');
    } catch (err) {
      if (err.message && err.message.includes('already registered')) {
        setDuplicateAlert(err.message);
      } else {
        setErrorNotice(err.message || 'Verification submission failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'VERIFIED':
        return <div className="verif-status-badge-lg status-verified"><ShieldCheck size={20} /> 🟢 HealthOS Verified</div>;
      case 'UNDER_REVIEW':
        return <div className="verif-status-badge-lg status-under-review"><Clock size={20} /> 🟠 Verification Under Review</div>;
      case 'REJECTED':
        return <div className="verif-status-badge-lg status-rejected"><XCircle size={20} /> 🔴 Verification Rejected</div>;
      case 'SUSPENDED':
        return <div className="verif-status-badge-lg status-suspended"><Lock size={20} /> ⚫ Hospital Suspended</div>;
      default:
        return <div className="verif-status-badge-lg status-pending"><AlertTriangle size={20} /> 🟡 Verification Pending</div>;
    }
  };

  return (
    <div className="hospital-verif-container">
      {/* STATUS CARD */}
      <div className="verif-status-card">
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            HealthOS Hospital Verification
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
            {formData.legalName || 'Hospital Verification Portal'}
          </h2>
          {healthosId && (
            <p style={{ color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>
              INTERNAL HEALTHOS ID: {healthosId}
            </p>
          )}
        </div>
        {renderStatusBadge()}
      </div>

      {/* SUCCESS / ERROR NOTICES */}
      {successNotice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} /> {successNotice}
        </div>
      )}

      {duplicateAlert && (
        <div className="duplicate-alert-banner">
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Potential Duplicate Hospital Detected:</strong> {duplicateAlert}
          </div>
        </div>
      )}

      {errorNotice && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {errorNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SECTION 1: HOSPITAL INFORMATION */}
        <div className="verif-form-section">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: '#0284c7' }} /> 1. Hospital General & Contact Information
          </h3>

          <div className="verif-grid-2col">
            <div className="form-group">
              <label className="input-label">Legal Hospital Name *</label>
              <input
                type="text"
                name="legalName"
                className="input-field"
                value={formData.legalName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Hospital Type *</label>
              <select name="hospitalType" className="input-field" value={formData.hospitalType} onChange={handleChange}>
                <option value="Government Hospital">Government Medical College / Sadar Hospital</option>
                <option value="Super Specialty">Super Specialty Care Center</option>
                <option value="Private Nursing Home">Private Nursing Home / Clinic</option>
                <option value="Trust Hospital">Charitable Trust Hospital</option>
              </select>
            </div>
          </div>

          <div className="verif-grid-3col">
            <div className="form-group">
              <label className="input-label">Official Hospital Phone *</label>
              <input
                type="tel"
                name="officialPhone"
                className="input-field"
                value={formData.officialPhone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Official Hospital Email *</label>
              <input
                type="email"
                name="officialEmail"
                className="input-field"
                value={formData.officialEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Ownership Type</label>
              <select name="ownershipType" className="input-field" value={formData.ownershipType} onChange={handleChange}>
                <option value="Government">Government / Public Entity</option>
                <option value="Private">Private Proprietorship / Partnership</option>
                <option value="Corporate">Corporate Healthcare Network</option>
                <option value="Trust">Registered NGO / Charitable Trust</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Complete Physical Establishment Address *</label>
            <input
              type="text"
              name="address"
              className="input-field"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* SECTION 2: REGISTRATION & ABDM FACILITY INFORMATION */}
        <div className="verif-form-section">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={18} style={{ color: '#16a34a' }} /> 2. Establishment Registration & ABDM Facility ID
          </h3>

          <div className="verif-grid-2col">
            <div className="form-group">
              <label className="input-label">Clinical Establishment Registration Number *</label>
              <input
                type="text"
                name="registrationNumber"
                className="input-field"
                placeholder="e.g. UP-MED-BDA-9948"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Registration Authority *</label>
              <input
                type="text"
                name="registrationAuthority"
                className="input-field"
                value={formData.registrationAuthority}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="verif-grid-3col">
            <div className="form-group">
              <label className="input-label">Registration State</label>
              <input
                type="text"
                name="registrationState"
                className="input-field"
                value={formData.registrationState}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Registration Expiry Date</label>
              <input
                type="date"
                name="registrationExpiryDate"
                className="input-field"
                value={formData.registrationExpiryDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">ABDM HFR / Facility ID (Optional)</label>
              <input
                type="text"
                name="abdmFacilityId"
                className="input-field"
                placeholder="e.g. IN0910023410"
                value={formData.abdmFacilityId}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: OFFICIAL REGISTRATION DOCUMENT UPLOADS */}
        <div className="verif-form-section">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={18} style={{ color: '#0284c7' }} /> 3. Official Document Verification (Private Storage)
          </h3>

          <div className="verif-grid-2col">
            <div className="form-group">
              <label className="input-label">Official Hospital Registration Certificate (PDF/PNG/JPG) *</label>
              <div className="file-upload-dropzone" onClick={() => document.getElementById('regDocInput').click()}>
                <FileText size={24} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  {files.registrationCertificate ? files.registrationCertificate.name : 'Click to select Registration Certificate'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Stored in private encrypted bucket</div>
              </div>
              <input
                id="regDocInput"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e, 'registrationCertificate')}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Authorized Representative Proof / Letter (PDF/PNG/JPG) *</label>
              <div className="file-upload-dropzone" onClick={() => document.getElementById('authDocInput').click()}>
                <FileText size={24} style={{ color: '#16a34a', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  {files.authorizationDocument ? files.authorizationDocument.name : 'Click to select Authorization Letter'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Stored in private encrypted bucket</div>
              </div>
              <input
                id="authDocInput"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e, 'authorizationDocument')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: AUTHORIZED REPRESENTATIVE */}
        <div className="verif-form-section">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} style={{ color: '#e11d48' }} /> 4. Authorized Representative Information
          </h3>

          <div className="verif-grid-2col">
            <div className="form-group">
              <label className="input-label">Representative Full Name *</label>
              <input
                type="text"
                name="repName"
                className="input-field"
                placeholder="e.g. Dr. Rajesh Verma"
                value={formData.repName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Designation / Title *</label>
              <input
                type="text"
                name="repDesignation"
                className="input-field"
                placeholder="e.g. Medical Superintendent / Director"
                value={formData.repDesignation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="verif-grid-3col">
            <div className="form-group">
              <label className="input-label">Representative Mobile Number *</label>
              <input
                type="tel"
                name="repPhone"
                className="input-field"
                placeholder="+91 Mobile"
                value={formData.repPhone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Official Email *</label>
              <input
                type="email"
                name="repEmail"
                className="input-field"
                placeholder="official@hospital.org"
                value={formData.repEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Relationship to Hospital</label>
              <select name="repRole" className="input-field" value={formData.repRole} onChange={handleChange}>
                <option value="OWNER">Hospital Owner / Trustee</option>
                <option value="DIRECTOR">Medical Director</option>
                <option value="HOSPITAL_ADMINISTRATOR">Hospital Administrator</option>
                <option value="AUTHORIZED_REPRESENTATIVE">Authorized Representative</option>
              </select>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ textAlign: 'right' }}>
          <Button variant="primary" size="lg" type="submit" disabled={submitting || status === 'VERIFIED'}>
            <ShieldCheck size={18} /> {submitting ? 'Submitting Application...' : status === 'VERIFIED' ? 'Hospital Verified' : 'Submit Verification Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
