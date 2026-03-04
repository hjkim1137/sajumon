import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, animal, theme } = body;

    await supabase.from('downloads').insert({
      session_id: sessionId || 'unknown',
      animal: animal || null,
      theme: theme || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
