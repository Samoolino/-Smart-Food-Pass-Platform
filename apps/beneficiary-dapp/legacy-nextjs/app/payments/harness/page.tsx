'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../components/protected-route';
import { RoleNavigation } from '../../../components/role-navigation';
import { api } from '../../../lib/api';

export default function PaymentsHarnessPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [intentResult, setIntentResult] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [planForm, setPlanForm] = useState({ userId: '1', sponsorId: '1', planCode: 'STAMP-CORE', planName: 'Smart Stamp Core', tier: 'standard', status: 'active', walletAddress: '' });
  const [intentForm, setIntentForm] = useState({ merchantId: '1', productId: '1', userId: '1', passId: '', amount: '5000', provider: 'simulated-pay' });

  const load = async () => {
    try {
      const [planData, settlementData] = await Promise.all([
        api.getUserPlans(),
        api.getSettlements(),
      ]);
      setPlans(planData as any[]);
      setSettlements(settlementData as any[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment harness data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPlan = async () => {
    try {
      setError('');
      setMessage('');
      await api.createUserPlan({
        userId: Number(planForm.userId),
        sponsorId: Number(planForm.sponsorId),
        planCode: planForm.planCode,
        planName: planForm.planName,
        tier: planForm.tier,
        status: planForm.status,
        walletAddress: planForm.walletAddress || undefined,
        accessRules: {
          categories: ['grains', 'protein', 'vegetables'],
          smartStamp: true,
        },
      });
      setMessage('User plan created.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to create user plan');
    }
  };

  const createIntent = async () => {
    try {
      setError('');
      setMessage('');
      const result = await api.createPaymentIntent({
        merchantId: Number(intentForm.merchantId),
        productId: Number(intentForm.productId),
        userId: Number(intentForm.userId),
        passId: intentForm.passId ? Number(intentForm.passId) : undefined,
        amount: Number(intentForm.amount),
        provider: intentForm.provider,
      });
      setIntentResult(result);
      setMessage('Payment intent simulated.');
    } catch (err: any) {
      setError(err.message || 'Failed to create payment intent');
    }
  };

  const createSettlement = async () => {
    if (!intentResult) {
      setError('Create a payment intent first.');
      return;
    }

    try {
      setError('');
      await api.createSettlement({
        merchantId: Number(intentForm.merchantId),
        productId: Number(intentForm.productId),
        userId: Number(intentForm.userId),
        passId: intentForm.passId ? Number(intentForm.passId) : undefined,
        amount: Number(intentForm.amount),
        provider: intentResult.provider,
        providerReference: intentResult.providerReference,
        settlementStatus: 'recorded',
        payerWalletAddress: intentResult.payerWalletAddress,
        payeeWalletAddress: intentResult.payeeWalletAddress,
        metadata: {
          merchantWalletAddress: intentResult.merchantWalletAddress,
          productOwnerWalletAddress: intentResult.productOwnerWalletAddress,
        },
      });
      setMessage('Settlement trace recorded.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to create settlement trace');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'sponsor', 'merchant']}>
      <main className="min-h-screen bg-cyan-50 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="payments" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white p-8 mb-8">
            <p className="text-cyan-300 uppercase tracking-[0.22em] text-xs mb-3">Payment integration harness</p>
            <h1 className="text-4xl font-bold mb-4">Wallet-aware payment simulation and settlement tracing</h1>
            <p className="text-slate-300 max-w-4xl leading-8">
              Use this frontend surface to stage user plans, generate simulated payment intents, and record settlement traces that expose merchant wallet, product-owner wallet, and payer wallet pathways.
            </p>
          </section>

          {message && <div className="bg-emerald-50 text-emerald-700 rounded-xl p-4 mb-4">{message}</div>}
          {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-4">{error}</div>}

          <section className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6 mb-8">
            <div className="bg-white rounded-[1.5rem] border border-cyan-100 p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">User plan activation</p>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Plan creation harness</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(planForm).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm text-slate-600 block mb-2">{key}</label>
                    <input value={value} onChange={(e) => setPlanForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                ))}
              </div>
              <button onClick={createPlan} className="rounded-xl bg-slate-900 text-white px-5 py-3 font-medium mt-6">Create plan</button>

              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500 mb-2">Existing plans</p>
                <div className="space-y-3 max-h-80 overflow-auto pr-1">
                  {plans.map((plan) => (
                    <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-medium text-slate-900">{plan.planName}</p>
                      <p className="text-sm text-slate-500">{plan.planCode} · {plan.status}</p>
                    </div>
                  ))}
                  {plans.length === 0 && <p className="text-slate-500">No plans recorded yet.</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-cyan-100 p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Provider simulation</p>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Payment intent and settlement trace</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(intentForm).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm text-slate-600 block mb-2">{key}</label>
                    <input value={value} onChange={(e) => setIntentForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={createIntent} className="rounded-xl bg-cyan-600 text-white px-5 py-3 font-medium">Generate test intent</button>
                <button onClick={createSettlement} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700">Record settlement trace</button>
              </div>

              {intentResult && (
                <div className="mt-6 rounded-2xl bg-cyan-50 border border-cyan-100 p-4">
                  <p className="text-sm text-cyan-700 mb-2">Intent routing definition</p>
                  <div className="space-y-1 text-sm text-cyan-900 break-all">
                    <p>Provider: {intentResult.provider}</p>
                    <p>Reference: {intentResult.providerReference}</p>
                    <p>Payer wallet: {intentResult.payerWalletAddress || 'not mapped'}</p>
                    <p>Payee wallet: {intentResult.payeeWalletAddress || 'not mapped'}</p>
                    <p>Merchant wallet: {intentResult.merchantWalletAddress || 'not mapped'}</p>
                    <p>Product owner wallet: {intentResult.productOwnerWalletAddress || 'not mapped'}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500 mb-2">Settlement trace log</p>
                <div className="space-y-3 max-h-80 overflow-auto pr-1">
                  {settlements.map((settlement) => (
                    <div key={settlement.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-slate-900">{settlement.provider || 'simulated-pay'}</p>
                        <p className="font-semibold text-slate-900">₦{settlement.amount}</p>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{settlement.settlementStatus} · {settlement.providerReference || 'no-ref'}</p>
                    </div>
                  ))}
                  {settlements.length === 0 && <p className="text-slate-500">No settlement traces recorded yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
