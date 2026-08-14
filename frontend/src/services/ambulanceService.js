import { supabase } from '../lib/supabase/client';
import { EMERGENCY_STATUS } from '../types/emergency';

/**
 * Ambulance Dispatch & Management Service
 * Supports live Supabase ambulance fleet and simulated demo dispatch progression mode.
 */
export const ambulanceService = {
  /**
   * Finds or assigns an ambulance for a matched hospital emergency.
   */
  async assignAmbulance(emergencyRequestId, hospitalId) {
    let assignedAmbulance = {
      id: 'amb-demo-1081',
      vehicle_number: 'UP-90-AMB-1081',
      driver_name: 'Ramesh Yadav',
      driver_phone: '+91 98390 10810',
      status: 'ASSIGNED',
      is_simulated_demo: true,
    };

    try {
      // Query database for real available ambulance
      const { data, error } = await supabase
        .from('ambulances')
        .select('*')
        .eq('hospital_id', hospitalId)
        .eq('status', 'AVAILABLE')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        assignedAmbulance = {
          ...data,
          is_simulated_demo: false,
        };

        // Mark ambulance assigned in DB
        await supabase
          .from('ambulances')
          .update({ status: 'ASSIGNED' })
          .eq('id', data.id);
      }
    } catch (_err) {
      // Demo fallback
    }

    return assignedAmbulance;
  },

  /**
   * Simulated Demo Dispatch progression loop.
   * Progresses status through:
   * AMBULANCE_ASSIGNED -> AMBULANCE_DISPATCHED -> AMBULANCE_ARRIVING -> PATIENT_PICKED_UP -> HOSPITAL_ARRIVAL
   */
  startDemoDispatchSimulation(emergencyRequestId, onStatusUpdate) {
    const steps = [
      { status: EMERGENCY_STATUS.AMBULANCE_DISPATCHED, delayMs: 4000, label: 'Ambulance Unit Dispatched (Simulated Demo)' },
      { status: EMERGENCY_STATUS.AMBULANCE_ARRIVING, delayMs: 9000, label: 'Ambulance is Arriving on Scene (Simulated Demo)' },
      { status: EMERGENCY_STATUS.PATIENT_PICKED_UP, delayMs: 16000, label: 'Patient Picked Up & En Route to Hospital' },
      { status: EMERGENCY_STATUS.HOSPITAL_ARRIVAL, delayMs: 24000, label: 'Arrived at Hospital ER Trauma Bay' },
    ];

    const timeouts = [];

    steps.forEach(({ status, delayMs, label }) => {
      const timer = setTimeout(() => {
        if (onStatusUpdate) {
          onStatusUpdate(status, label);
        }
      }, delayMs);
      timeouts.push(timer);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  },
};
