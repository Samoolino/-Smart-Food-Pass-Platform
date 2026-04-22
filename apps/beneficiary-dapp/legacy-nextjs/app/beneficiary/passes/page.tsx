'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export default function BeneficiaryPassesPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/passes`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });

        const body = await response.json();
        if (!response.ok) {
          throw new Error(body?.message || 'Failed to load beneficiary passes');
        }

        setPasses(body);
      } catch (err: any) {
        setError(err.message || 'Failed to load beneficiary passes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-700 font-medium">Beneficiary access</p>
            <h1 className="text-3xl font-bold text-slate-900">My passes</h1>
          </div>
          <Link href="/" className="text-amber-700 hover:underline">Back home</Link>
        </div>

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
