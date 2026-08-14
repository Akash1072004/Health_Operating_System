import React from 'react';
import { EMERGENCY_TYPES } from '../../types/emergency';
import './EmergencyComponents.css';

export function EmergencyTypeSelector({ selectedType, onSelectType }) {
  const optionsList = Object.values(EMERGENCY_TYPES);

  return (
    <div className="emergency-type-container">
      <div className="emergency-type-header">
        <span className="emergency-pill-badge">🚨 EMERGENCY TRIAGE</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
          What is happening?
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Tap a condition to calculate urgency level and match with the nearest capable hospital.
        </p>
      </div>

      <div className="emergency-options-grid">
        {optionsList.map((option) => {
          const isSelected = selectedType === option.id;
          const isCritical = option.defaultSeverity === 'CRITICAL';

          return (
            <div
              key={option.id}
              className={`emergency-card-item ${isSelected ? 'selected' : ''} ${isCritical ? 'critical-border' : ''}`}
              onClick={() => onSelectType(option.id)}
            >
              <div className="emergency-card-icon">{option.icon}</div>
              <div className="emergency-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 className="emergency-card-title">{option.title}</h4>
                  <span className={`urgency-tag ${isCritical ? 'tag-critical' : 'tag-high'}`}>
                    {option.defaultSeverity}
                  </span>
                </div>
                <p className="emergency-card-desc">{option.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
