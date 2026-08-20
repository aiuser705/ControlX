import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import MessageInboxTable, { ContactMessageItem } from '@/components/admin/MessageInboxTable';

export default async function AdminMessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/');

  const adminSupabase = createAdminClient();
  const { data: rawMessages } = await adminSupabase
    .from('contact_messages')
    .select('id, name, email, message, status, admin_notes, created_at')
    .order('created_at', { ascending: false });

  const messages: ContactMessageItem[] = (rawMessages as ContactMessageItem[]) || [];

  const unreadCount = messages.filter((m) => m.status?.toLowerCase() === 'new').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#EBE9E1', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
            Inquiries & Contact Messages
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(235,233,225,0.5)', margin: 0 }}>
            Public contact submissions from landing page visitors & potential clients
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16,185,129,0.12)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              ● {unreadCount} Unread
            </span>
          )}
          <span
            style={{
              fontSize: '12px',
              color: 'rgba(235,233,225,0.5)',
              background: 'rgba(255,255,255,0.04)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {messages.length} Total Messages
          </span>
        </div>
      </div>

      {/* Messages Interactive Table */}
      <MessageInboxTable initialMessages={messages} />
    </div>
  );
}
