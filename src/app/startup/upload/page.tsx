'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StartupUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('pitch_deck');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setDebug('Starting upload...');

    try {
      // First get the startup ID
      setDebug('Getting startup info...');
      const startupRes = await fetch('/api/startup/my');
      const startupData = await startupRes.json();

      setDebug('Startup data: ' + JSON.stringify(startupData));

      if (!startupRes.ok || !startupData.id) {
        throw new Error('No startup found: ' + JSON.stringify(startupData));
      }

      setDebug('Uploading file...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('startupId', startupData.id);
      formData.append('type', docType);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      setDebug('Response: ' + JSON.stringify(resData));

      if (!res.ok) {
        throw new Error(resData.error || 'Upload failed: ' + JSON.stringify(resData));
      }

      setSuccess(true);
      setTimeout(() => router.push('/startup'), 2000);
    } catch (err: any) {
      setError(err.message);
      setDebug('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/startup" className="text-blue-600 hover:text-blue-700">
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-6">Upload Document</h1>

          {debug && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <pre className="whitespace-pre-wrap">{debug}</pre>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Document uploaded successfully! Redirecting...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="pitch_deck">Pitch Deck</option>
                <option value="financials">Financials</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
