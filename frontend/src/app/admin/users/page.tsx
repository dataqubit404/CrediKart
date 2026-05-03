'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (q) params.set('q', q);
    api.get(`/admin/users?${params}`).then(r => {
      setUsers(r.data.users || []);
      setTotal(r.data.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [role, q]);

  const toggleBlock = async (id: number, isBlocked: boolean) => {
    try {
      await api.put(`/admin/users/${id}/block`);
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-white mb-6">Users ({total})</h1>

        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={q} onChange={e => setQ(e.target.value)} className="input w-64" placeholder="Search name or email..." />
          <select value={role} onChange={e => setRole(e.target.value)} className="input w-40">
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SHOPKEEPER">Shopkeeper</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-${u.role === 'CUSTOMER' ? 'blue' : u.role === 'SHOPKEEPER' ? 'green' : 'yellow'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_blocked ? <span className="badge-red">Blocked</span> : <span className="badge-green">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleBlock(u.id, u.is_blocked)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.is_blocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                        {u.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
