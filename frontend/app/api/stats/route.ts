import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = getSupabase();

    const { data, error } = await sb.from('page_views').select('session_id');

    if (error || !data) {
      return NextResponse.json({ totalUsers: 0 });
    }

    const uniqueUsers = new Set(data.map((r) => r.session_id)).size;

    return NextResponse.json(
      { totalUsers: uniqueUsers },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch {
    return NextResponse.json({ totalUsers: 0 });
  }
}
