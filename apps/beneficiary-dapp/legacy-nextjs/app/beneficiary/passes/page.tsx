'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RoleNavigation } from '../../../components/role-navigation';
import { api } from '../../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export default function BeneficiaryPassesPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [onboardingSignal, setOnboardingSignal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [response, onboardingDraft] = await Promise.all([
          fetch(`${API_BASE_URL}/passes`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: 'no-store',
          }),
          api.getOnboardingDraft(),
        ]);

        const body = await response.json();
        if (!response.ok) {
          throw new Error(body?.message || 'Failed to load beneficiary passes');
        }

        setPasses(body);
        setOnboardingSignal((onboardingDraft as any)?.notificationSummary || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load beneficiary passes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toneStyles: Record<string, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    neutral: 'border-slate-200 bg-slate-50 text-slate-900',
  };

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <RoleNavigation current="beneficiary" />

        <div className="mb-8">
          <p className="text-amber-700 font-medium">Beneficiary access</p>
          <h1 className="text-3xl font-bold text-slate-900">My passes</h1>
        </div>

        {onboardingSignal && !loading && !error && (
          <div className={`rounded-2xl border p-5 mb-6 ${toneStyles[onboardingSignal.tone] || toneStyles.neutral}`}>
            <p className="font-semibold mb-1">{onboardingSignal.title}</p>
            <p className="text-sm leading-7">{onboardingSignal.message}</p>
            {onboardingSignal.actionHref && onboardingSignal.actionLabel && (
              <div className="mt-4">
                <Link href={onboardingSignal.actionHref} className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  {onboardingSignal.actionLabel}
                </Link>
              </div>
            )}
          </div>
        )}

        {loading && <div className="bg-white rounded-2xl p-6 shadow-sm">Loading passes...</div>}
        {error && <div className="bg-red-50 text-red-700 rounded-xl p-4">{error}</div>}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {passes.length === 0 && <p className="text-slate-500">No passes available yet.</p>}
            {passes.map((pass) => (
              <div key={pass.id} className="bg-white border border-amber-100 rounded-2xl shadow-sm p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700 mb-2">Pass ID</p>
                <h2 className="text-lg font-semibold text-slate-900 break-all">{pass.passIdUnique}</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Status: <span className="font-medium text-slate-900">{pass.status}</span></p>
                  <p>Value: <span className="font-medium text-slate-900">₦{pass.value}</span></p>
                  <p>Balance: <span className="font-medium text-emerald-700">₦{pass.balance}</span></p>
                  <p>Validity end: <span className="font-medium text-slate-900">{new Date(pass.validityEnd).toLocaleString()}</span></p>
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">Restrictions</p>
                  <p className="text-sm text-slate-700">
                    {pass.productRestrictions?.length ? `${pass.productRestrictions.length} product-linked access rules` : 'Open approved catalog access'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
