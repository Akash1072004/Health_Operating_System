import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { ROLES } from '../../types/roles';
import {
  Search,
  Settings,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Building2,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Menu,
} from 'lucide-react';

export function DashboardHeader({ onSearch, onToggleMobileMenu }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = user?.full_name || user?.email?.split('@')[0] || (user ? 'User Account' : 'Guest User');
  const currentRole = user?.role || role || ROLES.PATIENT;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) onSearch(searchQuery);
      else navigate(`/hospitals?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="healthos-top-header">
      {/* MOBILE HAMBURGER BUTTON */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button className="mobile-menu-btn" title="Toggle Navigation Menu" onClick={onToggleMobileMenu}>
          <Menu size={22} />
        </button>

        {/* CENTER SEARCH BAR */}
        <form className="healthos-search-bar" onSubmit={handleSearchSubmit}>
          <Search size={16} className="healthos-search-icon" />
          <input
            type="text"
            placeholder="Search hospitals in Banda, UP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* RIGHT HEADER CONTROLS */}
      <div className="healthos-header-controls">
        <button className="header-icon-circle" title="Settings" onClick={() => navigate('/contact')}>
          <Settings size={18} />
        </button>

        <button
          className="header-icon-circle"
          title="Notifications"
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfileMenu(false);
          }}
        >
          <Bell size={18} />
          <span style={{ position: 'absolute', top: '7px', right: '7px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #ffffff' }}></span>
        </button>

        {/* PROFILE BUTTON DROPDOWN */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-user-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div className="user-avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="user-name-text" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{displayName}</span>
            <ChevronDown size={14} style={{ color: '#64748b' }} />
          </button>

          {/* PROFILE MENU POPOVER */}
          {showProfileMenu && (
            <div className="popover-panel">
              <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{displayName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user?.email || 'guest@healthos.org'}</div>
                <div style={{ fontSize: '0.725rem', color: '#0284c7', fontWeight: 700, marginTop: '0.25rem' }}>
                  ROLE: {currentRole} • BANDA, UP
                </div>
              </div>

              {/* MY EMERGENCY PROFILE SHORTCUT (PATIENTS ONLY) */}
              {(currentRole === ROLES.PATIENT || currentRole === ROLES.PUBLIC) && (
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.6rem', fontSize: '0.85rem', color: '#0284c7', fontWeight: 700, cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem' }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/patient/profile');
                  }}
                >
                  <User size={15} style={{ color: '#0284c7' }} /> My Emergency Profile
                </button>
              )}

              {/* ROLE-SPECIFIC DASHBOARD PORTAL BUTTON */}
              <div style={{ padding: '0.5rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', margin: '0.5rem 0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                  Signed In Portal
                </div>

                {currentRole === ROLES.PATIENT && (
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', padding: '0.4rem 0.25rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/patient/dashboard');
                    }}
                  >
                    <User size={15} style={{ color: '#0284c7' }} /> Patient Dashboard
                  </button>
                )}

                {currentRole === ROLES.HOSPITAL && (
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', padding: '0.4rem 0.25rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/hospital/dashboard');
                    }}
                  >
                    <Building2 size={15} style={{ color: '#10b981' }} /> Hospital Command Dashboard
                  </button>
                )}

                {(currentRole === ROLES.ADMIN || currentRole === ROLES.AUTHORITY) && (
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', padding: '0.4rem 0.25rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/dashboard');
                    }}
                  >
                    <ShieldCheck size={15} style={{ color: '#2563eb' }} /> Admin / Authority Dashboard
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', padding: '0.4rem 0.25rem', fontSize: '0.85rem', color: '#dc2626', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                  onClick={logout}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS POPOVER */}
      {showNotifications && (
        <div className="popover-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
            <span>Network Notifications</span>
            <span style={{ fontSize: '0.725rem', background: '#ffe4e6', color: '#be123c', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>3 New</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
            <div style={{ padding: '0.6rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #0284c7' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Bed Capacity Updated</div>
              <div style={{ color: '#64748b' }}>Rani Durgavati Medical College Banda added 12 available ICU beds.</div>
            </div>

            <div style={{ padding: '0.6rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Upcoming Appointment</div>
              <div style={{ color: '#64748b' }}>Consultation with Dr. Rajesh Verma at 09:40 AM.</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
