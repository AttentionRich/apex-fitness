// SERVER-ONLY. Never import this file from client code or client bundles.
// Used only for: seed scripts, admin maintenance, backfills, and secure server tasks.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. ' +
        'Admin client is server-only and must not be used in client bundles.'
    )
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
