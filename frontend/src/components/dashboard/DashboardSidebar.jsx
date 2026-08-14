import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { ROLES } from '../../types/roles';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Settings,
  Bed,
  Activity,
  Stethoscope,
  Users,
  Ambulance,
  BarChart3,
  ShieldCheck,
  Bell,
  Sparkles,
  Bot,
  Heart,
  Siren,
  X,
} from 'lucide-react';
import './DashboardLayout.css';

export function DashboardSidebar({ isMobileOpen, onCloseMobile }) {
  const { role } = useAuth();

  // Public Visitors Nav List
  const PUBLIC_NAV = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/hospitals', label: 'Find Hospitals', icon: Building2 },
    { to: '/emergency', label: 'Emergency SOS', icon: AlertTriangle, badge: 'SOS' },
    { to: '/services', label: 'Services', icon: Activity },
    { to: '/about', label: 'About HealthOS', icon: FileText },
  ];

  // Patient Nav List
  const PATIENT_NAV = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/hospitals', label: 'Find Hospitals', icon: Building2 },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/emergency', label: 'Emergency SOS', icon: AlertTriangle, badge: 'SOS' },
    { to: '/patient/ai', label: 'AI Symptoms', icon: Bot },
    { to: '/patient/home-care', label: 'Home Care', icon: Heart },
    { to: '/patient/records', label: 'Health Records', icon: FileText },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: Stethoscope },
    { to: '/patient/insurance', label: 'Insurance', icon: ShieldCheck },
    { to: '/patient/profile', label: 'My Emergency Profile', icon: User },
  ];

  // Hospital Nav List
  const HOSPITAL_NAV = [
    { to: '/hospital/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hospital/verification', label: 'Verification', icon: ShieldCheck },
    { to: '/hospital/patients', label: 'Patients', icon: Users },
    { to: '/hospital/appointments', label: 'Appointments', icon: Calendar },
    { to: '/hospital/beds', label: 'Beds', icon: Bed },
    { to: '/hospital/icu', label: 'ICU', icon: Activity },
    { to: '/hospital/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/hospital/staff', label: 'Staff', icon: Users },
    { to: '/hospital/emergency', label: 'Emergency Intake', icon: AlertTriangle, badge: 'LIVE' },
    { to: '/hospital/ambulance', label: 'Ambulances', icon: Ambulance },
    { to: '/hospital/inventory', label: 'Inventory', icon: FileText },
    { to: '/hospital/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/hospital/ai', label: 'AI Insights', icon: Bot },
  ];

  // Admin / Authority Nav List
  const ADMIN_NAV = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/verifications', label: 'Verifications', icon: ShieldCheck, badge: 'REVIEW' },
    { to: '/admin/network', label: 'Hospital Network', icon: Building2 },
    { to: '/admin/emergencies', label: 'Emergencies', icon: Siren, badge: 'ALERT' },
    { to: '/admin/health-trends', label: 'Health Trends', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  let navItems = PATIENT_NAV;
  if (role === ROLES.PUBLIC) navItems = PUBLIC_NAV;
  if (role === ROLES.HOSPITAL) navItems = HOSPITAL_NAV;
  if (role === ROLES.ADMIN || role === ROLES.AUTHORITY) navItems = ADMIN_NAV;

  return (
    <aside className={`healthos-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div>
        {/* BRAND LOGO TOP LEFT & MOBILE CLOSE BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <NavLink to="/" className="healthos-brand-logo" onClick={onCloseMobile} style={{ marginBottom: 0 }}>
            <Sparkles className="logo-sparkle" size={24} />
            <div className="brand-text">
              <span>HealthOS</span>
            </div>
          </NavLink>

          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}
              title="Close Menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="healthos-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `healthos-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="nav-icon" size={18} />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badge === 'SOS' || item.badge === 'ALERT' ? 'sos' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* FOOTER USER / STATUS */}
      <div className="sidebar-footer">
        <NavLink
          to={role === ROLES.ADMIN ? '/admin/settings' : role === ROLES.HOSPITAL ? '/hospital/settings' : '/patient/settings'}
          className="sidebar-footer-link"
          onClick={onCloseMobile}
        >
          <Settings size={16} />
          <span>System Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
