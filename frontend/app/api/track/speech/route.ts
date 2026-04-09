import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, speechText } = body;

    await supabase.from('speech_views').insert({
      session_id: sessionId || 'unknown',
      speech_text: speechText || '',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
