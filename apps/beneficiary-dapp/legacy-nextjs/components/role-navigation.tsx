'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { clearStoredSession, getDefaultRouteForRole, getStoredRole, type AppRole } from '../lib/session';

type RoleNavigationProps = {
  current: 'home' | 'sponsor' | 'merchant' | 'beneficiary' | 'admin' | 'marketplace' | 'payments' | 'onboarding' | 'nutrition';
};

export function RoleNavigation({ current }: RoleNavigationProps) {
  const [role, setRole] = useState<AppRole>(null);

  useEffect(() => {
    setRole(getStoredRole());
  }, []);

  const items = useMemo(() => {
    const allItems = [
      { key: 'home', href: '/', label: 'Home', roles: ['admin', 'super_admin', 'sponsor', 'merchant', 'beneficiary', null] },
      { key: 'onboarding', href: '/onboarding', label: 'Onboarding', roles: ['admin', 'super_admin', 'sponsor', 'merchant', 'beneficiary', null] },
      { key: 'marketplace', href: '/marketplace', label: 'Marketplace', roles: ['admin', 'super_admin', 'sponsor', 'merchant', 'beneficiary', null] },
      { key: 'nutrition', href: '/nutrition', label: 'Nutrition', roles: ['admin', 'super_admin', 'sponsor', 'beneficiary'] },
      { key: 'payments', href: '/payments/harness', label: 'Payments', roles: ['admin', 'super_admin', 'sponsor', 'merchant'] },
      { key: 'sponsor', href: '/sponsor/dashboard', label: 'Sponsor', roles: ['admin', 'super_admin', 'sponsor'] },
      { key: 'merchant', href: '/merchant/redeem', label: 'Merchant', roles: ['admin', 'super_admin', 'merchant'] },
      { key: 'beneficiary', href: '/beneficiary/passes', label: 'Beneficiary', roles: ['admin', 'super_admin', 'beneficiary'] },
      { key: 'admin', href: '/admin/dashboard', label: 'Admin', roles: ['admin', 'super_admin'] },
    ];

    return allItems.filter((item) => item.roles.includes(role));
  }, [role]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${current === item.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {role && (
          <Link href={getDefaultRouteForRole(role)} className="text-sm text-slate-600 hover:underline">
            My role: {role}
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            clearStoredSession();
            window.location.href = '/auth/login';
          }}
          className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
