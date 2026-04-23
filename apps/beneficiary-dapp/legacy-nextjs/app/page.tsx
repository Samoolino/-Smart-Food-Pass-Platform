'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RoleNavigation } from '../components/role-navigation';
import { getDefaultRouteForRole, getStoredRole, type AppRole } from '../lib/session';

export default function HomePage() {
  const [role, setRole] = useState<AppRole>(null);

  useEffect(() => {
    setRole(getStoredRole());
  }, []);

  const cards = useMemo(
    () => [
      {
        href: '/sponsor/dashboard',
        title: 'Sponsor dashboard',
        description: 'Review funded passes, redemption totals, beneficiary counts, and product usage.',
        accent: 'hover:border-blue-400',
      },
      {
        href: '/merchant/redeem',
        title: 'Merchant redemption',
        description: 'Validate QR payloads, review eligible products, redeem pass value, and inspect transaction history.',
        accent: 'hover:border-emerald-400',
      },
      {
        href: '/beneficiary/passes',
        title: 'Beneficiary passes',
        description: 'View active passes, balances, validity windows, and access restrictions.',
        accent: 'hover:border-amber-400',
      },
      {
        href: '/admin/dashboard',
        title: 'Admin controls',
        description: 'Approve users and merchants, inspect audit logs, and keep operations aligned.',
        accent: 'hover:border-cyan-400',
      },
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <RoleNavigation current="home" />

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <p className="text-blue-300 uppercase tracking-[0.3em] text-xs mb-3">Smart Food Pass</p>
            <h1 className="text-4xl font-bold">Unified operations across sponsor, merchant, beneficiary, and admin roles</h1>
            <p className="text-slate-300 mt-4 max-w-3xl">
              This frontend now sits on top of the staged backend stack for auth, pass issuance, redemption,
              analytics, admin controls, beneficiary views, testing, CI, and chain bridge readiness.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-500 rounded-lg px-5 py-3 font-medium">
              Login
            </Link>
            {role && (
              <Link href={getDefaultRouteForRole(role)} className="bg-slate-800 hover:bg-slate-700 rounded-lg px-5 py-3 font-medium">
                Go to my workspace
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className={`rounded-2xl border border-slate-800 bg-slate-900 p-6 transition ${card.accent}`}>
              <h2 className="text-2xl font-semibold mb-2">{card.title}</h2>
              <p className="text-slate-300">{card.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <h3 className="text-lg font-semibold mb-2">Stored session role</h3>
          <p className="text-slate-300">{role || 'No active role stored yet. Use the login screen first.'}</p>
        </div>
      </div>
    </main>
  );
}
