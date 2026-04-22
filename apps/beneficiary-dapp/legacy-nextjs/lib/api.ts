'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSponsorDashboard: () => request('/analytics/sponsor/dashboard'),
  getSponsorPasses: () => request('/analytics/sponsor/passes'),
  getSponsorRedemptions: () => request('/analytics/sponsor/redemptions'),
  getProducts: () => request('/products?approved=true'),
  getMerchantTransactions: () => request('/merchants/transactions'),
  validateQr: (qrCode: string) =>
    request('/passes/validate-qr', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    }),
  redeemPass: (payload: {
    passId?: number;
    passIdUnique?: string;
    amount: number;
    productPurchased?: number[];
  }) =>
    request('/passes/redeem', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
