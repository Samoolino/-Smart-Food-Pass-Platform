'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '../../../../components/protected-route';
import { RoleNavigation } from '../../../../components/role-navigation';
import { api } from '../../../../lib/api';

export default function AdminOnboardingReviewQueuePage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<'under_review' | 'approved' | 'rejected'>('under_review');

  const load = async () => {
    try {
      const data = await api.getOnboardingReviewQueue();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load onboarding review queue');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const roleMatch = roleFilter === 'all' || item.roleVariant === roleFilter;
      const stateMatch = stateFilter === 'all' || item.reviewSummary?.reviewState === stateFilter;
      return roleMatch && stateMatch;
    });
  }, [items, roleFilter, stateFilter]);

  const toggleSelected = (userId: number) => {
    setSelectedIds((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]));
  };

  const applyBulkAction = async () => {
    const selected = filteredItems.filter((item) => selectedIds.includes(item.userId));
    if (selected.length === 0) return;
    try {
      setError('');
      setMessage('');
      for (const item of selected) {
        const target = item.roleVariant === 'beneficiary' ? 'governmentId' : 'businessVerification';
        await api.reviewOnboardingKyc(item.userId, {
          target,
          status: bulkStatus,
          note: `Bulk queue action set ${target} to ${bulkStatus}.`,
        });
      }
      setMessage(`Applied ${bulkStatus} to ${selected.length} onboarding draft(s).`);
      setSelectedIds([]);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to apply bulk action');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="admin" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 text-white p-8 mb-8">
            <p className="text-violet-300 uppercase tracking-[0.22em] text-xs mb-3">Admin onboarding operations</p>
            <h1 className="text-4xl font-bold mb-4">Bulk review queue for onboarding drafts</h1>
            <p className="text-slate-300 max-w-4xl leading-8">Filter onboarding drafts by role and review state, then apply bulk review actions before opening detailed review pages.</p>
          </section>

          {error && <div className="rounded-xl bg-red-50 text-red-700 p-4 mb-6">{error}</div>}
          {message && <div className="rounded-xl bg-emerald-50 text-emerald-700 p-4 mb-6">{message}</div>}

          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Queue size</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Needs review</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.filter((item) => item.reviewSummary?.reviewState === 'documents_uploaded' || item.reviewSummary?.reviewState === 'under_review').length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Approved</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.filter((item) => item.reviewSummary?.reviewState === 'approved').length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Changes required</p><p className="text-2xl font-bold text-slate-900 mt-2">{items.filter((item) => item.reviewSummary?.reviewState === 'rejected').length}</p></div>
          </section>

          <section className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm mb-6">
            <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
              <div>
                <label className="block text-sm text-slate-600 mb-2">Role filter</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                  <option value="all">All roles</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="merchant">Merchant</option>
                  <option value="sponsor">Sponsor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">Review state filter</label>
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                  <option value="all">All states</option>
                  <option value="draft">Draft</option>
                  <option value="documents_uploaded">Documents uploaded</option>
                  <option value="under_review">Under review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">Bulk action</label>
                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as any)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                  <option value="under_review">Set under review</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <button onClick={applyBulkAction} disabled={selectedIds.length === 0} className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white disabled:opacity-50">
                Apply to {selectedIds.length} selected
              </button>
            </div>
          </section>

          <section className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selectedIds.includes(item.userId)} onChange={() => toggleSelected(item.userId)} className="mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">{item.profile?.email || `User #${item.userId}`}</p>
                        <p className="text-sm text-slate-500 mt-1">Role: {item.roleVariant} · Step: {item.activeStep} · Status: {item.reviewSummary?.reviewState}</p>
                      </div>
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
              {filteredItems.length === 0 && <p className="text-slate-500">No onboarding drafts match the current filters.</p>}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
