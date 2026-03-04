import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, durationMs } = body;

    if (!sessionId || typeof durationMs !== 'number') {
      return NextResponse.json({ ok: true });
    }

    await supabase.from('session_durations').insert({
      session_id: sessionId,
      duration_ms: durationMs,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
