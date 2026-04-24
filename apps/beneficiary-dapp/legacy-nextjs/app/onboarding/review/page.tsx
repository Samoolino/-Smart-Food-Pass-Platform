'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '../../../components/protected-route';
import { RoleNavigation } from '../../../components/role-navigation';
import { api } from '../../../lib/api';

const roleCards: Record<string, string[]> = {
  beneficiary: [
    'Complete core identity review before pass access is treated as ready.',
    'Approved documents strengthen beneficiary product and nutrition access pathways.',
    'At least one valid financial pathway should be visible before activation.',
  ],
  merchant: [
    'Merchants require business verification before registry and redemption readiness.',
    'Merchant wallet readiness supports settlement and registry workflows.',
    'Operational approval depends on KYB and review checkpoints.',
  ],
  sponsor: [
    'Sponsors should complete identity review and financial linkage before funded flows unlock.',
    'Draft status informs governance readiness and beneficiary oversight posture.',
    'Sponsor completion should lead into plan governance and issuance visibility.',
  ],
};

export default function OnboardingReviewPage() {
  const [draft, setDraft] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [profileData, draftData] = await Promise.all([api.getProfile(), api.getOnboardingDraft()]);
      setProfile(profileData);
      setDraft(draftData);
    } catch (err: any) {
      setError(err.message || 'Failed to load onboarding review dashboard');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const roleVariant = (draft?.roleVariant || profile?.role || 'beneficiary') as 'beneficiary' | 'merchant' | 'sponsor';
  const reviewSummary = draft?.reviewSummary || { reviewState: 'draft', approvedCount: 0, uploadedCount: 0, reviewNotes: [] };
  const kyc = draft?.kyc || {};
  const fileRows = [
    { key: 'governmentId', label: 'Government ID', meta: kyc.governmentIdMeta, fileName: kyc.governmentIdFileName },
    { key: 'proofOfAddress', label: 'Proof of address', meta: kyc.proofOfAddressMeta, fileName: kyc.proofOfAddressFileName },
    { key: 'businessVerification', label: 'Business verification', meta: kyc.businessVerificationMeta, fileName: kyc.businessVerificationFileName },
  ].filter((row) => row.fileName || row.meta);
  const cards = useMemo(() => roleCards[roleVariant] || roleCards.beneficiary, [roleVariant]);
  const isAdminReviewer = profile?.role === 'admin' || profile?.role === 'super_admin';

  const review = async (target: 'governmentId' | 'proofOfAddress' | 'businessVerification', status: 'approved' | 'rejected' | 'under_review') => {
    if (!draft?.userId) return;
    try {
      setError('');
      const updated = await api.reviewOnboardingKyc(draft.userId, { target, status, note: `${target} marked ${status}.` });
      setDraft(updated);
      setMessage(`${target} marked ${status}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update review state');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'sponsor', 'merchant', 'beneficiary']}>
      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="onboarding" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white p-8 mb-8">
            <p className="text-cyan-300 uppercase tracking-[0.22em] text-xs mb-3">Onboarding review dashboard</p>
            <h1 className="text-4xl font-bold mb-4">Role-specific draft completion and review states</h1>
            <p className="text-slate-300 max-w-4xl leading-8">See uploaded KYC metadata, validation states, and role-specific completion guidance for the current onboarding draft.</p>
          </section>

          {error && <div className="rounded-xl bg-red-50 text-red-700 p-4 mb-6">{error}</div>}
          {message && <div className="rounded-xl bg-emerald-50 text-emerald-700 p-4 mb-6">{message}</div>}

          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Role variant</p><p className="text-2xl font-bold text-slate-900 mt-2 capitalize">{roleVariant}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Review state</p><p className="text-2xl font-bold text-slate-900 mt-2">{reviewSummary.reviewState}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Uploaded docs</p><p className="text-2xl font-bold text-slate-900 mt-2">{reviewSummary.uploadedCount}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Approved docs</p><p className="text-2xl font-bold text-slate-900 mt-2">{reviewSummary.approvedCount}</p></div>
          </section>

          <section className="grid xl:grid-cols-[0.58fr_0.42fr] gap-6">
            <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500 mb-2">KYC file metadata and validation states</p>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Document review table</h2>
              <div className="space-y-4">
                {fileRows.map((row) => (
                  <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-semibold text-slate-900">{row.label}</p>
                      <span className="rounded-full bg-cyan-100 text-cyan-700 px-3 py-1 text-xs font-medium">{row.meta?.validationStatus || 'pending'}</span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 break-all">
                      <p>File: {row.fileName || row.meta?.fileName || 'not provided'}</p>
                      {row.meta?.uploadedAt && <p>Uploaded: {new Date(row.meta.uploadedAt).toLocaleString()}</p>}
                      {row.meta?.reviewerNote && <p>Reviewer note: {row.meta.reviewerNote}</p>}
                    </div>
                    {isAdminReviewer && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button onClick={() => review(row.key as any, 'under_review')} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">Under review</button>
                        <button onClick={() => review(row.key as any, 'approved')} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Approve</button>
                        <button onClick={() => review(row.key as any, 'rejected')} className="rounded-full bg-red-600 px-3 py-2 text-xs font-medium text-white">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                {fileRows.length === 0 && <p className="text-slate-500">No KYC files are recorded in the draft yet.</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
                <p className="text-sm text-slate-500 mb-2">Role-specific completion dashboard</p>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 capitalize">{roleVariant} readiness</h2>
                <div className="space-y-3">
                  {cards.map((card) => (
                    <div key={card} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{card}</div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
                <p className="text-sm text-slate-500 mb-2">Draft review notes</p>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Review checklist</h2>
                <div className="space-y-3">
                  {(reviewSummary.reviewNotes || []).map((note: string) => (
                    <div key={note} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{note}</div>
                  ))}
                  {(!reviewSummary.reviewNotes || reviewSummary.reviewNotes.length === 0) && <p className="text-slate-500">No review notes are attached yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
