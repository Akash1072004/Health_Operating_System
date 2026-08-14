import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emergencyService } from '../../services/emergencyService';
import { ambulanceService } from '../../services/ambulanceService';
import { EMERGENCY_TYPES, EMERGENCY_STATUS_LABELS, EMERGENCY_STATUS } from '../../types/emergency';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Ambulance,
  Hospital,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  XCircle,
  RefreshCw,
  ShieldCheck,
  User,
  Activity,
} from 'lucide-react';
import './EmergencyComponents.css';

export function EmergencyTrackingView({ identifier: propIdentifier }) {
  const params = useParams();
  const navigate = useNavigate();
  const identifier = propIdentifier || params.id || params.token;

  const [request, setRequest] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function loadEmergencyData() {
      if (!identifier) return;
      setLoading(true);

      const record = await emergencyService.getEmergencyByIdOrToken(identifier);
      if (record) {
        setRequest(record);
        const eventLogs = await emergencyService.getEmergencyEvents(record.id);
        setEvents(eventLogs);
      }
      setLoading(false);
    }

    loadEmergencyData();

    // Subscribe to realtime updates
    const unsubscribe = emergencyService.subscribeToEmergencyUpdates(identifier, (updated) => {
      setRequest((prev) => ({ ...prev, ...updated }));
      emergencyService.getEmergencyEvents(identifier).then(setEvents);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [identifier]);

  // Start ambulance simulation demo if status is AMBULANCE_ASSIGNED
  useEffect(() => {
    if (request && request.status === EMERGENCY_STATUS.AMBULANCE_ASSIGNED) {
      const stopSim = ambulanceService.startDemoDispatchSimulation(
        request.id,
        async (nextStatus, labelText) => {
          await emergencyService.updateEmergencyStatus(request.id, nextStatus, labelText);
          setRequest((prev) => ({ ...prev, status: nextStatus }));
          const updatedEvents = await emergencyService.getEmergencyEvents(request.id);
          setEvents(updatedEvents);
        }
      );

      return () => stopSim();
    }
  }, [request?.id, request?.status]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#64748b' }}>
        <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 0.5rem', color: '#0284c7' }} />
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Loading Emergency Tracking Dashboard...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
        <XCircle size={40} style={{ color: '#dc2626', margin: '0 auto 0.5rem' }} />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Emergency Record Not Found</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Invalid or expired emergency tracking token.
        </p>
        <Button variant="primary" size="md" style={{ marginTop: '1.25rem' }} onClick={() => navigate('/emergency')}>
          Return to Emergency Portal
        </Button>
      </div>
    );
  }

  const typeInfo = EMERGENCY_TYPES[request.emergency_type] || EMERGENCY_TYPES.OTHER;
  const isCancelled = request.status === EMERGENCY_STATUS.CANCELLED;
  const isCompleted = request.status === EMERGENCY_STATUS.COMPLETED || request.status === EMERGENCY_STATUS.HOSPITAL_ARRIVAL;

  const timelineSteps = [
    { key: EMERGENCY_STATUS.REQUESTED, title: 'Emergency Requested' },
    { key: EMERGENCY_STATUS.MATCHING_HOSPITAL, title: 'Matching Hospital' },
    { key: EMERGENCY_STATUS.HOSPITAL_ACCEPTED, title: 'Hospital Accepted' },
    { key: EMERGENCY_STATUS.AMBULANCE_DISPATCHED, title: 'Ambulance Dispatched' },
    { key: EMERGENCY_STATUS.AMBULANCE_ARRIVING, title: 'Ambulance Arriving' },
    { key: EMERGENCY_STATUS.PATIENT_PICKED_UP, title: 'Patient Picked Up' },
    { key: EMERGENCY_STATUS.HOSPITAL_ARRIVAL, title: 'Hospital Arrival' },
  ];

  const getStepStatusClass = (stepKey) => {
    const statusOrder = [
      EMERGENCY_STATUS.REQUESTED,
      EMERGENCY_STATUS.ASSESSING,
      EMERGENCY_STATUS.MATCHING_HOSPITAL,
      EMERGENCY_STATUS.HOSPITAL_SELECTED,
      EMERGENCY_STATUS.HOSPITAL_ACCEPTED,
      EMERGENCY_STATUS.AMBULANCE_REQUESTED,
      EMERGENCY_STATUS.AMBULANCE_ASSIGNED,
      EMERGENCY_STATUS.AMBULANCE_DISPATCHED,
      EMERGENCY_STATUS.AMBULANCE_ARRIVING,
      EMERGENCY_STATUS.PATIENT_PICKED_UP,
      EMERGENCY_STATUS.HOSPITAL_ARRIVAL,
      EMERGENCY_STATUS.COMPLETED,
    ];

    const currentIndex = statusOrder.indexOf(request.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  const handleCancelConfirm = async () => {
    await emergencyService.cancelEmergencyRequest(request.id, 'Patient/Guest requested cancellation');
    setRequest((prev) => ({ ...prev, status: EMERGENCY_STATUS.CANCELLED }));
    setShowCancelModal(false);
  };

  return (
    <div className="emergency-tracking-container">
      {/* HEADER BANNER */}
      <div className={`tracking-header-card ${isCancelled ? 'cancelled' : isCompleted ? 'completed' : 'active'}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="emergency-pill-badge danger">
              {isCancelled ? 'CANCELLED' : isCompleted ? 'HOSPITAL ARRIVAL' : '🚑 EMERGENCY ACTIVE'}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', color: '#0f172a' }}>
              {typeInfo.icon} {typeInfo.title}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.2rem' }}>
              Patient: <strong>{request.guest_patient_name || 'Patient'}</strong> ({request.guest_patient_age || 35} yrs, {request.guest_patient_gender || 'Male'})
            </p>
          </div>

          <Badge variant={request.severity === 'CRITICAL' ? 'danger' : 'warning'}>
            {request.severity} SEVERITY
          </Badge>
        </div>

        {/* STATUS BAR */}
        <div className="tracking-status-bar">
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Current Status:</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
            {EMERGENCY_STATUS_LABELS[request.status] || request.status}
          </div>
        </div>
      </div>

      {/* DEMOWARE NOTICE */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <span><strong>Demoware Simulation Mode:</strong> Realtime hospital matching & ambulance status updates are simulated for demonstration. Dial 108/112 for actual emergency dispatch.</span>
      </div>

      {/* TRACKING CARDS GRID */}
      <div className="tracking-grid-2col">
        {/* MATCHED HOSPITAL CARD */}
        <Card title="Matched Hospital Facility" subtitle="Capabilities & ER Bay Readiness">
          <div className="matched-hospital-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Hospital size={22} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                  Rani Durgavati Medical College & District Hospital
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                  📍 Kanpur Road, Banda, UP • <strong>2.4 km away</strong> (ETA: 8 mins)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700 }}>MATCHED CAPABILITIES</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>Emergency & Trauma, Cardiology, ICU</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700 }}>ER BAY STATUS</span>
                <Badge variant="success">READY FOR INTAKE</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* AMBULANCE DISPATCH CARD */}
        <Card title="Ambulance Fleet Status" subtitle="Vehicle Unit & Driver Details">
          <div className="ambulance-dispatch-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Ambulance size={24} style={{ color: '#e11d48' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>Unit UP-90-AMB-1081</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Driver: Ramesh Yadav (+91 98390 10810)</div>
                </div>
              </div>
              <span className="demo-badge">SIMULATED DEMO</span>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff1f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecdd3' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be123c' }}>REALTIME DISPATCH STATE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#881337', marginTop: '0.15rem' }}>
                {EMERGENCY_STATUS_LABELS[request.status] || 'Ambulance En Route'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* STEPPER TIMELINE */}
      <Card title="Emergency Response Timeline" subtitle="Live automated coordination stages">
        <div className="stepper-timeline">
          {timelineSteps.map((step, idx) => {
            const statusClass = getStepStatusClass(step.key);
            return (
              <div key={idx} className={`stepper-step ${statusClass}`}>
                <div className="step-circle">{idx + 1}</div>
                <div className="step-label">{step.title}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AUDIT EVENT LOG LIST */}
      <Card title="Event History Log" subtitle="Detailed timestamped coordination logs">
        <div className="event-log-list">
          {events.map((ev, idx) => (
            <div key={ev.id || idx} className="event-log-item">
              <div className="event-time">
                {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="event-desc">{ev.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* CANCELLATION BUTTON */}
      {!isCancelled && !isCompleted && (
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <Button variant="danger" size="md" onClick={() => setShowCancelModal(true)}>
            Cancel Emergency Assistance Request
          </Button>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="modal-backdrop-overlay">
          <div className="modal-content-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b' }}>Cancel Emergency Request?</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Are you sure you want to cancel emergency assistance? The assigned hospital and ambulance dispatch will be notified immediately.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button variant="secondary" size="md" onClick={() => setShowCancelModal(false)}>
                Keep Active
              </Button>
              <Button variant="danger" size="md" onClick={handleCancelConfirm}>
                Yes, Cancel Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
