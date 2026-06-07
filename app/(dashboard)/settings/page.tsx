import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <SettingsClient
      user={
        user
          ? {
              id: user.id,
              email: user.email ?? null,
              displayName: user.user_metadata?.display_name ?? null,
            }
          : null
      }
    />
  )
}
