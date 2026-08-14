import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../../types/roles';
import { authService } from '../../services/authService';

const AuthContext = createContext({
  user: null,
  role: ROLES.PUBLIC,
  hospitalStatus: 'VERIFIED',
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  loginAs: () => {},
  registerPatient: async () => {},
  registerHospital: async () => {},
  requestPasswordReset: async () => {},
  logout: () => {},
  clearError: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(ROLES.PUBLIC);
  const [hospitalStatus, setHospitalStatus] = useState('VERIFIED');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const current = await authService.getCurrentUser();
        if (isMounted && current) {
          setUser(current);
          setRole(current.role || ROLES.PATIENT);
          setHospitalStatus(current.hospital_status || 'VERIFIED');
        }
      } catch (_e) {
        // No session
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, selectedRole = ROLES.PATIENT) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password, selectedRole);
      if (res?.user) {
        setUser(res.user);
        setRole(res.user.role);
        setHospitalStatus(res.user.hospital_status || 'VERIFIED');
        return res.user;
      }
    } catch (err) {
      setError(err?.message || 'Invalid credentials or login failure.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAs = (selectedRole, userEmail) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const isPending = selectedRole === ROLES.HOSPITAL && userEmail?.includes('pending');
      const newUser = {
        id: `demo-${selectedRole.toLowerCase()}-${Date.now()}`,
        email: userEmail || `${selectedRole.toLowerCase()}@healthos.org`,
        full_name: userEmail ? userEmail.split('@')[0] : (selectedRole === ROLES.PATIENT ? 'Patient Account' : selectedRole === ROLES.HOSPITAL ? 'Hospital Administrator' : 'System Admin'),
        role: selectedRole,
        hospital_status: isPending ? 'PENDING_VERIFICATION' : 'VERIFIED',
      };
      localStorage.setItem('healthos_session', JSON.stringify(newUser));
      setUser(newUser);
      setRole(selectedRole);
      setHospitalStatus(newUser.hospital_status);
      setIsLoading(false);
    }, 250);
  };

  const registerPatient = async (patientData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.registerPatient(patientData);
      if (res?.user) {
        setUser(res.user);
        setRole(ROLES.PATIENT);
        setHospitalStatus('VERIFIED');
        return res.user;
      }
    } catch (err) {
      setError(err?.message || 'Patient registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerHospital = async (hospitalData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.registerHospital(hospitalData);
      if (res?.user) {
        setUser(res.user);
        setRole(ROLES.HOSPITAL);
        setHospitalStatus('PENDING_VERIFICATION');
        return res.user;
      }
    } catch (err) {
      setError(err?.message || 'Hospital registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    return authService.requestPasswordReset(email);
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setRole(ROLES.PUBLIC);
    setHospitalStatus('VERIFIED');
    setIsLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        hospitalStatus,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        loginAs,
        registerPatient,
        registerHospital,
        requestPasswordReset,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
