'use client';

import { useEffect, useState } from 'react';
import { RoleNavigation } from '../../../components/role-navigation';
import { api } from '../../../lib/api';

export default function MerchantRegistryPage() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [form, setForm] = useState({
    merchantId: '1',
    productId: '1',
    price: '0',
    inventoryQty: '0',
    merchantWalletAddress: '',
    productOwnerWalletAddress: '',
    paymentProvider: 'simulated-pay',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadRegistry = async () => {
    try {
      setLoading(true);
      const data = await api.getMarketplaceRegistry(form.merchantId ? Number(form.merchantId) : undefined);
      setRegistry(data as any[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load merchant registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistry();
  }, []);

  const createRegistryRecord = async () => {
    try {
      setError('');
      setMessage('');
      await api.createMerchantRegistry({
        merchantId: Number(form.merchantId),
        productId: Number(form.productId),
        price: Number(form.price),
        inventoryQty: Number(form.inventoryQty),
        merchantWalletAddress: form.merchantWalletAddress || undefined,
        productOwnerWalletAddress: form.productOwnerWalletAddress || undefined,
        paymentProvider: form.paymentProvider || undefined,
      });
      setMessage('Registry record created.');
      await loadRegistry();
    } catch (err: any) {
      setError(err.message || 'Failed to create registry record');
    }
  };

  return (
    <main className="min-h-screen bg-emerald-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <RoleNavigation current="marketplace" />

        <section className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="bg-white rounded-[1.5rem] border border-emerald-100 p-6 shadow-sm">
            <p className="text-emerald-700 text-sm mb-1">Merchant operations</p>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Registry publishing workspace</h1>
            <p className="text-slate-600 leading-8 mb-6">
              Publish merchant-linked products with inventory, pricing, merchant wallet routing, owner wallet routing,
              and payment-provider metadata so the marketplace layer becomes operationally visible.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(form).map(([key, value]) => (
                <div key={key} className={key === 'paymentProvider' ? 'md:col-span-2' : ''}>
                  <label className="text-sm text-slate-600 block mb-2">{key}</label>
                  <input
                    value={value}
                    onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>
              ))}
            </div>

            {message && <div className="mt-4 rounded-xl bg-emerald-50 text-emerald-700 p-4">{message}</div>}
            {error && <div className="mt-4 rounded-xl bg-red-50 text-red-700 p-4">{error}</div>}

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={createRegistryRecord} className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-medium">Create registry record</button>
              <button onClick={loadRegistry} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700">Refresh registry</button>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-emerald-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm">Linked product offers</p>
                <h2 className="text-2xl font-semibold text-slate-900">Merchant registry records</h2>
              </div>
              <p className="text-3xl font-bold text-slate-900">{loading ? '—' : registry.length}</p>
            </div>

            <div className="space-y-4 max-h-[900px] overflow-auto pr-1">
              {registry.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">Merchant #{item.merchantId} · Product #{item.productId}</p>
                      <p className="text-sm text-slate-500 mt-1">Provider: {item.paymentProvider || 'none'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₦{item.price}</p>
                      <p className="text-sm text-slate-500">Inventory {item.inventoryQty}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-slate-500 break-all">
                    <p>Merchant wallet: {item.merchantWalletAddress || 'not set'}</p>
                    <p>Product owner wallet: {item.productOwnerWalletAddress || 'not set'}</p>
                  </div>
                </div>
              ))}
              {!loading && registry.length === 0 && <p className="text-slate-500">No merchant registry records found yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
