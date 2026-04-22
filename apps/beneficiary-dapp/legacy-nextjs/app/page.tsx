'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12">
          <div>
            <p className="text-blue-300 uppercase tracking-[0.3em] text-xs mb-3">Smart Food Pass</p>
            <h1 className="text-4xl font-bold">Operational frontends for sponsor and merchant flows</h1>
            <p className="text-slate-300 mt-4 max-w-3xl">
              This frontend branch connects the backend sequence already implemented for auth, pass issuance,
              redemption, analytics, product eligibility, admin controls, and blockchain logging.
            </p>
          </div>
          <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-500 rounded-lg px-5 py-3 font-medium">
            Login
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/sponsor/dashboard" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-400 transition">
            <h2 className="text-2xl font-semibold mb-2">Sponsor dashboard</h2>
            <p className="text-slate-300">
              Review funded passes, redemption totals, beneficiary counts, and product usage.
            </p>
          </Link>

          <Link href="/merchant/redeem" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400 transition">
            <h2 className="text-2xl font-semibold mb-2">Merchant redemption</h2>
            <p className="text-slate-300">
              Validate QR payloads, review eligible products, redeem pass value, and inspect transaction history.
            </p>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <h3 className="text-lg font-semibold mb-2">Stored session role</h3>
          <p className="text-slate-300">{role || 'No active role stored yet. Use the login screen first.'}</p>
        </div>
      </div>
    </main>
  );
}
