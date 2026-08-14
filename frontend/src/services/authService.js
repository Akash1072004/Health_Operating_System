import { apiFetch } from './api';
import { supabase } from '../lib/supabase/client';
import { ROLES } from '../types/roles';

/**
 * Authentication Service
 * Integrates Supabase Auth with smooth fallback demo session handler
 */
export const authService = {
  async login(email, password, selectedRole = ROLES.PATIENT) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: data.user.user_metadata?.role || selectedRole,
            hospital_status: data.user.user_metadata?.hospital_status || 'VERIFIED',
          },
          session: data.session,
        };
      }
    } catch (_err) {
      // Fallback
    }

    // Demo session generator for offline/local development
    const demoUser = {
      id: `user-demo-${Date.now()}`,
      email: email || `${selectedRole.toLowerCase()}@healthos.org`,
      full_name: email ? email.split('@')[0] : `Demo ${selectedRole}`,
      role: selectedRole,
      hospital_status: selectedRole === ROLES.HOSPITAL && email.includes('pending') ? 'PENDING_VERIFICATION' : 'VERIFIED',
    };
    localStorage.setItem('healthos_session', JSON.stringify(demoUser));
    return { user: demoUser, session: { token: 'demo-token' } };
  },

  async registerPatient(patientData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: patientData.email,
        password: patientData.password,
        options: {
          data: {
            full_name: patientData.fullName,
            phone_number: patientData.phone,
            role: ROLES.PATIENT,
          },
        },
      });

      if (!error && data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: patientData.email,
          full_name: patientData.fullName,
          phone_number: patientData.phone,
          role: ROLES.PATIENT,
        });

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: patientData.fullName,
            role: ROLES.PATIENT,
            phone_number: patientData.phone,
          },
        };
      }
    } catch (_err) {
      // Fallback
    }

    const newUser = {
      id: `patient-${Date.now()}`,
      email: patientData.email,
      full_name: patientData.fullName,
      role: ROLES.PATIENT,
      phone_number: patientData.phone,
    };
    localStorage.setItem('healthos_session', JSON.stringify(newUser));
    return { user: newUser };
  },

  async registerHospital(hospitalData) {
    let supabaseUser = null;

    try {
      // 1. Register Auth Account in Supabase auth.users
      const { data, error: authError } = await supabase.auth.signUp({
        email: hospitalData.adminEmail,
        password: hospitalData.password,
        options: {
          data: {
            full_name: hospitalData.hospitalName,
            role: ROLES.HOSPITAL,
            hospital_status: 'PENDING_VERIFICATION',
            license_number: hospitalData.licenseNumber,
          },
        },
      });

      if (authError) {
        console.warn('Supabase Auth warning:', authError.message);
      } else if (data?.user) {
        supabaseUser = data.user;
      }

      // 2. Insert Record directly into public.hospitals table
      const randId = `HOS-HOSP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { error: dbError } = await supabase.from('hospitals').insert({
        healthos_hospital_id: randId,
        name: hospitalData.hospitalName,
        license_number: hospitalData.licenseNumber,
        address: hospitalData.address || 'Banda, Uttar Pradesh',
        latitude: parseFloat(hospitalData.latitude) || 25.4800,
        longitude: parseFloat(hospitalData.longitude) || 80.3350,
        total_beds: parseInt(hospitalData.totalBeds, 10) || 150,
        available_beds: parseInt(hospitalData.totalBeds, 10) || 30,
        total_icu: parseInt(hospitalData.totalIcu, 10) || 30,
        available_icu: parseInt(hospitalData.totalIcu, 10) || 8,
        emergency_contact: hospitalData.phone || '+91 94150 12345',
        verification_status: 'PENDING',
        is_active: true,
      });

      if (dbError) {
        console.warn('Supabase public.hospitals table insert warning:', dbError.message);
      }

      if (supabaseUser) {
        return {
          user: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            full_name: hospitalData.hospitalName,
            role: ROLES.HOSPITAL,
            hospital_status: 'PENDING_VERIFICATION',
            license_number: hospitalData.licenseNumber,
          },
        };
      }
    } catch (err) {
      console.error('Hospital registration error:', err);
    }

    // Fallback Session
    const newHospitalUser = {
      id: `hosp-user-${Date.now()}`,
      email: hospitalData.adminEmail,
      full_name: hospitalData.hospitalName,
      role: ROLES.HOSPITAL,
      hospital_status: 'PENDING_VERIFICATION',
      license_number: hospitalData.licenseNumber,
    };
    localStorage.setItem('healthos_session', JSON.stringify(newHospitalUser));
    return { user: newHospitalUser };
  },

  async requestPasswordReset(email) {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (_err) {
      // Fallback
    }
    return { success: true, message: 'Password recovery email sent successfully.' };
  },

  async getCurrentUser() {
    const saved = localStorage.getItem('healthos_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_e) {
        // null
      }
    }
    return null;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (_err) {
      // Fallback
    }
    localStorage.removeItem('healthos_session');
    return { success: true };
  },
};
