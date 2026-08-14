import { supabase } from '../lib/supabase/client';

/**
 * HealthOS Patient Profile & Emergency Data Service
 * Persists patient medical & emergency profile data directly into Supabase PostgreSQL database
 */
export const profileService = {
  /**
   * Helper to resolve active Supabase UUID from Auth Session
   */
  async getValidUserId(passedId) {
    if (passedId && passedId.length > 20 && !passedId.startsWith('demo-') && !passedId.startsWith('user-')) {
      return passedId;
    }
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) return data.user.id;
    } catch (_e) {
      // Fallback
    }
    return null;
  },

  /**
   * Retrieves the current patient's profile from Supabase database or LocalStorage
   */
  async getPatientProfile(passedId) {
    let profileData = {
      full_name: '',
      email: '',
      phone_number: '',
      age: '',
      gender: 'Male',
      blood_group: 'O+',
      allergies: '',
      conditions: '',
      current_medications: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      address: '',
    };

    // Load saved LocalStorage data if present
    const savedLocal = localStorage.getItem('healthos_patient_profile');
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        profileData = { ...profileData, ...parsed };
      } catch (_e) {
        // Fallback
      }
    }

    const userId = await this.getValidUserId(passedId);
    try {
      let query = supabase.from('profiles').select('*');
      if (userId) {
        query = query.eq('id', userId);
      } else if (profileData.email) {
        query = query.eq('email', profileData.email);
      } else {
        return profileData;
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        Object.keys(data).forEach((key) => {
          if (data[key] !== null && data[key] !== undefined) {
            profileData[key] = data[key];
          }
        });
      }
    } catch (_err) {
      // Fallback
    }

    return profileData;
  },

  /**
   * Saves and persists the patient's Emergency & Clinical Profile into Supabase database
   */
  async savePatientProfile(passedId, profileData) {
    const updated = {
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    // Save to LocalStorage for instant UI access & offline resilience
    localStorage.setItem('healthos_patient_profile', JSON.stringify(updated));

    let dbSaved = false;
    let dbErrorMsg = null;

    const userId = await this.getValidUserId(passedId);

    const payload = {
      full_name: profileData.full_name || 'Patient Profile',
      email: profileData.email || 'patient@healthos.org',
      phone_number: profileData.phone_number || '',
      age: parseInt(profileData.age, 10) || null,
      gender: profileData.gender || 'Male',
      blood_group: profileData.blood_group || 'O+',
      allergies: profileData.allergies || '',
      conditions: profileData.conditions || '',
      current_medications: profileData.current_medications || '',
      emergency_contact_name: profileData.emergency_contact_name || '',
      emergency_contact_phone: profileData.emergency_contact_phone || '',
      emergency_contact_relation: profileData.emergency_contact_relation || '',
      address: profileData.address || '',
      updated_at: new Date().toISOString(),
    };

    try {
      if (userId) {
        // Authenticated Supabase Auth User: set id to foreign key match
        payload.id = userId;
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (!upsertErr) {
          dbSaved = true;
        } else {
          dbErrorMsg = upsertErr.message;
        }
      } else {
        // Demo or guest mode: try upserting by email or inserting without forcing un-matched id
        const { error: emailErr } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'email' });

        if (!emailErr) {
          dbSaved = true;
        } else {
          dbErrorMsg = emailErr.message;
        }
      }
    } catch (err) {
      dbErrorMsg = err?.message || 'Database connection error';
    }

    return {
      profile: updated,
      dbSaved,
      dbErrorMsg,
    };
  },
};
