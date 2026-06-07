import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/today'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const errorUrl = new URL('/auth/sign-in', origin)
    errorUrl.searchParams.set('error', errorDescription ?? error)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Ensure next is a relative path to prevent open redirect
      const safeNext = next.startsWith('/') ? next : '/today'
      return NextResponse.redirect(new URL(safeNext, origin))
    }
  }

  // If we reach here something went wrong
  const errorUrl = new URL('/auth/sign-in', origin)
  errorUrl.searchParams.set('error', 'Authentication failed. Please try again.')
  return NextResponse.redirect(errorUrl)
}
