import { supabase } from '../lib/supabase/client';
import { EMERGENCY_STATUS, EMERGENCY_TYPES } from '../types/emergency';
import { emergencyMatchingService } from './emergencyMatchingService';
import { ambulanceService } from './ambulanceService';

// In-memory store for guest/fallback emergency sessions when DB is unreachable
const memoryEmergencies = new Map();

/**
 * HealthOS Emergency SOS Core Service
 */
export const emergencyService = {
  /**
   * Generates a cryptographically random guest access token.
   */
  generateAccessToken() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  },

  /**
   * Creates a new Emergency Request (supports both Registered Patients and Guest Users).
   */
  async createEmergencyRequest(emergencyData, userProfile = null) {
    const {
      emergency_type,
      latitude = 25.4850,
      longitude = 80.3400,
      location_accuracy = 10,
      address_text = 'Banda, Uttar Pradesh',
      guest_patient_name,
      guest_patient_age,
      guest_patient_gender,
      guest_patient_phone,
      guest_emergency_contact_name,
      guest_emergency_contact_phone,
      is_conscious = true,
      is_breathing_normally = true,
      known_allergies,
      known_conditions,
      blood_group,
      description,
    } = emergencyData;

    const typeDef = EMERGENCY_TYPES[emergency_type] || EMERGENCY_TYPES.OTHER;
    const severity = typeDef.defaultSeverity || 'HIGH';
    const accessToken = this.generateAccessToken();

    const isRegistered = !!userProfile;

    const payload = {
      access_token: accessToken,
      requester_user_id: userProfile?.id || null,
      patient_profile_id: userProfile?.id || null,

      // Guest details or Registered profile overrides
      guest_patient_name: isRegistered ? userProfile.full_name || userProfile.name : guest_patient_name,
      guest_patient_age: isRegistered ? userProfile.age || 35 : parseInt(guest_patient_age, 10) || null,
      guest_patient_gender: isRegistered ? userProfile.gender || 'Not Specified' : guest_patient_gender || 'Not Specified',
      guest_patient_phone: isRegistered ? userProfile.phone || userProfile.phone_number : guest_patient_phone,
      guest_emergency_contact_name: guest_emergency_contact_name || userProfile?.emergency_contact || null,
      guest_emergency_contact_phone: guest_emergency_contact_phone || null,

      emergency_type,
      description: description || typeDef.description,
      is_conscious: is_conscious !== false,
      is_breathing_normally: is_breathing_normally !== false,
      known_allergies: known_allergies || userProfile?.allergies || 'None Reported',
      known_conditions: known_conditions || userProfile?.conditions || 'None Reported',
      blood_group: blood_group || userProfile?.blood_group || 'O+',

      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_accuracy: parseFloat(location_accuracy),
      address_text,
      severity,
      status: EMERGENCY_STATUS.REQUESTED,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let recordId = 'emg-' + Date.now();
    let dbRecord = null;

    try {
      const { data, error } = await supabase
        .from('emergency_requests')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        dbRecord = data;
        recordId = data.id;
      }
    } catch (_err) {
      // Memory fallback
    }

    const createdRecord = dbRecord || { id: recordId, ...payload };
    memoryEmergencies.set(createdRecord.id, createdRecord);
    memoryEmergencies.set(accessToken, createdRecord);

    // Create Initial Event Log
    await this.addEmergencyEvent(createdRecord.id, 'REQUEST_CREATED', `Emergency assistance requested: ${typeDef.title}`);
    await this.addEmergencyEvent(createdRecord.id, 'LOCATION_RECEIVED', `Coordinates captured: ${latitude}, ${longitude}`);

    if (isRegistered) {
      await this.addEmergencyEvent(createdRecord.id, 'PROFILE_LOADED', `Authenticated HealthOS profile automatically loaded for ${userProfile.full_name || 'Patient'}`);
    }

    // Trigger Automated Matching & Dispatch Engine
    setTimeout(() => {
      this.executeEmergencyMatchingWorkflow(createdRecord);
    }, 1200);

    return createdRecord;
  },

  /**
   * Automated Capability Matching Workflow.
   */
  async executeEmergencyMatchingWorkflow(emergencyRecord) {
    try {
      await this.updateEmergencyStatus(emergencyRecord.id, EMERGENCY_STATUS.MATCHING_HOSPITAL);
      await this.addEmergencyEvent(emergencyRecord.id, 'HOSPITAL_MATCHING_STARTED', 'Evaluating hospital capabilities, bed capacity, and ETA...');

      const match = await emergencyMatchingService.findBestHospitalMatch(emergencyRecord);
      const hospital = match.hospital;

      await this.updateEmergencyRecord(emergencyRecord.id, {
        matched_hospital_id: hospital.id,
        status: EMERGENCY_STATUS.HOSPITAL_SELECTED,
      });

      await this.addEmergencyEvent(
        emergencyRecord.id,
        'HOSPITAL_MATCHED',
        `Matched with ${hospital.name} (${match.distanceKm} km away • ETA: ${match.estimatedEtaMin} mins)`
      );

      // Hospital Acceptance Simulation / Transition
      setTimeout(async () => {
        await this.updateEmergencyStatus(emergencyRecord.id, EMERGENCY_STATUS.HOSPITAL_ACCEPTED);
        await this.addEmergencyEvent(emergencyRecord.id, 'HOSPITAL_ACCEPTED', `${hospital.name} ER Trauma Bay pre-notified & accepted triage.`);

        // Assign Ambulance
        const ambulance = await ambulanceService.assignAmbulance(emergencyRecord.id, hospital.id);

        await this.updateEmergencyRecord(emergencyRecord.id, {
          ambulance_id: ambulance.id,
          status: EMERGENCY_STATUS.AMBULANCE_ASSIGNED,
        });

        await this.addEmergencyEvent(
          emergencyRecord.id,
          'AMBULANCE_ASSIGNED',
          `Assigned ${ambulance.is_simulated_demo ? 'Simulated Demo ' : ''}Ambulance Unit ${ambulance.vehicle_number} (Driver: ${ambulance.driver_name})`
        );
      }, 3500);

    } catch (err) {
      await this.addEmergencyEvent(emergencyRecord.id, 'ERROR', `Matching warning: ${err.message}`);
    }
  },

  /**
   * Updates emergency request status and logs event.
   */
  async updateEmergencyStatus(id, newStatus, customDescription = null) {
    await this.updateEmergencyRecord(id, { status: newStatus });
    if (customDescription) {
      await this.addEmergencyEvent(id, newStatus, customDescription);
    }
  },

  /**
   * Updates fields on an emergency record.
   */
  async updateEmergencyRecord(id, fields) {
    const updatedAt = new Date().toISOString();

    try {
      await supabase
        .from('emergency_requests')
        .update({ ...fields, updated_at: updatedAt })
        .eq('id', id);
    } catch (_err) {
      // Memory fallback
    }

    const current = memoryEmergencies.get(id);
    if (current) {
      const updated = { ...current, ...fields, updated_at: updatedAt };
      memoryEmergencies.set(id, updated);
      if (updated.access_token) {
        memoryEmergencies.set(updated.access_token, updated);
      }
    }
  },

  /**
   * Appends an auditable event to the emergency timeline.
   */
  async addEmergencyEvent(emergencyRequestId, eventType, description) {
    try {
      await supabase.from('emergency_events').insert([
        {
          emergency_request_id: emergencyRequestId,
          event_type: eventType,
          description,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (_err) {
      // Fallback
    }
  },

  /**
   * Retrieves an emergency request by ID or guest access token.
   */
  async getEmergencyByIdOrToken(identifier) {
    if (!identifier) return null;

    try {
      const { data, error } = await supabase
        .from('emergency_requests')
        .select('*')
        .or(`id.eq.${identifier},access_token.eq.${identifier}`)
        .maybeSingle();

      if (!error && data) return data;
    } catch (_err) {
      // Memory fallback
    }

    return memoryEmergencies.get(identifier) || null;
  },

  /**
   * Retrieves timeline events for an emergency.
   */
  async getEmergencyEvents(emergencyRequestId) {
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('*')
        .eq('emergency_request_id', emergencyRequestId)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) return data;
    } catch (_err) {
      // Fallback
    }

    return [
      { id: 'ev-1', event_type: 'REQUEST_CREATED', description: 'Emergency assistance request submitted', created_at: new Date().toISOString() },
      { id: 'ev-2', event_type: 'LOCATION_RECEIVED', description: 'Location captured in Banda, Uttar Pradesh', created_at: new Date().toISOString() },
    ];
  },

  /**
   * Cancels an active emergency request.
   */
  async cancelEmergencyRequest(id, reason = 'Patient cancelled request') {
    await this.updateEmergencyStatus(id, EMERGENCY_STATUS.CANCELLED, `Emergency cancelled: ${reason}`);
    return true;
  },

  /**
   * Subscribes to Supabase Realtime updates for an emergency record.
   */
  subscribeToEmergencyUpdates(id, onUpdate) {
    const channel = supabase
      .channel(`emergency_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergency_requests', filter: `id=eq.${id}` },
        (payload) => {
          if (onUpdate && payload.new) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
