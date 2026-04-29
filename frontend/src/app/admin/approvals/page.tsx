'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const [data, setData] = useState<any>({ pending_shops: [], pending_customers: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchData = () => {
    api.get('/admin/approvals').then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const approveShop = async (id: number, status: string, reason?: string) => {
    setProcessing(id);
    try {
      await api.post(`/shops/${id}/approve`, { status, reason });
      toast.success(`Shop ${status.toLowerCase()}`);
      fetchData();
    } catch { toast.error('Failed'); } finally { setProcessing(null); }
  };

  const approveCustomer = async (id: number) => {
    setProcessing(id);
    try {
      await api.post(`/admin/approve-customer/${id}`);
      toast.success('Customer verified');
      fetchData();
    } catch { toast.error('Failed'); } finally { setProcessing(null); }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const BASE = API_URL.replace('/api', '');

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-white mb-8">Pending Approvals</h1>

        {/* Shop approvals */}
        <section className="mb-10">
          <h2 className="font-semibold text-white mb-4">Shops ({data.pending_shops.length})</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
          ) : data.pending_shops.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">No pending shops</div>
          ) : (
            <div className="space-y-4">
              {data.pending_shops.map((shop: any) => (
                <div key={shop.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    {shop.image_url && (
                      <img src={`${BASE}${shop.image_url}`} alt={shop.name} className="w-16 h-16 rounded-xl object-cover bg-gray-700 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg">{shop.name}</p>
                      <p className="text-gray-400 text-sm">{shop.address}</p>
                      <p className="text-gray-400 text-sm mt-1">Owner: {shop.owner?.name} ({shop.owner?.email})</p>
                      {shop.verification_doc_url && (
                        <a href={`${BASE}${shop.verification_doc_url}`} target="_blank" rel="noreferrer" className="text-brand-500 text-xs hover:underline mt-1 block">
                          View Verification Document →
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approveShop(shop.id, 'APPROVED')} disabled={processing === shop.id}
                        className="btn-primary text-sm px-4">
                        {processing === shop.id ? '...' : '✓ Approve'}
                      </button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if (r !== null) approveShop(shop.id, 'REJECTED', r); }}
                        className="btn-danger text-sm px-4">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer approvals */}
        <section>
          <h2 className="font-semibold text-white mb-4">Customer ID Verifications ({data.pending_customers.length})</h2>
          {data.pending_customers.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">No pending verifications</div>
          ) : (
            <div className="space-y-3">
              {data.pending_customers.map((c: any) => (
                <div key={c.id} className="card p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-gray-400 text-sm">{c.email} • {c.phone}</p>
                    {c.id_proof_url && (
                      <a href={`${BASE}${c.id_proof_url}`} target="_blank" rel="noreferrer" className="text-brand-500 text-xs hover:underline">View ID Proof →</a>
                    )}
                  </div>
                  <button onClick={() => approveCustomer(c.id)} disabled={processing === c.id}
                    className="btn-primary text-sm">
                    {processing === c.id ? '...' : '✓ Verify'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
