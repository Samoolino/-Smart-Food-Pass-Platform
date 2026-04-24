'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { RoleNavigation } from '../../components/role-navigation';
import { api } from '../../lib/api';

export default function NutritionPage() {
  const [userId, setUserId] = useState('1');
  const [passId, setPassId] = useState('');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => {
    const items = data?.accessible || [];
    const categories = new Set(items.map((item: any) => item?.category || item?.metadata?.category || 'uncategorized'));
    return { total: items.length, categories: categories.size, plans: data?.plans?.length || 0 };
  }, [data]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.getAccessibleMarketplace(Number(userId), passId ? Number(passId) : undefined);
      setData(result as any);
    } catch (err: any) {
      setError(err.message || 'Failed to load nutrition workspace');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'sponsor', 'beneficiary']}>
      <main className="min-h-screen bg-amber-50 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <RoleNavigation current="nutrition" />

          <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 text-white p-8 mb-8">
            <p className="text-amber-300 uppercase tracking-[0.22em] text-xs mb-3">Nutritional intelligence</p>
            <h1 className="text-4xl font-bold mb-4">Product access guidance tied to plans and passes</h1>
            <p className="text-slate-300 max-w-4xl leading-8">
              Resolve accessible products from the marketplace using a user and an optional pass. This workspace keeps plan-based access and registry visibility in one place.
            </p>
          </section>

          <section className="grid xl:grid-cols-[0.4fr_0.6fr] gap-6">
            <div className="bg-white rounded-[1.5rem] border border-amber-100 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Eligibility resolver</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 block mb-2">User ID</label>
                  <input value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 block mb-2">Pass ID (optional)</label>
                  <input value={passId} onChange={(e) => setPassId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                </div>
                <button onClick={load} className="rounded-xl bg-slate-900 text-white px-5 py-3 font-medium">Load nutrition access</button>
              </div>
              {error && <div className="mt-4 rounded-xl bg-red-50 text-red-700 p-4">{error}</div>}
            </div>

            <div className="bg-white rounded-[1.5rem] border border-amber-100 p-6 shadow-sm">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">Plans</p><p className="text-2xl font-bold text-slate-900 mt-2">{loading ? '—' : summary.plans}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">Eligible products</p><p className="text-2xl font-bold text-slate-900 mt-2">{loading ? '—' : summary.total}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">Category groups</p><p className="text-2xl font-bold text-slate-900 mt-2">{loading ? '—' : summary.categories}</p></div>
              </div>

              {data?.guidance?.nutritionSupplyChain && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-6">
                  <p className="text-sm text-emerald-800 mb-2">Supply chain guidance</p>
                  <p className="text-sm text-emerald-900 leading-7">{data.guidance.nutritionSupplyChain}</p>
                </div>
              )}

              <div className="space-y-4 max-h-[700px] overflow-auto pr-1">
                {(data?.accessible || []).map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">Registry #{item.id}</p>
                        <p className="text-sm text-slate-500 mt-1">Merchant #{item.merchantId} · Product #{item.productId}</p>
                      </div>
                      <p className="text-xl font-semibold text-slate-900">₦{item.price}</p>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-500 break-all">
                      <p>Merchant wallet: {item.merchantWalletAddress || 'not mapped'}</p>
                      <p>Owner wallet: {item.productOwnerWalletAddress || 'not mapped'}</p>
                    </div>
                  </div>
                ))}
                {!loading && !data && <p className="text-slate-500">No nutrition access data loaded yet.</p>}
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
