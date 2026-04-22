'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';
import { RoleNavigation } from '../../../components/role-navigation';

type SponsorMetrics = {
  passesIssued: number;
  activePasses: number;
  redeemedPasses: number;
  partialPasses: number;
  expiredPasses: number;
  totalValue: number;
  totalRemainingBalance: number;
  totalRedeemed: number;
  beneficiariesCount: number;
  transactionsCount: number;
};

export default function SponsorDashboardPage() {
  const [metrics, setMetrics] = useState<SponsorMetrics | null>(null);
  const [passes, setPasses] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [dashboard, passList, redemptionList] = await Promise.all([
          api.getSponsorDashboard(),
          api.getSponsorPasses(),
          api.getSponsorRedemptions(),
        ]);
        setMetrics(dashboard as SponsorMetrics);
        setPasses(passList as any[]);
        setRedemptions(redemptionList as any[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load sponsor dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: 'Passes issued', value: metrics.passesIssued },
      { label: 'Active passes', value: metrics.activePasses },
      { label: 'Redeemed passes', value: metrics.redeemedPasses },
      { label: 'Total redeemed', value: `₦${metrics.totalRedeemed}` },
      { label: 'Remaining balance', value: `₦${metrics.totalRemainingBalance}` },
      { label: 'Beneficiaries', value: metrics.beneficiariesCount },
    ];
  }, [metrics]);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <RoleNavigation current="sponsor" />

        <div className="mb-8">
          <p className="text-blue-700 font-medium">Sponsor operations</p>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>

        {loading && <div className="bg-white rounded-xl p-6 shadow-sm">Loading sponsor dashboard...</div>}
        {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6">{error}</div>}

        {!loading && !error && (
          <>
            <section className="grid md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent passes</h2>
                <div className="space-y-3">
                  {passes.length === 0 && <p className="text-slate-500">No passes found yet.</p>}
                  {passes.slice(0, 6).map((pass) => (
                    <div key={pass.id} className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
                      <div>
                        <p className="font-medium text-slate-900">{pass.passIdUnique}</p>
                        <p className="text-sm text-slate-500">Status: {pass.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">₦{pass.balance}</p>
                        <p className="text-sm text-slate-500">of ₦{pass.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent redemptions</h2>
                <div className="space-y-3">
                  {redemptions.length === 0 && <p className="text-slate-500">No redemptions recorded yet.</p>}
                  {redemptions.slice(0, 6).map((tx) => (
                    <div key={tx.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">Transaction #{tx.id}</p>
                        <p className="font-semibold text-emerald-700">₦{tx.amount}</p>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Pass ID: {tx.passId}</p>
                      <p className="text-sm text-slate-500">Status: {tx.status}</p>
                      <p className="text-xs text-slate-400 mt-2 break-all">Tx hash: {tx.blockchainTxHash || 'pending bridge hash'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
