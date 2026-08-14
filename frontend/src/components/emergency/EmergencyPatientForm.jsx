import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { User, Phone, Heart, Activity, AlertCircle, ShieldAlert } from 'lucide-react';
import './EmergencyComponents.css';

export function EmergencyPatientForm({ onSubmit, onCancel, defaultLocation }) {
  const [formData, setFormData] = useState({
    guest_patient_name: '',
    guest_patient_age: '',
    guest_patient_gender: 'Male',
    guest_patient_phone: '',
    guest_emergency_contact_name: '',
    guest_emergency_contact_phone: '',
    is_conscious: true,
    is_breathing_normally: true,
    known_allergies: '',
    known_conditions: '',
    blood_group: 'O+',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.guest_patient_name.trim()) {
      newErrors.guest_patient_name = 'Full Name is required for emergency intake.';
    }
    if (!formData.guest_patient_age || parseInt(formData.guest_patient_age, 10) <= 0) {
      newErrors.guest_patient_age = 'Valid age is required.';
    }
    if (!formData.guest_patient_phone.trim()) {
      newErrors.guest_patient_phone = 'Contact Phone Number is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="guest-emergency-form-card">
      <div className="form-header">
        <span className="emergency-pill-badge danger">MINIMAL GUEST INTAKE</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
          Patient Emergency Information
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.15rem' }}>
          No account registration required. Please enter essential details for hospital matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="guest-form-body">
        {/* REQUIRED FIELDS SECTION */}
        <div className="form-grid-2col">
          <div className="form-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              name="guest_patient_name"
              className={`input-field ${errors.guest_patient_name ? 'error' : ''}`}
              placeholder="e.g. Rajesh Kumar"
              value={formData.guest_patient_name}
              onChange={handleChange}
            />
            {errors.guest_patient_name && <span className="field-error-text">{errors.guest_patient_name}</span>}
          </div>

          <div className="form-group">
            <label className="input-label">Phone Number *</label>
            <input
              type="tel"
              name="guest_patient_phone"
              className={`input-field ${errors.guest_patient_phone ? 'error' : ''}`}
              placeholder="e.g. +91 98390 12345"
              value={formData.guest_patient_phone}
              onChange={handleChange}
            />
            {errors.guest_patient_phone && <span className="field-error-text">{errors.guest_patient_phone}</span>}
          </div>
        </div>

        <div className="form-grid-3col">
          <div className="form-group">
            <label className="input-label">Age *</label>
            <input
              type="number"
              name="guest_patient_age"
              className={`input-field ${errors.guest_patient_age ? 'error' : ''}`}
              placeholder="e.g. 45"
              value={formData.guest_patient_age}
              onChange={handleChange}
            />
            {errors.guest_patient_age && <span className="field-error-text">{errors.guest_patient_age}</span>}
          </div>

          <div className="form-group">
            <label className="input-label">Gender</label>
            <select
              name="guest_patient_gender"
              className="input-field"
              value={formData.guest_patient_gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Blood Group (Optional)</label>
            <select
              name="blood_group"
              className="input-field"
              value={formData.blood_group}
              onChange={handleChange}
            >
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

        {/* CLINICAL STATUS CHECKBOXES */}
        <div className="checkboxes-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_conscious"
              checked={formData.is_conscious}
              onChange={handleChange}
            />
            <span>Is the patient conscious?</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_breathing_normally"
              checked={formData.is_breathing_normally}
              onChange={handleChange}
            />
            <span>Is the patient breathing normally?</span>
          </label>
        </div>

        {/* OPTIONAL MEDICAL INFORMATION */}
        <div className="form-grid-2col" style={{ marginTop: '0.75rem' }}>
          <div className="form-group">
            <label className="input-label">Known Allergies (Optional)</label>
            <input
              type="text"
              name="known_allergies"
              className="input-field"
              placeholder="e.g. Penicillin, Latex, None"
              value={formData.known_allergies}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Known Conditions (Optional)</label>
            <input
              type="text"
              name="known_conditions"
              className="input-field"
              placeholder="e.g. Hypertension, Diabetes, Asthma"
              value={formData.known_conditions}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* EMERGENCY CONTACT (OPTIONAL) */}
        <div className="form-grid-2col">
          <div className="form-group">
            <label className="input-label">Emergency Contact Name (Optional)</label>
            <input
              type="text"
              name="guest_emergency_contact_name"
              className="input-field"
              placeholder="Relative or bystander name"
              value={formData.guest_emergency_contact_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Emergency Contact Phone (Optional)</label>
            <input
              type="tel"
              name="guest_emergency_contact_phone"
              className="input-field"
              placeholder="+91 Phone number"
              value={formData.guest_emergency_contact_phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="form-actions-row">
          <Button variant="emergency" size="lg" type="submit" style={{ flex: 1 }}>
            <ShieldAlert size={20} /> SUBMIT EMERGENCY ASSISTANCE REQUEST
          </Button>
          <Button variant="secondary" size="lg" type="button" onClick={onCancel}>
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  );
}
