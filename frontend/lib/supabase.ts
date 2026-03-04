import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _client = createClient(url, key);
  }
  return _client;
}

// Convenience: returns a no-op client stub during build time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (prop === 'from') {
      return (table: string) => {
        try {
          return getSupabase().from(table);
        } catch {
          // During build, return a stub that resolves safely
          return {
            insert: () => ({ then: () => {} }),
            select: () => ({
              gte: () => ({ data: [], count: 0 }),
              not: () => ({ data: [], count: 0, neq: () => ({ data: [], count: 0 }) }),
              order: () => ({ range: () => ({ data: [], count: 0 }) }),
              data: [],
              count: 0,
            }),
          };
        }
      };
    }
    try {
      return (getSupabase() as any)[prop];
    } catch {
      return undefined;
    }
  },
});
