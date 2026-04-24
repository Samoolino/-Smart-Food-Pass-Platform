'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RoleNavigation } from '../../components/role-navigation';
import { api } from '../../lib/api';

export default function MarketplacePage() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [accessible, setAccessible] = useState<any | null>(null);
  const [userId, setUserId] = useState('1');
  const [passId, setPassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [registryData, categoryData] = await Promise.all([
          api.getMarketplaceRegistry(),
          api.getProductCategories(),
        ]);
        setRegistry(registryData as any[]);
        setCategories(categoryData as string[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load marketplace');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const loadAccessible = async () => {
    try {
      setError('');
      const result = await api.getAccessibleMarketplace(Number(userId), passId ? Number(passId) : undefined);
      setAccessible(result as any);
    } catch (err: any) {
      setError(err.message || 'Failed to load accessible registry');
      setAccessible(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <RoleNavigation current="marketplace" />

        <section className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-8 mb-8">
          <p className="text-amber-300 uppercase tracking-[0.22em] text-xs mb-3">Marketplace operations</p>
          <h1 className="text-4xl font-bold mb-4">Product marketplace, merchant registry, and smart-stamp access visibility</h1>
          <p className="text-slate-300 max-w-4xl leading-8">
            This surface shows how approved products, merchant-linked offerings, plan-aware access rules,
            pass restrictions, and wallet pathways combine into a usable product marketplace.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/merchant/registry" className="rounded-full bg-amber-400 text-slate-950 px-5 py-3 font-medium hover:bg-amber-300">
              Open merchant registry workspace
            </Link>
            <Link href="/payments/harness" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-medium hover:bg-white/15">
              Review payment harness
            </Link>
          </div>
        </section>

        <section className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
          <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm">Registry-linked offers</p>
                <h2 className="text-2xl font-semibold text-slate-900">Marketplace indicators</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Active registry records</p>
                <p className="text-3xl font-bold text-slate-900">{loading ? '—' : registry.length}</p>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-4">{error}</div>}

            <div className="grid md:grid-cols-2 gap-4">
              {registry.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">Merchant #{item.merchantId} · Product #{item.productId}</p>
                  <p className="text-xl font-semibold text-slate-900">₦{item.price}</p>
                  <p className="text-sm text-slate-600 mt-2">Inventory: {item.inventoryQty}</p>
                  <p className="text-xs text-slate-500 mt-3 break-all">Merchant wallet: {item.merchantWalletAddress || 'not mapped'}</p>
                  <p className="text-xs text-slate-500 break-all">Owner wallet: {item.productOwnerWalletAddress || 'not mapped'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Access resolution</p>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Plan + pass aware product access</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 block mb-2">User ID</label>
                <input value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-2">Pass ID (optional)</label>
                <input value={passId} onChange={(e) => setPassId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
              </div>
              <button onClick={loadAccessible} className="rounded-xl bg-slate-900 text-white px-5 py-3 font-medium">Resolve accessible registry</button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-2">Tracked categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span key={category} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-sm text-slate-700">{category}</span>
                ))}
              </div>
            </div>

            {accessible && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-sm text-emerald-800 mb-2">Nutritional supply chain guidance</p>
                  <p className="text-sm text-emerald-900 leading-7">{accessible.guidance?.nutritionSupplyChain}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-500 mb-2">Accessible registry count</p>
                  <p className="text-2xl font-bold text-slate-900">{accessible.accessible?.length || 0}</p>
                  <p className="text-sm text-slate-600 mt-2">Plans in force: {accessible.plans?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
