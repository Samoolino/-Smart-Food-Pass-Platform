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
  getProfile: () => request('/users/profile'),
  updateProfile: (payload: Record<string, unknown>) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getOnboardingDraft: () => request('/users/onboarding-draft'),
  updateOnboardingDraft: (payload: Record<string, unknown>) =>
    request('/users/onboarding-draft', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  reviewOnboardingKyc: (userId: number, payload: { target: 'governmentId' | 'proofOfAddress' | 'businessVerification'; status: 'approved' | 'rejected' | 'under_review'; note?: string }) =>
    request(`/users/${userId}/onboarding-draft/review`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getSponsorDashboard: () => request('/analytics/sponsor/dashboard'),
  getSponsorPasses: () => request('/analytics/sponsor/passes'),
  getSponsorRedemptions: () => request('/analytics/sponsor/redemptions'),
  getProducts: () => request('/products?approved=true'),
  getProductCategories: () => request('/products/categories'),
  getMarketplaceRegistry: (merchantId?: number) => request(`/products/registry${merchantId ? `?merchantId=${merchantId}` : ''}`),
  getAccessibleMarketplace: (userId: number, passId?: number) =>
    request(`/products/accessible/${userId}${passId ? `?passId=${passId}` : ''}`),
  createMerchantRegistry: (payload: Record<string, unknown>) =>
    request('/products/registry', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMerchantRegistry: (id: number, payload: Record<string, unknown>) =>
    request(`/products/registry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
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
  getUserPlans: (userId?: number) => request(`/payments/plans${userId ? `?userId=${userId}` : ''}`),
  createUserPlan: (payload: Record<string, unknown>) =>
    request('/payments/plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createPaymentIntent: (payload: Record<string, unknown>) =>
    request('/payments/test/intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createSettlement: (payload: Record<string, unknown>) =>
    request('/payments/test/settlements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSettlements: (query?: { merchantId?: number; userId?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (query?.merchantId) params.set('merchantId', String(query.merchantId));
    if (query?.userId) params.set('userId', String(query.userId));
    if (query?.status) params.set('status', query.status);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return request(`/payments/test/settlements${suffix}`);
  },
  getReconciliationHistory: (query?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    return request(`/blockchain/reconciliation/history${params.toString() ? `?${params.toString()}` : ''}`);
  },
};
