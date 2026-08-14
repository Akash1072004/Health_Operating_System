import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyHospitalService } from '../../services/emergencyHospitalService';
import { EMERGENCY_TYPES, EMERGENCY_STATUS_LABELS } from '../../types/emergency';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  AlertTriangle,
  Ambulance,
  Heart,
  RefreshCw,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import './HospitalEmergencyDashboard.css';

export function HospitalEmergencyDashboard() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);

  const hospitalId = 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6'; // Rani Durgavati Medical College
  const [verifStatus, setVerifStatus] = useState('VERIFIED'); // Default verified for demo college

  useEffect(() => {
    const savedVerif = localStorage.getItem(`healthos_verification_${hospitalId}`);
    if (savedVerif) {
      try {
        const parsed = JSON.parse(savedVerif);
        if (parsed.status) setVerifStatus(parsed.status);
      } catch (_e) {
        // Fallback
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await emergencyHospitalService.getHospitalEmergencies(hospitalId);
    setEmergencies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const unsubscribe = emergencyHospitalService.subscribeToHospitalEmergencies(hospitalId, () => {
      loadData();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAccept = async (emgId) => {
    await emergencyHospitalService.acceptEmergency(emgId, 'Rani Durgavati Medical College');
    setActiveAlert('Accepted emergency intake! ER Trauma Bay notified.');
    setTimeout(() => setActiveAlert(null), 3500);
    loadData();
  };

  const handleReject = async (emgId) => {
    await emergencyHospitalService.rejectEmergency(emgId, 'Rani Durgavati Medical College');
    setActiveAlert('Declined intake. System is re-matching next capable hospital.');
    setTimeout(() => setActiveAlert(null), 3500);
    loadData();
  };

  const renderVerificationBanner = () => {
    switch (verifStatus) {
      case 'VERIFIED':
        return (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} style={{ color: '#16a34a' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#14532d', fontSize: '0.95rem' }}>🟢 HealthOS Verified Facility</div>
                <div style={{ fontSize: '0.8rem', color: '#15803d' }}>Approved for trusted Emergency SOS routing, AI recommendations, and public hospital search.</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/hospital/verification')}>
              Verification Dossier <ArrowRight size={14} />
            </Button>
          </div>
        );
      case 'UNDER_REVIEW':
        return (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={24} style={{ color: '#ea580c' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.95rem' }}>🟠 Verification Under Regional Authority Review</div>
                <div style={{ fontSize: '0.8rem', color: '#c2410c' }}>Submitted credentials are being inspected by HealthOS Admin.</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/hospital/verification')}>
              View Application <ArrowRight size={14} />
            </Button>
          </div>
        );
      case 'REJECTED':
        return (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <XCircle size={24} style={{ color: '#dc2626' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>🔴 Verification Application Rejected</div>
                <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Information needs correction before emergency matching participation.</div>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => navigate('/hospital/verification')}>
              Correct & Resubmit <ArrowRight size={14} />
            </Button>
          </div>
        );
      case 'SUSPENDED':
        return (
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={24} style={{ color: '#475569' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>⚫ Hospital Verification Suspended</div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>Temporarily disabled from emergency matching network by HealthOS Authority.</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/hospital/verification')}>
              View Suspension Reason <ArrowRight size={14} />
            </Button>
          </div>
        );
      default:
        return (
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={24} style={{ color: '#ca8a04' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#854d0e', fontSize: '0.95rem' }}>🟡 Verification Pending</div>
                <div style={{ fontSize: '0.8rem', color: '#a16207' }}>Complete establishment verification to join trusted emergency matching network.</div>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/hospital/verification')}>
              Start Verification <ArrowRight size={14} />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="hospital-emergency-container">
      {/* HEADER */}
      <div className="hospital-emergency-header">
        <div>
          <Badge variant="danger">24/7 ER TRAUMA INTAKE DESK</Badge>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            Hospital Emergency Intake & Triage
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.15rem' }}>
            Live emergency requests matched to Rani Durgavati Medical College & District Hospital.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadData}>
          <RefreshCw size={14} /> Refresh Requests
        </Button>
      </div>

      {/* VERIFICATION STATUS BANNER */}
      {renderVerificationBanner()}

      {/* ALERT BANNER */}
      {activeAlert && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', color: '#14532d', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
          {activeAlert}
        </div>
      )}

      {/* EMERGENCY LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontWeight: 600 }}>
          Loading live hospital emergency intakes...
        </div>
      ) : emergencies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <ShieldAlert size={36} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No Active Emergency Intakes</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            No incoming emergency requests currently assigned to this hospital.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {emergencies.map((item) => (
            <Card key={item.id} className="emergency-intake-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div className="emergency-type-icon-box">
                    <Heart size={22} style={{ color: '#ef4444' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {item.emergency_type} Emergency
                      </h3>
                      <Badge variant="danger">{item.severity} SEVERITY</Badge>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                      Token: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.access_token}</span> • Received 5 mins ago
                    </p>
                  </div>
                </div>

                <Badge variant={item.status === 'ACCEPTED' ? 'success' : 'warning'}>
                  {EMERGENCY_STATUS_LABELS[item.status] || item.status}
                </Badge>
              </div>

              <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', display: 'grid', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Patient Info</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>
                    {item.guest_patient_name || 'Emergency Patient'} ({item.guest_patient_age || 42}y, {item.guest_patient_gender || 'M'})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact & Phone</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>
                    {item.guest_patient_phone || '+91 94150 99480'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Ambulance Status</div>
                  <div style={{ fontWeight: 700, color: '#0284c7', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Ambulance size={15} /> UP-90-AMB-108 (EN ROUTE)
                  </div>
                </div>
              </div>

              {item.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="danger" size="sm" onClick={() => handleReject(item.id)}>
                    <XCircle size={16} /> Decline Intake
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleAccept(item.id)}>
                    <CheckCircle2 size={16} /> Accept Emergency Intake
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
