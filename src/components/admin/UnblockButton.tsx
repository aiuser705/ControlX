'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnblockButton({ blockId, email }: { blockId: string; email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnblock = async () => {
    if (!confirm(`Unblock ${email}? They will be able to make bookings again.`)) return;
    setLoading(true);
    try {
      await fetch('/api/admin/unblock-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleUnblock} disabled={loading} style={{
      padding: '7px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
      borderRadius: '8px', color: '#10B981', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
      fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
    }}>
      {loading ? 'Unblocking...' : 'Unblock'}
    </button>
  );
}
