'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { RoleNavigation } from '../../components/role-navigation';

const steps = [
  {
    key: 'account',
    title: 'Registration & account creation',
    description:
      'Create a personalized, secure space with email, phone number, password, and role-aware account setup. Touch ID, Face ID, PIN, or 2FA prompts are introduced early to build trust.',
    items: ['Email and phone collection', 'Password setup', 'Role and account purpose', '2FA / biometric readiness'],
  },
  {
    key: 'kyc',
    title: 'Onboarding & KYC/KYB compliance',
    description:
      'Guide the user through identity verification, proof of address, screening questions, and reassurance messaging that explains why every document is required.',
    items: ['Government ID upload', 'Proof of address', 'PEP / risk assessment', 'GDPR / AML reassurance'],
  },
  {
    key: 'finance',
    title: 'Financial data connection',
    description:
      'Prepare the secure linking of wallets, bank accounts, and cards with transparent messaging about encryption, transmission, and why connection is needed.',
    items: ['Wallet linkage', 'Bank / card connection', 'Encrypted transmission notice', 'Verification checkpoints'],
  },
  {
    key: 'access',
    title: 'Authorized access space',
    description:
      'Once verified, the user moves into a controlled account zone where valid passes, QR/stamp utilities, approved products, merchants, and payment authorization pathways are visible.',
    items: ['Valid pass visibility', 'Authorized merchant access', 'Plan-aware product access', 'Payment verification readiness'],
  },
] as const;

const documentChecklist = [
  { name: 'Government ID', status: 'Ready for upload', note: 'Passport, national ID, or drivers license accepted.' },
  { name: 'Proof of address', status: 'Required', note: 'Utility bill, bank statement, or approved address record.' },
  { name: 'Business verification', status: 'Conditional', note: 'Shown for merchant and sponsor entities where KYB applies.' },
  { name: 'Risk screening', status: 'In flow', note: 'PEP and sanctions prompts are handled inside guided steps.' },
];

const connectionOptions = [
  {
    title: 'Wallet connection',
    detail: 'Connect sponsor, merchant, or user wallets for verified routing, settlement tracing, and registry-linked product access.',
  },
  {
    title: 'Bank and card connection',
    detail: 'Secure aggregators can be introduced for card and bank verification without exposing raw credentials to the frontend.',
  },
  {
    title: 'Authorization layer',
    detail: 'Biometrics, PIN, or 2FA can be re-used before final payment or product access approval.',
  },
];

export default function OnboardingPage() {
  const [activeStep, setActiveStep] = useState<(typeof steps)[number]['key']>('account');

  const current = useMemo(() => steps.find((step) => step.key === activeStep) || steps[0], [activeStep]);

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'sponsor', 'merchant', 'beneficiary']}>
      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="onboarding" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 mb-8">
            <p className="text-indigo-300 uppercase tracking-[0.22em] text-xs mb-3">Onboarding and trust design</p>
            <h1 className="text-4xl font-bold mb-4">Secure registration, KYC clarity, and verified access pathways</h1>
            <p className="text-slate-300 max-w-4xl leading-8">
              This onboarding surface translates the platform promise into a regulated, trust-building flow: registration,
              KYC/KYB, financial connection, and movement into an authorized access space for valid passes, products, merchants, and payments.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/auth/signup" className="rounded-full bg-indigo-400 text-slate-950 px-5 py-3 font-medium hover:bg-indigo-300">Open account</Link>
              <Link href="/payments/harness" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-medium hover:bg-white/15">View payment verification lane</Link>
              <Link href="/nutrition" className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-5 py-3 font-medium text-emerald-100 hover:bg-emerald-400/20">Open nutrition access lane</Link>
            </div>
          </section>

          <section className="grid xl:grid-cols-[0.32fr_0.68fr] gap-6 mb-8">
            <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-3">
              {steps.map((step, index) => (
                <button
                  key={step.key}
                  onClick={() => setActiveStep(step.key)}
                  className={`text-left rounded-2xl border px-5 py-5 transition ${activeStep === step.key ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Flow stage {index + 1}</p>
                  <h2 className="text-xl font-semibold text-slate-900">{step.title}</h2>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[1.75rem] border border-slate-200 p-8 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">Current focus</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">{current.title}</h2>
              <p className="text-slate-600 leading-8 mb-6">{current.description}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {current.items.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-6">
                <p className="text-sm text-emerald-700 mb-2">UX principles carried through this flow</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-emerald-900">
                  <div>Compliance first: GDPR, AML, and KYC requirements are visible and explained.</div>
                  <div>Trust and security: sensitive actions are paired with clear rationale and protection messaging.</div>
                  <div>Speed and usability: the journey aims to minimize friction while preserving safety and auditability.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-[1.75rem] border border-slate-200 p-8 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">KYC document step</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">Document readiness and screening visibility</h2>
              <p className="text-slate-600 leading-8 mb-6">
                The document step should reassure the user while making operational requirements obvious. This section translates abstract compliance into a clear upload-and-review state model.
              </p>
              <div className="space-y-4">
                {documentChecklist.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">{item.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-7">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[1.75rem] border border-slate-200 p-8 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">Financial connection step</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">Wallet, bank, and authorization connection model</h2>
              <p className="text-slate-600 leading-8 mb-6">
                This step explains how financial data connection works without overwhelming the user. It frames the wallet and payment layer as a secure connector, not as uncontrolled data exposure.
              </p>
              <div className="grid gap-4 mb-6">
                {connectionOptions.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900 mb-2">{item.title}</p>
                    <p className="text-sm text-slate-600 leading-7">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-6">
                <p className="text-sm text-amber-700 mb-2">Frontend messaging rule</p>
                <p className="text-sm text-amber-900 leading-7">
                  Explain why data is requested, confirm encrypted transmission, avoid exposing raw financial credentials, and prepare the user for re-authentication before any sensitive action is finalized.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
