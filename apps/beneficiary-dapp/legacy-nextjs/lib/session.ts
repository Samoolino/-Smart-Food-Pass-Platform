'use client';

export type AppRole = 'admin' | 'super_admin' | 'sponsor' | 'merchant' | 'beneficiary' | null;

export function getStoredRole(): AppRole {
  if (typeof window === 'undefined') {
    return null;
  }

  return (localStorage.getItem('role') as AppRole) || null;
}

export function getDefaultRouteForRole(role: AppRole) {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    case 'sponsor':
      return '/sponsor/dashboard';
    case 'merchant':
      return '/merchant/redeem';
    case 'beneficiary':
      return '/beneficiary/passes';
    default:
      return '/auth/login';
  }
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
}
