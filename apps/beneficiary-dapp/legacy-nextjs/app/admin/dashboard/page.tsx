'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return body;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [userList, merchantList, logs] = await Promise.all([
        request('/admin/users'),
        request('/admin/merchants'),
        request('/admin/audit-logs'),
      ]);
      setUsers(userList);
      setMerchants(merchantList);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveUser = async (id: number) => {
    await request(`/admin/users/${id}/approve`, { method: 'POST' });
    await load();
  };

  const deactivateUser = async (id: number) => {
    await request(`/admin/users/${id}/deactivate`, { method: 'POST' });
    await load();
  };

  const approveMerchant = async (id: number) => {
    await request(`/admin/merchants/${id}/approve`, { method: 'POST' });
    await load();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-cyan-300 font-medium">Admin control</p>
            <h1 className="text-3xl font-bold">Operations dashboard</h1>
          </div>
          <Link href="/" className="text-cyan-300 hover:underline">Back home</Link>
        </div>

        {loading && <div className="bg-slate-900 rounded-2xl p-6">Loading admin data...</div>}
        {error && <div className="bg-red-900/30 text-red-200 rounded-xl p-4 mb-6">{error}</div>}

        {!loading && !error && (
          <div className="grid xl:grid-cols-[1.1fr_1fr] gap-6">
            <div className="space-y-6">
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-slate-400">Role: {user.role}</p>
                        <p className="text-sm text-slate-400">Active: {String(user.isActive)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveUser(user.id)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg text-sm">Approve</button>
                        <button onClick={() => deactivateUser(user.id)} className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm">Deactivate</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Merchants</h2>
                <div className="space-y-3">
                  {merchants.map((merchant) => (
                    <div key={merchant.id} className="border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Merchant #{merchant.id}</p>
                        <p className="text-sm text-slate-400">Approved: {String(merchant.isApproved)}</p>
                        <p className="text-sm text-slate-400">Commission: {merchant.commissionRate}</p>
                      </div>
                      <button onClick={() => approveMerchant(merchant.id)} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-2 rounded-lg text-sm">Approve</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Audit logs</h2>
              <div className="space-y-3 max-h-[900px] overflow-auto pr-2">
                {auditLogs.length === 0 && <p className="text-slate-400">No audit records yet.</p>}
                {auditLogs.map((log) => (
                  <div key={log.id} className="border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{log.action} {log.entityType}</p>
                      <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Entity ID: {log.entityId}</p>
                    <p className="text-sm text-slate-400">Status: {log.status}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
