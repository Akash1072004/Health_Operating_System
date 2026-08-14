import React from 'react';
import { EMERGENCY_TYPES } from '../../types/emergency';
import { EmergencyLocation } from './EmergencyLocation';
import { Button } from '../ui/Button';
import { AlertTriangle, ShieldCheck, PhoneCall } from 'lucide-react';
import './EmergencyComponents.css';

export function EmergencyConfirmation({
  emergencyTypeId,
  userProfile,
  locationData,
  onLocationCaptured,
  onConfirm,
  onCancel,
}) {
  const option = EMERGENCY_TYPES[emergencyTypeId] || EMERGENCY_TYPES.OTHER;
  const isRegistered = !!userProfile;

  return (
    <div className="emergency-confirmation-card">
      <div className="emergency-header-badge-row">
        <span className="emergency-pill-badge danger">🚨 CONFIRM EMERGENCY ASSISTANCE</span>
        <span className="urgency-tag tag-critical">{option.defaultSeverity} PRIORITY</span>
      </div>

      <div className="selected-emergency-summary">
        <div style={{ fontSize: '2.5rem' }}>{option.icon}</div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{option.title}</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.15rem' }}>{option.description}</p>
        </div>
      </div>

      {/* LOCATION SECTION */}
      <EmergencyLocation
        onLocationCaptured={onLocationCaptured}
        initialAddress={locationData?.address_text || 'Banda, Uttar Pradesh'}
      />

      {/* REGISTERED USER PROFILE NOTICE */}
      {isRegistered ? (
        <div className="profile-found-notice">
          <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, color: '#14532d', fontSize: '0.9rem' }}>
              Your HealthOS profile was found.
            </div>
            <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.1rem' }}>
              Patient: <strong>{userProfile.full_name || 'Registered Patient'}</strong> • Phone: {userProfile.phone || userProfile.phone_number || '+91 94150 00000'}
            </div>
          </div>
        </div>
      ) : (
        <div className="guest-notice-box">
          <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.85rem' }}>
            ℹ️ Unregistered Guest Mode
          </div>
          <div style={{ fontSize: '0.775rem', color: '#0c4a6e', marginTop: '0.15rem' }}>
            You do not need to create an account. A minimal 4-field form will collect only essential intake details.
          </div>
        </div>
      )}

      {/* SAFETY NOTICE */}
      <div className="safety-disclaimer-box">
        <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
        <div>
          <strong>Demoware Emergency Coordination Notice:</strong> HealthOS emergency matching coordinates capable hospital intake. For immediate life support or regional hotline, dial <strong>108 / 112</strong>.
        </div>
      </div>

      {/* PRIMARY & SECONDARY CONFIRMATION BUTTONS */}
      <div className="confirmation-actions-row">
        <Button variant="emergency" size="lg" style={{ flex: 1 }} onClick={onConfirm}>
          <PhoneCall size={20} /> GET EMERGENCY HELP
        </Button>
        <Button variant="secondary" size="lg" onClick={onCancel}>
          CANCEL
        </Button>
      </div>
    </div>
  );
}
