'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types_db';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '@/config';

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_client) {
    _client = createBrowserClient<Database>(SUPABASE.URL!, SUPABASE.ANON!);
  }
  return _client;
}
