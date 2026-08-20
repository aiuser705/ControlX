import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import UnblockButton from '@/components/admin/UnblockButton';

export default async function BlockedCustomersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/');

  const adminSupabase = createAdminClient();
  const { data: blocks } = await adminSupabase
    .from('customer_blocks')
    .select('id, user_id, email, phone, ip_address, reason, blocked_by, created_at')
    .order('created_at', { ascending: false });

  const all = blocks || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#EBE9E1', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
          Blocked Customers
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(235,233,225,0.5)', margin: 0 }}>
          Multi-identifier block list — checked on every booking attempt
        </p>
      </div>

      {all.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#EBE9E1', margin: '0 0 8px' }}>No Blocked Customers</p>
          <p style={{ fontSize: '13px', color: 'rgba(235,233,225,0.4)', margin: 0 }}>
            Use the &quot;Block Customer&quot; button on a booking detail page to add a block.
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.25)' }}>
                  {['ACCOUNT ID', 'EMAIL', 'PHONE', 'IP ADDRESS', 'REASON', 'BLOCKED ON', 'ACTION'].map((h) => (
                    <th key={h} style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(235,233,225,0.4)', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map((block: any) => (
                  <tr key={block.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <code style={{ fontSize: '11px', color: 'rgba(235,233,225,0.5)', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.04)', padding: '3px 6px', borderRadius: '4px' }}>
                        {block.user_id?.slice(0, 12)}…
                      </code>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#f87171' }}>{block.email}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'rgba(235,233,225,0.6)' }}>{block.phone || '—'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <code style={{ fontSize: '11px', color: 'rgba(235,233,225,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {block.ip_address || '—'}
                      </code>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'rgba(235,233,225,0.75)' }}>{block.reason}</td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'rgba(235,233,225,0.5)', whiteSpace: 'nowrap' }}>
                      {new Date(block.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <UnblockButton blockId={block.id} email={block.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
