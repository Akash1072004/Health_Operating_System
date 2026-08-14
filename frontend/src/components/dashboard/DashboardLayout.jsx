import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { FloatingEmergencyButton } from '../emergency/FloatingEmergencyButton';
import { useAuth } from '../../app/providers/AuthProvider';
import { ROLES } from '../../types/roles';
import './DashboardLayout.css';

export function DashboardLayout({ children, roleTitle }) {
  const { role } = useAuth();
  const currentRole = roleTitle || role || ROLES.PATIENT;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="healthos-app-shell">
      <div className="healthos-workspace-container">
        {/* MOBILE DRAWER OVERLAY BACKDROP */}
        {isMobileOpen && (
          <div className="sidebar-overlay-backdrop" onClick={closeMobileMenu} />
        )}

        {/* LEFT VERTICAL SIDEBAR */}
        <DashboardSidebar
          role={currentRole}
          isMobileOpen={isMobileOpen}
          onCloseMobile={closeMobileMenu}
        />

        {/* MAIN BODY AREA */}
        <div className="healthos-main-body">
          {/* TOP HEADER */}
          <DashboardHeader onToggleMobileMenu={toggleMobileMenu} />

          {/* DASHBOARD CONTENT WORKSPACE */}
          <main className="healthos-dashboard-content">
            {children}
          </main>

          {/* FLOATING BOTTOM-RIGHT EMERGENCY SOS BUTTON */}
          <FloatingEmergencyButton />
        </div>
      </div>
    </div>
  );
}
