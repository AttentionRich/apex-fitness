import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    null

  return (
    <DashboardShell
      user={user ? { id: user.id, email: user.email ?? null, displayName } : null}
    >
      {children}
    </DashboardShell>
  )
}
