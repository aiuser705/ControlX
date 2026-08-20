'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={handleSignOut} style={btnStyle}>
      Sign Out
    </button>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid rgba(239,68,68,0.35)',
  borderRadius: '10px',
  color: '#f87171',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};
