import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ── Character count helper (excluding whitespace/spaces) ──────────────────────
function countChars(text: string): number {
  return text.replace(/\s/g, '').length;
}

const MAX_CHARS = 250;

// ── Input validation schema ───────────────────────────────────────────────────
const contactSchema = z.object({
  nestType: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().email('Invalid email address.'),
  doseAccess: z.string().max(3000).optional().default(''),
});

// ── POST /api/contact ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // 2. Zod validation
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input.';
    return NextResponse.json(
      { success: false, error: firstError },
      { status: 400 }
    );
  }

  const { nestType, email, doseAccess } = result.data;

  // 3. Server-side 250-character limit enforcement (excluding spaces)
  const charCount = countChars(doseAccess);
  if (charCount > MAX_CHARS) {
    return NextResponse.json(
      {
        success: false,
        error: `Your message exceeds the 250-character limit (${charCount} / 250 characters, excluding spaces). Please shorten it.`,
      },
      { status: 400 }
    );
  }

  // 4. One-message-per-email enforcement — use admin client to bypass RLS
  const adminSupabase = createAdminClient();

  const { data: existing, error: lookupError } = await adminSupabase
    .from('contact_messages')
    .select('id')
    .ilike('email', email.trim())
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error('[/api/contact] Duplicate check error:', lookupError.message);
    // Fail open — allow submission if the lookup itself errors
  }

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        already_submitted: true,
        error:
          'You have already submitted a message. Please wait for our team to contact you. Thank you!',
      },
      { status: 409 }
    );
  }

  // 5. Insert into Supabase
  //    createClient() uses cookies() from next/headers — secure server-side client
  const supabase = createClient();

  const { error: dbError } = await supabase
    .from('contact_messages')
    .insert({
      name: nestType,
      email: email.trim(),
      message: doseAccess,
    });

  if (dbError) {
    // Log internally but NEVER expose raw DB errors to the client
    console.error('[/api/contact] Supabase insert error:', dbError.message);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, message: 'Inquiry recorded successfully' },
    { status: 201 }
  );
}
