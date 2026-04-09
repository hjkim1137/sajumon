import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = getSupabase();

    const { data, error } = await sb.rpc('count_unique_visitors');

    if (error || data == null) {
      return NextResponse.json({ totalUsers: 0 });
    }

    return NextResponse.json(
      { totalUsers: data },
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
