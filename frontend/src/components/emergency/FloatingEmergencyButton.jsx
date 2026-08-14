import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Siren } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { ROLES } from '../../types/roles';
import './FloatingEmergencyButton.css';

export function FloatingEmergencyButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  // Hide on active emergency pages or hospital ER dashboard
  const path = location.pathname;
  if (
    path.startsWith('/emergency') ||
    path.startsWith('/patient/emergency') ||
    path.startsWith('/hospital/emergency')
  ) {
    return null;
  }

  const handleSosClick = () => {
    if (role === ROLES.PATIENT) {
      navigate('/patient/emergency');
    } else {
      navigate('/emergency');
    }
  };

  return (
    <div className="floating-sos-container">
      <button className="floating-sos-btn" onClick={handleSosClick} title="Trigger Emergency SOS Triage">
        <div className="floating-sos-icon-wrap">
          <Siren size={18} />
        </div>
        <span>EMERGENCY SOS</span>
      </button>
    </div>
  );
}
