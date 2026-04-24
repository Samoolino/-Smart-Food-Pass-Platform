'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RoleNavigation } from '../components/role-navigation';
import { api } from '../lib/api';
import { getDefaultRouteForRole, getStoredRole, type AppRole } from '../lib/session';

export default function HomePage() {
  const [role, setRole] = useState<AppRole>(null);
  const [marketplaceCount, setMarketplaceCount] = useState<number | null>(null);
  const [settlementCount, setSettlementCount] = useState<number | null>(null);
  const [reconciliationCount, setReconciliationCount] = useState<number | null>(null);

  useEffect(() => {
    setRole(getStoredRole());

    const loadSignals = async () => {
      try {
        const [registry, settlements, reconciliation] = await Promise.all([
          api.getMarketplaceRegistry(),
          api.getSettlements(),
          api.getReconciliationHistory({ page: 1, limit: 5 }),
        ]);
        setMarketplaceCount(Array.isArray(registry) ? registry.length : 0);
        setSettlementCount(Array.isArray(settlements) ? settlements.length : 0);
        setReconciliationCount(reconciliation?.pagination?.total || 0);
      } catch {
        setMarketplaceCount(null);
        setSettlementCount(null);
        setReconciliationCount(null);
      }
    };

    loadSignals();
  }, []);

  const identityLanes = useMemo(
    () => [
      {
        title: 'Sponsor identity',
        href: '/sponsor/dashboard',
        accent: 'from-blue-500/20 to-sky-500/10 border-blue-400/30',
        summary: 'Fund plans, issue access, govern registry pathways, and monitor sponsor-side redemption and settlement signals.',
      },
      {
        title: 'Merchant identity',
        href: '/merchant/redeem',
        accent: 'from-emerald-500/20 to-lime-500/10 border-emerald-400/30',
        summary: 'Redeem smart stamps, expose catalog inventory, connect merchant wallet routing, and trace settlement pathways.',
      },
      {
        title: 'Beneficiary identity',
        href: '/beneficiary/passes',
        accent: 'from-amber-500/20 to-orange-500/10 border-amber-400/30',
        summary: 'Navigate active passes, eligibility context, nutritional access signals, and wallet-aware product availability.',
      },
      {
        title: 'Admin identity',
        href: '/admin/dashboard',
        accent: 'from-cyan-500/20 to-violet-500/10 border-cyan-400/30',
        summary: 'Control approvals, audit flows, registry integrity, reconciliation views, and operational trust boundaries.',
      },
    ],
    [],
  );

  const operations = useMemo(
    () => [
      {
        label: 'Marketplace registry',
        value: marketplaceCount === null ? '—' : String(marketplaceCount),
        hint: 'Merchant-linked product availability entries',
        href: '/marketplace',
      },
      {
        label: 'Settlement trace records',
        value: settlementCount === null ? '—' : String(settlementCount),
        hint: 'Simulated payment execution and settlement reviews',
        href: '/payments/harness',
      },
      {
        label: 'Chain reconciliation events',
        value: reconciliationCount === null ? '—' : String(reconciliationCount),
        hint: 'Issuance and redemption chain history visibility',
        href: '/payments/harness',
      },
    ],
    [marketplaceCount, settlementCount, reconciliationCount],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(234,179,8,0.12),transparent_30%)]" />
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <RoleNavigation current="home" />

        <section className="grid xl:grid-cols-[1.15fr_0.85fr] gap-8 items-stretch mb-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-10 shadow-2xl shadow-black/30">
            <p className="text-sky-300 uppercase tracking-[0.35em] text-xs mb-4">Smart Food Pass Protocol</p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Identity-aware food access, marketplace routing, and blockchain-secured operational pathways.
            </h1>
            <p className="text-slate-300 text-lg mt-6 max-w-3xl leading-8">
              The landing experience now reveals how sponsor capital, merchant registry access, beneficiary passes,
              product marketplace routing, wallet ownership, reconciliation history, and payment tracing connect inside one interactive operating surface.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/login" className="rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-3 font-medium">
                Enter workspace
              </Link>
              <Link href="/marketplace" className="rounded-full border border-white/15 bg-white/10 hover:bg-white/15 px-6 py-3 font-medium">
                Explore marketplace pathways
              </Link>
              {role && (
                <Link href={getDefaultRouteForRole(role)} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-3 font-medium text-emerald-100">
                  Continue as {role}
                </Link>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-10">
              {operations.map((item) => (
                <Link key={item.label} href={item.href} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-sky-400/40 transition">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-3xl font-bold mt-2">{item.value}</p>
                  <p className="text-sm text-slate-400 mt-2">{item.hint}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-violet-300 uppercase tracking-[0.25em] text-xs mb-2">Security definition</p>
                <h2 className="text-2xl font-semibold">Frontend transaction trust surface</h2>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-2xl">⛓</div>
            </div>
            <div className="space-y-4 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white mb-1">Wallet-aware routing</p>
                <p className="text-sm">Merchant wallets, product-owner wallets, and user wallets are now visible as operational routing definitions for settlement and registry access.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white mb-1">Plan + pass access enforcement</p>
                <p className="text-sm">Product visibility can be shaped by plan rules, pass restrictions, approved registry state, and role-specific controls.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white mb-1">Reconciliation visibility</p>
                <p className="text-sm">Issuance, redemption, and settlement signals can be traced through backend history views before frontend action surfaces are expanded further.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {identityLanes.map((lane) => (
            <Link
              key={lane.title}
              href={lane.href}
              className={`rounded-[1.75rem] border bg-gradient-to-br ${lane.accent} p-6 backdrop-blur-xl hover:-translate-y-1 transition-all duration-200`}
            >
              <p className="text-sm uppercase tracking-[0.22em] text-slate-300 mb-3">Identity pathway</p>
              <h3 className="text-2xl font-semibold mb-3">{lane.title}</h3>
              <p className="text-slate-200 leading-7">{lane.summary}</p>
            </Link>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Link href="/marketplace" className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 hover:border-amber-300/30 transition">
            <p className="text-amber-300 uppercase tracking-[0.22em] text-xs mb-3">Product marketplace indicator</p>
            <h3 className="text-3xl font-semibold mb-4">Registry-linked product marketplace</h3>
            <p className="text-slate-300 leading-8">
              Review accessible product pathways, merchant-linked inventory entries, owner wallet routing, and smart-stamp nutritional supply chain guidance in one place.
            </p>
          </Link>
          <Link href="/payments/harness" className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 hover:border-cyan-300/30 transition">
            <p className="text-cyan-300 uppercase tracking-[0.22em] text-xs mb-3">Payment integration test lane</p>
            <h3 className="text-3xl font-semibold mb-4">Settlement tracing and provider simulation</h3>
            <p className="text-slate-300 leading-8">
              Test intent routing, inspect payer and payee wallet definitions, and follow simulated settlement records that can later be upgraded into real provider integrations.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
