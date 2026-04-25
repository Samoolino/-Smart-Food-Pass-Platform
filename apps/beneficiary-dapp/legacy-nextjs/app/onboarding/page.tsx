'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { RoleNavigation } from '../../components/role-navigation';
import { api } from '../../lib/api';

const ONBOARDING_STORAGE_KEY = 'smartfoodpass:onboarding-state';

const steps = [
  { key: 'account', title: 'Registration & account creation', description: 'Create a personalized, secure space with email, phone number, password, and role-aware account setup. Touch ID, Face ID, PIN, or 2FA prompts are introduced early to build trust.', items: ['Email and phone collection', 'Password setup', 'Role and account purpose', '2FA / biometric readiness'] },
  { key: 'kyc', title: 'Onboarding & KYC/KYB compliance', description: 'Guide the user through identity verification, proof of address, screening questions, and reassurance messaging that explains why every document is required.', items: ['Government ID upload', 'Proof of address', 'PEP / risk assessment', 'GDPR / AML reassurance'] },
  { key: 'finance', title: 'Financial data connection', description: 'Prepare the secure linking of wallets, bank accounts, and cards with transparent messaging about encryption, transmission, and why connection is needed.', items: ['Wallet linkage', 'Bank / card connection', 'Encrypted transmission notice', 'Verification checkpoints'] },
  { key: 'access', title: 'Authorized access space', description: 'Once verified, the user moves into a controlled account zone where valid passes, QR/stamp utilities, approved products, merchants, and payment authorization pathways are visible.', items: ['Valid pass visibility', 'Authorized merchant access', 'Plan-aware product access', 'Payment verification readiness'] },
] as const;

const documentChecklist = [
  { key: 'governmentId', name: 'Government ID', status: 'Ready for upload', note: 'Passport, national ID, or drivers license accepted.' },
  { key: 'proofOfAddress', name: 'Proof of address', status: 'Required', note: 'Utility bill, bank statement, or approved address record.' },
  { key: 'businessVerification', name: 'Business verification', status: 'Conditional', note: 'Shown for merchant and sponsor entities where KYB applies.' },
  { key: 'riskScreening', name: 'Risk screening', status: 'In flow', note: 'PEP and sanctions prompts are handled inside guided steps.' },
] as const;

const roleVariantContent: Record<string, { title: string; bullets: string[] }> = {
  beneficiary: { title: 'Beneficiary onboarding variant', bullets: ['Focus on pass access, QR/stamp visibility, and approved merchant/product access.', 'Guide food-access trust, document clarity, and final payment authorization readiness.', 'Keep product recommendation and nutrition guidance visible early.'] },
  merchant: { title: 'Merchant onboarding variant', bullets: ['Emphasize KYB, business verification, merchant wallet routing, and registry publishing readiness.', 'Prepare redemption, inventory, provider, and settlement tracing workflows.', 'Highlight approval checkpoints before merchant activation.'] },
  sponsor: { title: 'Sponsor onboarding variant', bullets: ['Emphasize donor or sponsor identity, funding intent, and utility-value conversion into plans or stamps.', 'Prepare sponsor wallet linkage, plan governance, and beneficiary oversight.', 'Show sponsor analytics and compliance framing for funded flows.'] },
};

type StepKey = (typeof steps)[number]['key'];
type RoleVariant = 'beneficiary' | 'merchant' | 'sponsor';
type NotificationSummary = { tone: 'success' | 'warning' | 'info' | 'neutral'; title: string; message: string } | null;
type OnboardingState = {
  activeStep: StepKey;
  account: { fullName: string; email: string; phone: string; role: RoleVariant; security: string[] };
  kyc: { governmentIdFileName: string; proofOfAddressFileName: string; businessVerificationFileName: string; pepStatus: string; consentChecked: boolean; businessVerificationRequired?: boolean };
  finance: { walletAddress: string; bankConnectionStatus: string; cardConnectionStatus: string; authorizationMode: string };
  roleVariant: RoleVariant;
  completionStatus: string;
};

const initialState: OnboardingState = {
  activeStep: 'account',
  account: { fullName: '', email: '', phone: '', role: 'beneficiary', security: ['2FA'] },
  kyc: { governmentIdFileName: '', proofOfAddressFileName: '', businessVerificationFileName: '', pepStatus: 'pending', consentChecked: false },
  finance: { walletAddress: '', bankConnectionStatus: 'not_connected', cardConnectionStatus: 'not_connected', authorizationMode: 'biometric' },
  roleVariant: 'beneficiary',
  completionStatus: 'draft',
};

function readStoredState(): OnboardingState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed, account: { ...initialState.account, ...(parsed.account || {}) }, kyc: { ...initialState.kyc, ...(parsed.kyc || {}) }, finance: { ...initialState.finance, ...(parsed.finance || {}) } };
  } catch {
    return initialState;
  }
}

export default function OnboardingPage() {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'loading' | 'local' | 'synced' | 'syncing' | 'error'>('loading');
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary>(null);

  useEffect(() => {
    const localState = readStoredState();
    setState(localState);
    setHydrated(true);

    const loadRemote = async () => {
      try {
        const [profile, draft] = await Promise.all([api.getProfile(), api.getOnboardingDraft()]);
        setState((current) => ({
          ...current,
          activeStep: draft?.activeStep || current.activeStep,
          roleVariant: (draft?.roleVariant || profile?.role || current.roleVariant) as RoleVariant,
          completionStatus: draft?.completionStatus || current.completionStatus,
          account: {
            ...current.account,
            fullName: current.account.fullName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim(),
            email: current.account.email || profile?.email || '',
            phone: current.account.phone || profile?.phone || '',
            role: (draft?.account?.role || profile?.role || current.account.role) as RoleVariant,
            security: draft?.account?.security || current.account.security,
          },
          kyc: { ...current.kyc, ...(draft?.kyc || {}) },
          finance: { ...current.finance, walletAddress: draft?.finance?.walletAddress || profile?.walletAddress || current.finance.walletAddress, bankConnectionStatus: draft?.finance?.bankConnectionStatus || current.finance.bankConnectionStatus, cardConnectionStatus: draft?.finance?.cardConnectionStatus || current.finance.cardConnectionStatus, authorizationMode: draft?.finance?.authorizationMode || current.finance.authorizationMode },
        }));
        setNotificationSummary(draft?.notificationSummary || null);
        setSyncStatus('synced');
      } catch {
        setSyncStatus('local');
      }
    };

    loadRemote();
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = setTimeout(async () => {
      try {
        setSyncStatus((current) => (current === 'loading' ? 'loading' : 'syncing'));
        const updatedDraft = await api.updateOnboardingDraft({ activeStep: state.activeStep, account: state.account, kyc: state.kyc, finance: state.finance, roleVariant: state.roleVariant, completionStatus: state.completionStatus });
        await api.updateProfile({ phone: state.account.phone || undefined, walletAddress: state.finance.walletAddress || undefined });
        setNotificationSummary(updatedDraft?.notificationSummary || null);
        setSyncStatus('synced');
      } catch {
        setSyncStatus((current) => (current === 'loading' ? 'local' : 'error'));
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [hydrated, state]);

  const current = useMemo(() => steps.find((step) => step.key === state.activeStep) || steps[0], [state.activeStep]);
  const activeIndex = steps.findIndex((step) => step.key === state.activeStep);
  const uploadedCount = [state.kyc.governmentIdFileName, state.kyc.proofOfAddressFileName, state.kyc.businessVerificationFileName].filter(Boolean).length;
  const financialLinksReady = [state.finance.walletAddress, state.finance.bankConnectionStatus !== 'not_connected' ? 'bank' : '', state.finance.cardConnectionStatus !== 'not_connected' ? 'card' : ''].filter(Boolean).length;
  const variant = roleVariantContent[state.roleVariant];

  const updateState = (updater: (currentState: OnboardingState) => OnboardingState) => setState((currentState) => updater(currentState));
  const toggleSecurity = (value: string) => updateState((currentState) => ({ ...currentState, account: { ...currentState.account, security: currentState.account.security.includes(value) ? currentState.account.security.filter((item) => item !== value) : [...currentState.account.security, value] } }));
  const setUploadedFileName = (field: 'governmentIdFileName' | 'proofOfAddressFileName' | 'businessVerificationFileName', fileName: string) => updateState((currentState) => ({ ...currentState, kyc: { ...currentState.kyc, [field]: fileName } }));
  const moveStep = (direction: 'next' | 'previous') => {
    const nextIndex = direction === 'next' ? Math.min(activeIndex + 1, steps.length - 1) : Math.max(activeIndex - 1, 0);
    updateState((currentState) => ({ ...currentState, activeStep: steps[nextIndex].key }));
  };

  const stageStatusSummary = {
    account: state.account.email && state.account.phone ? 'Ready' : 'Needs details',
    kyc: uploadedCount >= 2 && state.kyc.consentChecked ? 'In review' : 'Needs uploads',
    finance: financialLinksReady >= 2 ? 'Connected' : 'Needs linking',
    access: state.kyc.consentChecked && financialLinksReady >= 1 ? 'Prepared' : 'Pending prerequisites',
  } as const;

  const notificationToneStyles: Record<string, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    neutral: 'border-slate-200 bg-slate-50 text-slate-900',
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'sponsor', 'merchant', 'beneficiary']}>
      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="onboarding" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-indigo-300 uppercase tracking-[0.22em] text-xs mb-3">Onboarding and trust design</p>
                <h1 className="text-4xl font-bold mb-4">Secure registration, KYC clarity, and verified access pathways</h1>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">Draft sync: {syncStatus}</div>
            </div>
            <p className="text-slate-300 max-w-4xl leading-8">This onboarding surface now syncs with backend onboarding drafts and profile data, while still preserving local continuity if the network is unavailable.</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/auth/signup" className="rounded-full bg-indigo-400 text-slate-950 px-5 py-3 font-medium hover:bg-indigo-300">Open account</Link>
              <Link href="/payments/harness" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-medium hover:bg-white/15">View payment verification lane</Link>
              <Link href="/onboarding/review" className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 font-medium text-cyan-100 hover:bg-cyan-400/20">Open review dashboard</Link>
              <Link href="/nutrition" className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-5 py-3 font-medium text-emerald-100 hover:bg-emerald-400/20">Open nutrition access lane</Link>
            </div>
          </section>

          {notificationSummary && (
            <section className={`rounded-2xl border p-5 mb-8 ${notificationToneStyles[notificationSummary.tone] || notificationToneStyles.neutral}`}>
              <p className="text-sm font-semibold mb-1">{notificationSummary.title}</p>
              <p className="text-sm leading-7">{notificationSummary.message}</p>
            </section>
          )}

          <section className="grid xl:grid-cols-[0.32fr_0.68fr] gap-6 mb-8">
            <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-3">
              {steps.map((step, index) => (
                <button key={step.key} onClick={() => updateState((currentState) => ({ ...currentState, activeStep: step.key }))} className={`text-left rounded-2xl border px-5 py-5 transition ${state.activeStep === step.key ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between gap-3 mb-2"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Flow stage {index + 1}</p><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">{stageStatusSummary[step.key]}</span></div>
                  <h2 className="text-xl font-semibold text-slate-900">{step.title}</h2>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[1.75rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Current focus</p>
                  <h2 className="text-3xl font-semibold text-slate-900">{current.title}</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Saved progress: {hydrated ? 'On' : 'Loading'}</div>
              </div>
              <p className="text-slate-600 leading-8 mb-6">{current.description}</p>

              <div className="rounded-[1.5rem] border border-indigo-100 bg-indigo-50 p-6 mb-6">
                <p className="text-sm text-indigo-700 mb-2">Role-specific onboarding variant</p>
                <div className="flex flex-wrap gap-3 mb-4">{(['beneficiary', 'merchant', 'sponsor'] as RoleVariant[]).map((role) => <button key={role} onClick={() => updateState((currentState) => ({ ...currentState, roleVariant: role, account: { ...currentState.account, role } }))} className={`rounded-full px-4 py-2 text-sm font-medium ${state.roleVariant === role ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>{role}</button>)}</div>
                <p className="font-semibold text-slate-900 mb-3">{variant.title}</p>
                <div className="grid md:grid-cols-3 gap-3 text-sm text-slate-700">{variant.bullets.map((bullet) => <div key={bullet} className="rounded-2xl border border-indigo-100 bg-white p-4">{bullet}</div>)}</div>
              </div>

              {state.activeStep === 'account' && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div><label htmlFor="full-name" className="block text-sm text-slate-600 mb-2">Full name</label><input id="full-name" value={state.account.fullName} onChange={(e) => updateState((currentState) => ({ ...currentState, account: { ...currentState.account, fullName: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Enter full name" /></div>
                  <div><label htmlFor="email" className="block text-sm text-slate-600 mb-2">Email</label><input id="email" value={state.account.email} onChange={(e) => updateState((currentState) => ({ ...currentState, account: { ...currentState.account, email: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="name@example.com" /></div>
                  <div><label htmlFor="phone" className="block text-sm text-slate-600 mb-2">Phone number</label><input id="phone" value={state.account.phone} onChange={(e) => updateState((currentState) => ({ ...currentState, account: { ...currentState.account, phone: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="+234..." /></div>
                  <div><label htmlFor="role" className="block text-sm text-slate-600 mb-2">Account role</label><select id="role" value={state.account.role} onChange={(e) => updateState((currentState) => ({ ...currentState, roleVariant: e.target.value as RoleVariant, account: { ...currentState.account, role: e.target.value as RoleVariant } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="beneficiary">Beneficiary</option><option value="merchant">Merchant</option><option value="sponsor">Sponsor</option></select></div>
                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-medium text-slate-900 mb-3">Security setup</p><div className="flex flex-wrap gap-3">{['2FA', 'PIN', 'Touch ID', 'Face ID'].map((option) => { const checked = state.account.security.includes(option); return <label key={option} className={`rounded-full border px-4 py-2 text-sm cursor-pointer ${checked ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600'}`}><input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleSecurity(option)} />{option}</label>; })}</div></div>
                </div>
              )}

              {state.activeStep === 'kyc' && (
                <div className="space-y-4 mb-6">
                  {documentChecklist.map((item) => {
                    const fieldMap = { governmentId: state.kyc.governmentIdFileName, proofOfAddress: state.kyc.proofOfAddressFileName, businessVerification: state.kyc.businessVerificationFileName, riskScreening: state.kyc.consentChecked ? 'Confirmed in flow' : '' } as const;
                    const inputMap = { governmentId: 'government-id-upload', proofOfAddress: 'proof-of-address-upload', businessVerification: 'business-verification-upload' } as const;
                    const isBusinessItemHidden = item.key === 'businessVerification' && state.roleVariant === 'beneficiary';
                    if (isBusinessItemHidden) return null;
                    return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center justify-between gap-4 mb-2"><p className="font-semibold text-slate-900">{item.name}</p><span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">{fieldMap[item.key as keyof typeof fieldMap] ? 'Uploaded / confirmed' : item.status}</span></div><p className="text-sm text-slate-600 leading-7 mb-4">{item.note}</p>{item.key !== 'riskScreening' ? <div><label htmlFor={inputMap[item.key as keyof typeof inputMap]} className="block text-sm text-slate-600 mb-2">Upload {item.name}</label><input id={inputMap[item.key as keyof typeof inputMap]} type="file" onChange={(e) => { const fileName = e.target.files?.[0]?.name || ''; if (item.key === 'governmentId') setUploadedFileName('governmentIdFileName', fileName); if (item.key === 'proofOfAddress') setUploadedFileName('proofOfAddressFileName', fileName); if (item.key === 'businessVerification') setUploadedFileName('businessVerificationFileName', fileName); }} className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm" />{fieldMap[item.key as keyof typeof fieldMap] && <p className="text-xs text-emerald-700 mt-2">Saved file: {fieldMap[item.key as keyof typeof fieldMap]}</p>}</div> : <div className="grid md:grid-cols-2 gap-4"><div><label htmlFor="pep-status" className="block text-sm text-slate-600 mb-2">PEP / screening status</label><select id="pep-status" value={state.kyc.pepStatus} onChange={(e) => updateState((currentState) => ({ ...currentState, kyc: { ...currentState.kyc, pepStatus: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="pending">Pending declaration</option><option value="clear">Clear</option><option value="review_required">Review required</option></select></div><label className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 flex items-start gap-3"><input type="checkbox" checked={state.kyc.consentChecked} onChange={(e) => updateState((currentState) => ({ ...currentState, kyc: { ...currentState.kyc, consentChecked: e.target.checked } }))} className="mt-1" />I understand why these documents are required and consent to secure verification handling.</label></div>}</div>;
                  })}
                </div>
              )}

              {state.activeStep === 'finance' && (
                <div className="grid gap-4 mb-6">
                  <div><label htmlFor="wallet-address" className="block text-sm text-slate-600 mb-2">Wallet address</label><input id="wallet-address" value={state.finance.walletAddress} onChange={(e) => updateState((currentState) => ({ ...currentState, finance: { ...currentState.finance, walletAddress: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="0x..." /></div>
                  <div className="grid md:grid-cols-2 gap-4"><div><label htmlFor="bank-connection-status" className="block text-sm text-slate-600 mb-2">Bank connection status</label><select id="bank-connection-status" value={state.finance.bankConnectionStatus} onChange={(e) => updateState((currentState) => ({ ...currentState, finance: { ...currentState.finance, bankConnectionStatus: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="not_connected">Not connected</option><option value="pending_review">Pending review</option><option value="verified">Verified</option></select></div><div><label htmlFor="card-connection-status" className="block text-sm text-slate-600 mb-2">Card connection status</label><select id="card-connection-status" value={state.finance.cardConnectionStatus} onChange={(e) => updateState((currentState) => ({ ...currentState, finance: { ...currentState.finance, cardConnectionStatus: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="not_connected">Not connected</option><option value="pending_review">Pending review</option><option value="verified">Verified</option></select></div></div>
                  <div><label htmlFor="authorization-mode" className="block text-sm text-slate-600 mb-2">Final authorization mode</label><select id="authorization-mode" value={state.finance.authorizationMode} onChange={(e) => updateState((currentState) => ({ ...currentState, finance: { ...currentState.finance, authorizationMode: e.target.value } }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="biometric">Biometric</option><option value="pin">PIN</option><option value="2fa">Two-factor authentication</option></select></div>
                </div>
              )}

              {state.activeStep === 'access' && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm text-slate-500 mb-2">Authorized access space</p><p className="text-lg font-semibold text-slate-900 mb-2">Valid passes and product access</p><p className="text-sm text-slate-600 leading-7">Verified users move into controlled access where passes, QR/stamp utilities, approved products, and payment approval checkpoints become visible.</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm text-slate-500 mb-2">Readiness snapshot</p><div className="space-y-2 text-sm text-slate-700"><p>Uploaded documents: {uploadedCount}</p><p>Financial links ready: {financialLinksReady}</p><p>Authorization mode: {state.finance.authorizationMode}</p></div></div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <button onClick={() => moveStep('previous')} disabled={activeIndex === 0} className="rounded-full border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous step</button>
                <div className="text-sm text-slate-500">Progress saved locally and synced to your onboarding draft when authenticated.</div>
                <button onClick={() => moveStep('next')} disabled={activeIndex === steps.length - 1} className="rounded-full bg-slate-900 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Continue onboarding</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
