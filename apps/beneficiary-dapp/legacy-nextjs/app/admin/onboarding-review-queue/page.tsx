'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../../components/protected-route';
import { RoleNavigation } from '../../../../components/role-navigation';
import { api } from '../../../../lib/api';

export default function AdminOnboardingReviewQueuePage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getOnboardingReviewQueue();
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load onboarding review queue');
      }
    };
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="admin" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 text-white p-8 mb-8">
            <p className="text-violet-300 uppercase tracking-[0.22em] text-xs mb-3">Admin onboarding operations</p>
            <h1 className="text-4xl font-bold mb-4">Bulk review queue for onboarding drafts</h1>
            <p className="text-slate-300 max-w-4xl leading-8">Review all onboarding drafts in one place, prioritize by role and review state, then jump into the detailed review dashboard for action.</p>
          </section>

          {error && <div className="rounded-xl bg-red-50 text-red-700 p-4 mb-6">{error}</div>}

          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Queue size</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Needs review</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.filter((item) => item.reviewSummary?.reviewState === 'documents_uploaded' || item.reviewSummary?.reviewState === 'under_review').length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Approved</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.filter((item) => item.reviewSummary?.reviewState === 'approved').length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Changes required</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.filter((item) => item.reviewSummary?.reviewState === 'rejected').length}</p></div>
          </section>

          <section className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.profile?.email || `User #${item.userId}`}</p>
                      <p className="text-sm text-slate-500 mt-1">Role: {item.roleVariant} · Step: {item.activeStep} · Status: {item.reviewSummary?.reviewState}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Uploaded / Approved</p>
                      <p className="text-xl font-semibold text-slate-900">{item.reviewSummary?.uploadedCount || 0} / {item.reviewSummary?.approvedCount || 0}</p>
                    </div>
                  </div>
                  {item.notificationSummary?.message && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{item.notificationSummary.message}</div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Link href="/onboarding/review" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Open review dashboard</Link>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-slate-500">No onboarding drafts are currently in the queue.</p>}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
