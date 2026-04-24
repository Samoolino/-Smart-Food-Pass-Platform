'use client';

import { useEffect, useState } from 'react';
import { getDefaultRouteForRole, getStoredRole, getStoredToken, type AppRole } from '../lib/session';

type ProtectedRouteProps = {
  allowedRoles: AppRole[];
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function ProtectedRoute({
  allowedRoles,
  children,
  title = 'Authorized access space',
  description = 'This area is protected by role-aware access rules and requires a valid authenticated session.',
}: ProtectedRouteProps) {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<AppRole>(null);

  useEffect(() => {
    const token = getStoredToken();
    const storedRole = getStoredRole();
    setRole(storedRole);

    if (!token || !storedRole) {
      window.location.href = '/auth/login';
      return;
    }

    if (!allowedRoles.includes(storedRole)) {
      window.location.href = getDefaultRouteForRole(storedRole);
      return;
    }

    setAuthorized(true);
    setReady(true);
  }, [allowedRoles]);

  if (!ready || !authorized) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
          <p className="text-cyan-300 uppercase tracking-[0.25em] text-xs mb-3">Protected workflow</p>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-slate-300 leading-8">{description}</p>
          {role && <p className="text-sm text-slate-400 mt-4">Detected role: {role}</p>}
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
