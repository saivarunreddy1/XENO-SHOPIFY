import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentTenant, setCurrentTenant] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set current tenant from authenticated user
  useEffect(() => {
    if (isAuthenticated && user && user.tenantId) {
      setCurrentTenant(user.tenantId);
      fetchTenantData(user.tenantId);
    } else {
      setCurrentTenant(null);
      setTenantData(null);
    }
  }, [isAuthenticated, user]);

  const fetchTenantData = async (tenantId) => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/tenants/${tenantId}`);
      setTenantData(response.data);
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      setTenantData(null);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId) => {
    if (tenantId === currentTenant) return;

    try {
      setLoading(true);
      await fetchTenantData(tenantId);
      setCurrentTenant(tenantId);
      
      // You might want to refresh user data or redirect here
      return { success: true };
    } catch (error) {
      console.error('Error switching tenant:', error);
      return { success: false, message: 'Failed to switch tenant' };
    } finally {
      setLoading(false);
    }
  };

  const refreshTenantData = () => {
    if (currentTenant) {
      fetchTenantData(currentTenant);
    }
  };

  const value = {
    currentTenant,
    tenantData,
    loading,
    switchTenant,
    refreshTenantData,
    isMultiTenant: !!currentTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
