'use client';

import Link from 'next/link';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('beneficiary');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.message || 'Signup failed');
      }

      setMessage('Signup completed. You can now return to login and continue.');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create account</h1>
        <p className="text-slate-500 mb-8">Use a demo role to access the backend flows.</p>

        <form onSubmit={handleSignup} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="beneficiary">Beneficiary</option>
            <option value="merchant">Merchant</option>
            <option value="sponsor">Sponsor</option>
          </select>

          {message && <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3 text-sm">{message}</div>}
          {error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-xl py-3 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Return to login
          </Link>
        </p>
      </div>
    </div>
  );
}
