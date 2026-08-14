import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { emergencyService } from '../../services/emergencyService';
import { EmergencyTypeSelector } from '../../components/emergency/EmergencyTypeSelector';
import { EmergencyConfirmation } from '../../components/emergency/EmergencyConfirmation';
import { EmergencyPatientForm } from '../../components/emergency/EmergencyPatientForm';
import { EmergencyTrackingView } from '../../components/emergency/EmergencyTrackingView';
import { AlertTriangle } from 'lucide-react';
import './EmergencyPublicPage.css';

export function EmergencyPublicPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Workflow Steps: 'SELECT' -> 'CONFIRM' -> 'GUEST_FORM' -> 'TRACKING'
  const [step, setStep] = useState('SELECT');
  const [selectedType, setSelectedType] = useState(null);
  const [locationData, setLocationData] = useState({ latitude: 25.4850, longitude: 80.3400, address_text: 'Banda, Uttar Pradesh' });
  const [activeRequest, setActiveRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
    setStep('CONFIRM');
  };

  const handleConfirmHelp = async () => {
    if (isAuthenticated) {
      // Registered User Flow: Auto-load user profile and create request
      setIsSubmitting(true);
      const userProfile = {
        id: user?.id,
        full_name: user?.full_name || user?.email?.split('@')[0] || 'Registered Patient',
        phone: user?.phone_number || '+91 94150 00000',
        allergies: 'None Reported',
        conditions: 'None Reported',
        blood_group: 'O+',
      };

      const record = await emergencyService.createEmergencyRequest(
        { emergency_type: selectedType, ...locationData },
        userProfile
      );

      setActiveRequest(record);
      setIsSubmitting(false);
      setStep('TRACKING');
    } else {
      // Unregistered Guest Flow: Show minimal intake form
      setStep('GUEST_FORM');
    }
  };

  const handleGuestSubmit = async (guestFormData) => {
    setIsSubmitting(true);
    const record = await emergencyService.createEmergencyRequest({
      emergency_type: selectedType,
      ...locationData,
      ...guestFormData,
    });

    setActiveRequest(record);
    setIsSubmitting(false);
    setStep('TRACKING');
  };

  return (
    <div className="emergency-page-container">
      {/* DEMOWARE SAFETY BANNER */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#92400e', maxWidth: '850px', margin: '0 auto' }}>
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>HealthOS Demoware Emergency System:</strong> For actual life-threatening emergencies requiring national medical dispatch, dial <strong>108 / 112</strong> immediately.
        </div>
      </div>

      {step === 'SELECT' && (
        <EmergencyTypeSelector
          selectedType={selectedType}
          onSelectType={handleSelectType}
        />
      )}

      {step === 'CONFIRM' && (
        <EmergencyConfirmation
          emergencyTypeId={selectedType}
          userProfile={isAuthenticated ? user : null}
          locationData={locationData}
          onLocationCaptured={setLocationData}
          onConfirm={handleConfirmHelp}
          onCancel={() => setStep('SELECT')}
        />
      )}

      {step === 'GUEST_FORM' && (
        <EmergencyPatientForm
          onSubmit={handleGuestSubmit}
          onCancel={() => setStep('CONFIRM')}
          defaultLocation={locationData}
        />
      )}

      {step === 'TRACKING' && activeRequest && (
        <EmergencyTrackingView identifier={activeRequest.access_token || activeRequest.id} />
      )}
    </div>
  );
}
