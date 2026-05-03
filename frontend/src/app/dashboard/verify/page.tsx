'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyIDPage() {
  const { user, fetchMe } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const BASE = api.defaults.baseURL?.replace('/api', '') || '';

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) { toast.error('Please select a file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('id_proof', fileRef.current.files[0]);
      await api.post('/auth/upload-id', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchMe();
      toast.success('ID uploaded! Admin will verify shortly.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setSelectedFileName(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFileName(e.target.files[0].name);
  };

  if (mounted && user?.is_verified) return (
    <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
      <div className="text-6xl">✅</div>
      <h2 className="font-display font-bold text-xl text-gray-900">Already Verified</h2>
      <p className="text-gray-500">Your identity has been verified by admin.</p>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🪪</div>
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Identity Verification</h1>
        <p className="text-gray-500">Upload a government-issued ID to enable full platform access and CrediPay.</p>
      </div>

        <div className="card p-8">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
            <p className="text-blue-700 text-sm font-medium mb-1">What to upload</p>
            <p className="text-blue-600/70 text-xs">Aadhar Card, PAN Card, Voter ID, Passport, or Driving License. Must be clearly readable.</p>
          </div>

          <form onSubmit={handleUpload}>
            <label className="label">ID Document (Image or PDF)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-5 hover:border-gray-300 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="text-4xl mb-2">{selectedFileName ? '📄' : '📤'}</div>
              <p className="text-gray-700 text-sm font-medium">{selectedFileName || 'Click to select file'}</p>
              {selectedFileName && <p className="text-brand-600 text-xs mt-1 font-bold">Ready to upload</p>}
              {!selectedFileName && <p className="text-gray-400 text-xs mt-1">JPEG, PNG, PDF – max 5MB</p>}
              <input type="file" ref={fileRef} accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary w-full py-3">
              {uploading ? 'Uploading...' : 'Upload ID Document'}
            </button>
          </form>
          {mounted && user?.id_proof_url && (
            <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <p className="text-sm text-gray-900 font-bold">Verification Pending</p>
                </div>
              </div>
              <a href={`${BASE}${user.id_proof_url}`} target="_blank" rel="noreferrer" className="text-xs font-black text-brand-600 hover:underline">VIEW UPLOADED ID</a>
            </div>
          )}
        </div>
    </div>
  );
}
