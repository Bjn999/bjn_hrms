'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePermissions() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadPermissions = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const user = JSON.parse(authUserStr);
        setUserRole(user?.role || null);
        
        if (user?.role === 'company_admin') {
          // Company admin has full permissions
          setPermissions(['*']);
        } else if (Array.isArray(user?.permissions)) {
          setPermissions(user.permissions);
        } else {
          setPermissions([]);
        }
      } else {
        setUserRole(null);
        setPermissions([]);
      }
    } catch {
      setUserRole(null);
      setPermissions([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadPermissions();

    const handleStorageChange = () => {
      loadPermissions();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadPermissions]);

  const hasPermission = useCallback((key: string): boolean => {
    if (userRole === 'company_admin') return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(key);
  }, [userRole, permissions]);

  const hasAnyPermission = useCallback((keys: string[]): boolean => {
    if (userRole === 'company_admin') return true;
    if (permissions.includes('*')) return true;
    return keys.some(k => permissions.includes(k));
  }, [userRole, permissions]);

  const hasAllPermissions = useCallback((keys: string[]): boolean => {
    if (userRole === 'company_admin') return true;
    if (permissions.includes('*')) return true;
    return keys.every(k => permissions.includes(k));
  }, [userRole, permissions]);

  const canView = useCallback((module: string): boolean => {
    return hasPermission(`view_${module}`);
  }, [hasPermission]);

  const canCreate = useCallback((module: string): boolean => {
    return hasPermission(`create_${module}`);
  }, [hasPermission]);

  const canEdit = useCallback((module: string): boolean => {
    return hasPermission(`edit_${module}`);
  }, [hasPermission]);

  const canDelete = useCallback((module: string): boolean => {
    return hasPermission(`delete_${module}`);
  }, [hasPermission]);

  return {
    isLoaded,
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    reloadPermissions: loadPermissions
  };
}
