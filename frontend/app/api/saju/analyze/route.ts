import { NextRequest, NextResponse } from 'next/server';
import { calculate } from '@/lib/dayPillarCalculator';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const body = await request.json();
    const { birthDate, birthTime, theme, answers, name } = body;

    if (!birthDate || birthDate.length !== 8) {
      return NextResponse.json(
        { error: 'Invalid birthDate' },
        { status: 400 },
      );
    }

    const result = calculate(birthDate, birthTime || 'unknown');

    const duration = Date.now() - start;

    // Fire-and-forget DB logging
    supabase
      .from('analyses')
      .insert({
        session_id: request.headers.get('x-session-id') || null,
        birth_date: birthDate,
        theme: theme || null,
        animal: result.animal,
        ilju: result.ilju,
        success: true,
        duration_ms: duration,
      })
      .then();

    return NextResponse.json({
      ilju: result.ilju,
      animal: result.animal,
      theme,
    });
  } catch (err: any) {
    const duration = Date.now() - start;

    supabase
      .from('analyses')
      .insert({
        session_id: request.headers.get('x-session-id') || null,
        success: false,
        error_msg: err?.message || 'Unknown error',
        duration_ms: duration,
      })
      .then();

    supabase
      .from('error_logs')
      .insert({
        endpoint: '/api/saju/analyze',
        message: err?.message || 'Unknown error',
        stack: err?.stack || null,
      })
      .then();

    // Fallback like the Java backend
    return NextResponse.json({
      ilju: '갑자',
      animal: 'rat',
      theme: 'health',
    });
  }
}
