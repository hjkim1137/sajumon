import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, page, referrer } = body;

    const ua = request.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);

    await supabase.from('page_views').insert({
      session_id: sessionId || 'unknown',
      page: page || '/',
      referrer: referrer || null,
      user_agent: ua.substring(0, 500),
      device_type: isMobile ? 'mobile' : 'desktop',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
