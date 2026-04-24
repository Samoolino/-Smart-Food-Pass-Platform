'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RoleNavigation } from '../components/role-navigation';
import { api } from '../lib/api';
import { getDefaultRouteForRole, getStoredRole, type AppRole } from '../lib/session';

type JourneyStage = 'value' | 'registration' | 'kyc' | 'connect' | 'access' | 'confirm';

export default function HomePage() {
  const [role, setRole] = useState<AppRole>(null);
  const [activeStage, setActiveStage] = useState<JourneyStage>('value');
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

  const stageDetails = useMemo<Record<JourneyStage, { title: string; body: string; points: string[] }>>(
    () => ({
      value: {
        title: 'Clear value proposition',
        body: 'Open a secure product-access and donation utility space where valid passes, stamps, QR access, merchant pathways, and payment verification are visible and understandable from the first screen.',
        points: [
          'Benefits-driven hero statement and CTA',
          'Product marketplace visibility and account pathways',
          'Trust-building language around security and compliance',
        ],
      },
      registration: {
        title: 'Registration and account creation',
        body: 'Create a personalized space quickly with email, phone, password setup, and immediate introduction of security features like biometrics or 2FA-ready pathways.',
        points: [
          'Email and phone registration entry',
          'Password and protected identity setup',
          'Fast path into authorized access space',
        ],
      },
      kyc: {
        title: 'Onboarding and KYC / KYB clarity',
        body: 'Guide users through ID upload, proof of address, screening questions, and reassurance messaging that explains why sensitive data is needed and how it is protected.',
        points: [
          'Step-by-step compliance flow',
          'Privacy reassurance and trust prompts',
          'AML / KYC / GDPR-aware experience framing',
        ],
      },
      connect: {
        title: 'Financial data connection',
        body: 'Present secure wallet, bank, or payment-method linking with clear messaging that data is encrypted in transit and used only for verified financial routing and access enforcement.',
        points: [
          'Wallet and bank connection readiness',
          'Transparent encrypted-data messaging',
          'Fintech-grade trust narrative without front-end overexposure of sensitive data',
        ],
      },
      access: {
        title: 'Product access and personalization dashboard',
        body: 'Translate donation or subscription value into operational utility: valid stamps, QR/pass access, plan-aware products, merchant marketplaces, and nutritionally guided product access.',
        points: [
          'User access to valid stamps, pass products, and approved merchants',
          'Plan-aware product registry visibility',
          'Nutritional supply-chain and smart-stamp usage guidance',
        ],
      },
      confirm: {
        title: 'Transactional confirmation and authorization',
        body: 'Before final approval, display a clear summary with amount, recipient, fees, route, and re-authentication prompts such as PIN or biometrics to reinforce safety and user confidence.',
        points: [
          'Transaction summary and confirmation layer',
          'Re-authentication for final approval',
          'Immediate update of traceable history and operational state',
        ],
      },
    }),
    [],
  );

  const stages: JourneyStage[] = ['value', 'registration', 'kyc', 'connect', 'access', 'confirm'];

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(234,179,8,0.12),transparent_30%)]" />
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <RoleNavigation current="home" />

        <section className="grid xl:grid-cols-[1.15fr_0.85fr] gap-8 items-stretch mb-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-10 shadow-2xl shadow-black/30">
            <p className="text-sky-300 uppercase tracking-[0.35em] text-xs mb-4">Smart Food Pass Protocol</p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Secure food-access value, verified identity pathways, and a marketplace built for trust.
            </h1>
            <p className="text-slate-300 text-lg mt-6 max-w-3xl leading-8">
              Open an authorized space for product access, donation-to-utility conversion, smart stamp eligibility,
              merchant marketplace routing, payment verification, and blockchain-aware transaction trust.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/login" className="rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-3 font-medium">
                Get Started
              </Link>
              <Link href="/auth/signup" className="rounded-full border border-white/15 bg-white/10 hover:bg-white/15 px-6 py-3 font-medium">
                Open Account
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
                <p className="font-medium text-white mb-1">Compliance first</p>
                <p className="text-sm">GDPR, AML/KYC, and regulated onboarding expectations are reflected in how identity, documents, financial links, and confirmations are presented.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white mb-1">Trust and security</p>
                <p className="text-sm">Touch ID, Face ID, PIN, or 2FA-ready prompts are introduced early so safety is part of the experience, not an afterthought.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white mb-1">Speed and usability</p>
                <p className="text-sm">The front end is shaped to feel immediate while hiding the heavy backend infrastructure behind clear, low-friction action pathways.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 lg:p-8 mb-10 shadow-2xl shadow-black/20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div>
              <p className="text-amber-300 uppercase tracking-[0.22em] text-xs mb-2">Operational journey clarity</p>
              <h2 className="text-3xl font-semibold">Interactive trust and access pathway</h2>
            </div>
            <p className="text-slate-300 max-w-3xl leading-8">
              Move through the exact fintech-grade pathway: landing value, account creation, KYC, financial connection,
              product access, and secure finalization.
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.38fr_0.62fr] gap-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {stages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`text-left rounded-2xl border px-4 py-4 transition ${activeStage === stage ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-slate-900/50 hover:border-white/20'}`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-1">Journey stage</p>
                  <p className="text-lg font-medium text-white">{stageDetails[stage].title}</p>
                </button>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-6 lg:p-8">
              <p className="text-cyan-300 uppercase tracking-[0.18em] text-xs mb-3">Selected pathway</p>
              <h3 className="text-3xl font-semibold mb-4">{stageDetails[activeStage].title}</h3>
              <p className="text-slate-300 leading-8 mb-6">{stageDetails[activeStage].body}</p>
              <div className="grid md:grid-cols-3 gap-4">
                {stageDetails[activeStage].points.map((point) => (
                  <div key={point} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 leading-7">
                    {point}
                  </div>
                ))}
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
              Review product descriptions, product-owner routing, merchant market access, valid pass-linked product visibility,
              and nutritional supply-chain guidance in one operational marketplace space.
            </p>
          </Link>
          <Link href="/payments/harness" className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 hover:border-cyan-300/30 transition">
            <p className="text-cyan-300 uppercase tracking-[0.22em] text-xs mb-3">Payment integration test lane</p>
            <h3 className="text-3xl font-semibold mb-4">Verification, authorization, and settlement tracing</h3>
            <p className="text-slate-300 leading-8">
              Test intent routing, inspect payer and payee wallet definitions, and follow simulated settlement records that prepare the way for real payment integration and final authorization UX.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
