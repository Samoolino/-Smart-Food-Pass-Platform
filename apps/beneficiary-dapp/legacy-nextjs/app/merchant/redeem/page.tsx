'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { RoleNavigation } from '../../../components/role-navigation';

export default function MerchantRedeemPage() {
  const [qrCode, setQrCode] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [validation, setValidation] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [onboardingSignal, setOnboardingSignal] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [txData, onboardingDraft] = await Promise.all([
          api.getMerchantTransactions(),
          api.getOnboardingDraft(),
        ]);
        setTransactions(txData as any[]);
        setOnboardingSignal((onboardingDraft as any)?.notificationSummary || null);
      } catch {
        // leave merchant history empty on first load
      }
    };

    loadTransactions();
  }, []);

  const handleValidate = async () => {
    try {
      setLoading(true);
      setError('');
      setReceipt(null);
      const result: any = await api.validateQr(qrCode);
      setValidation(result);
      setProducts(result.eligibleProducts || []);
    } catch (err: any) {
      setError(err.message || 'QR validation failed');
      setValidation(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!validation?.pass?.id) {
      setError('Validate a pass first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result: any = await api.redeemPass({
        passId: validation.pass.id,
        amount: Number(amount),
        productPurchased: selectedProducts,
      });
      setReceipt(result.receipt);
      const updatedTransactions: any = await api.getMerchantTransactions();
      setTransactions(updatedTransactions as any[]);
    } catch (err: any) {
      setError(err.message || 'Redemption failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id: number) => {
    setSelectedProducts((current) =>
      current.includes(id) ? current.filter((productId) => productId !== id) : [...current, id],
    );
  };

  const toneStyles: Record<string, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    neutral: 'border-slate-200 bg-slate-50 text-slate-900',
  };

  return (
    <main className="min-h-screen bg-emerald-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <RoleNavigation current="merchant" />

        <div className="mb-8">
          <p className="text-emerald-700 font-medium">Merchant operations</p>
          <h1 className="text-3xl font-bold text-slate-900">Redeem pass</h1>
        </div>

        {onboardingSignal && (
          <div className={`rounded-2xl border p-5 mb-6 ${toneStyles[onboardingSignal.tone] || toneStyles.neutral}`}>
            <p className="font-semibold mb-1">{onboardingSignal.title}</p>
            <p className="text-sm leading-7">{onboardingSignal.message}</p>
            {onboardingSignal.actionHref && onboardingSignal.actionLabel && (
              <div className="mt-4">
                <Link href={onboardingSignal.actionHref} className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  {onboardingSignal.actionLabel}
                </Link>
              </div>
            )}
          </div>
        )}

        {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6">{error}</div>}

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">QR validation</h2>
            <textarea
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder='Paste QR payload, for example {"passIdUnique":"SFPASS-2026-123456","checksum":"..."}'
              className="w-full min-h-[120px] rounded-xl border border-slate-300 p-4 text-sm"
            />
            <button
              onClick={handleValidate}
              disabled={loading || !qrCode.trim()}
              className="mt-4 bg-emerald-600 text-white rounded-xl px-5 py-3 font-medium disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Validate QR'}
            </button>

            {validation?.pass && (
              <div className="mt-6 border border-emerald-200 rounded-2xl p-5 bg-emerald-50">
                <h3 className="font-semibold text-slate-900 mb-3">Pass details</h3>
                <p className="text-sm text-slate-700">Pass: {validation.pass.passIdUnique}</p>
                <p className="text-sm text-slate-700">Balance: ₦{validation.pass.balance}</p>
                <p className="text-sm text-slate-700">Status: {validation.pass.status}</p>
                <p className="text-sm text-slate-700 mb-4">Expiry: {new Date(validation.pass.validityEnd).toLocaleString()}</p>

                <label className="block text-sm font-medium text-slate-700 mb-2">Redeem amount</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 mb-4"
                />

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Eligible products</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {products.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`text-left rounded-xl border p-3 ${selectedProducts.includes(product.id) ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-white/60'}`}
                      >
                        <p className="font-medium text-slate-900">{product.productName}</p>
                        <p className="text-xs text-slate-500">{product.category || 'uncategorized'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRedeem}
                  disabled={loading || !amount}
                  className="mt-5 bg-slate-900 text-white rounded-xl px-5 py-3 font-medium disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Redeem pass'}
                </button>
              </div>
            )}

            {receipt && (
              <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <h3 className="font-semibold text-slate-900 mb-3">Receipt</h3>
                <p className="text-sm text-slate-700">Transaction: #{receipt.transactionId}</p>
                <p className="text-sm text-slate-700">Amount: ₦{receipt.amount}</p>
                <p className="text-sm text-slate-700">Remaining balance: ₦{receipt.remainingBalance}</p>
                <p className="text-xs text-slate-500 mt-2 break-all">Blockchain hash: {receipt.blockchainTxHash || 'pending bridge hash'}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Transaction history</h2>
            <div className="space-y-3">
              {transactions.length === 0 && <p className="text-slate-500">No merchant transactions yet.</p>}
              {transactions.map((tx) => (
                <div key={tx.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">Transaction #{tx.id}</p>
                    <p className="font-semibold text-emerald-700">₦{tx.amount}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Pass ID: {tx.passId}</p>
                  <p className="text-sm text-slate-500">Status: {tx.status}</p>
                  <p className="text-xs text-slate-400 mt-2 break-all">Hash: {tx.blockchainTxHash || 'pending bridge hash'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
