import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { PatientLayout } from '../layouts/PatientLayout';
import { HospitalLayout } from '../layouts/HospitalLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { RoleGuard } from '../guards/RoleGuard';
import { ROLES } from '../../types/roles';

// Public Feature Components
import { PublicHome } from '../../features/public/PublicHome';
import { AboutPage } from '../../features/public/AboutPage';
import { HowItWorksPage } from '../../features/public/HowItWorksPage';
import { FindHospitalsPage } from '../../features/public/FindHospitalsPage';
import { HospitalDetailPage } from '../../features/public/HospitalDetailPage';
import { EmergencyPublicPage } from '../../features/public/EmergencyPublicPage';
import { ServicesPage } from '../../features/public/ServicesPage';
import { ContactPage } from '../../features/public/ContactPage';

// Patient Feature Components
import { PatientProfilePage } from '../../features/patient/PatientProfilePage';

// Hospital & Verification Components
import { EmergencyTrackingView } from '../../components/emergency/EmergencyTrackingView';
import { HospitalEmergencyDashboard } from '../../features/hospital/HospitalEmergencyDashboard';
import { HospitalVerificationForm } from '../../components/hospital/HospitalVerificationForm';
import { AdminVerificationDashboard } from '../../features/admin/AdminVerificationDashboard';

// Auth Feature Components
import { Login } from '../../features/auth/Login';
import { Register } from '../../features/auth/Register';
import { ForgotPassword } from '../../features/auth/ForgotPassword';
import { ResetPassword } from '../../features/auth/ResetPassword';

// Common Placeholder Boundary
import { FeaturePlaceholder } from '../../features/common/FeaturePlaceholder';

export function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicHome />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/hospitals" element={<FindHospitalsPage />} />
        <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
        <Route path="/emergency" element={<EmergencyPublicPage />} />
        <Route path="/emergency/track/:token" element={<EmergencyPublicPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* AUTHENTICATION ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* PATIENT ROUTES */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
              <PatientLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<FeaturePlaceholder title="Patient Command Overview" category="PATIENT" role="PATIENT" />} />
        <Route path="profile" element={<PatientProfilePage />} />
        <Route path="hospitals" element={<FindHospitalsPage />} />
        <Route path="appointments" element={<FeaturePlaceholder title="Appointments & Bookings" category="PATIENT" role="PATIENT" />} />
        <Route path="emergency" element={<EmergencyPublicPage />} />
        <Route path="records" element={<FeaturePlaceholder title="Electronic Health Records" category="PATIENT" role="PATIENT" />} />
        <Route path="prescriptions" element={<FeaturePlaceholder title="Prescriptions & Medications" category="PATIENT" role="PATIENT" />} />
        <Route path="home-care" element={<FeaturePlaceholder title="Home Care & Tele-triage" category="PATIENT" role="PATIENT" />} />
        <Route path="insurance" element={<FeaturePlaceholder title="Health Insurance Coverage" category="PATIENT" role="PATIENT" />} />
        <Route path="ai" element={<FeaturePlaceholder title="AI Symptom Checker" category="AI" role="PATIENT" />} />
        <Route path="settings" element={<FeaturePlaceholder title="Patient Account Settings" category="PATIENT" role="PATIENT" />} />
      </Route>

      {/* HOSPITAL ROUTES */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.HOSPITAL, ROLES.ADMIN]}>
              <HospitalLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<FeaturePlaceholder title="Hospital Command Overview" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="verification" element={<HospitalVerificationForm hospitalId="a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6" />} />
        <Route path="profile" element={<FeaturePlaceholder title="Hospital Profile & Licensing" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="beds" element={<FeaturePlaceholder title="Beds & Ward Management" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="icu" element={<FeaturePlaceholder title="ICU Capacity & Triage" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="doctors" element={<FeaturePlaceholder title="Doctors Roster & Schedules" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="staff" element={<FeaturePlaceholder title="Hospital Staff Directory" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="appointments" element={<FeaturePlaceholder title="Hospital Appointment Desk" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="emergency" element={<HospitalEmergencyDashboard />} />
        <Route path="ambulance" element={<FeaturePlaceholder title="Ambulance Fleet Dispatch" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="inventory" element={<FeaturePlaceholder title="Medical Inventory" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="patients" element={<FeaturePlaceholder title="Patient Registry & Admissions" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="analytics" element={<FeaturePlaceholder title="Hospital Operational Analytics" category="HOSPITAL" role="HOSPITAL" />} />
        <Route path="ai" element={<FeaturePlaceholder title="Clinical AI Insights" category="AI" role="HOSPITAL" />} />
        <Route path="settings" element={<FeaturePlaceholder title="Hospital Unit Settings" category="HOSPITAL" role="HOSPITAL" />} />
      </Route>

      {/* AUTHORITY / ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.AUTHORITY]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<FeaturePlaceholder title="Regional Command Center" category="ADMIN" role="ADMIN" />} />
        <Route path="verifications" element={<AdminVerificationDashboard />} />
        <Route path="network" element={<FeaturePlaceholder title="Healthcare Network Status" category="ADMIN" role="ADMIN" />} />
        <Route path="emergencies" element={<FeaturePlaceholder title="Regional Emergency Load" category="EMERGENCY" role="ADMIN" />} />
        <Route path="health-trends" element={<FeaturePlaceholder title="Public Health Trends" category="ADMIN" role="ADMIN" />} />
        <Route path="settings" element={<FeaturePlaceholder title="System Security & Config" category="ADMIN" role="ADMIN" />} />
      </Route>

      {/* FALLBACK ROUTE */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
