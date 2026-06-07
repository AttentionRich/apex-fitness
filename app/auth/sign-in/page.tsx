'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signInAction, type AuthActionResult } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

function SignInForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? ''
  const urlError = searchParams.get('error')
  const urlSuccess = searchParams.get('success')

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signInAction,
    null
  )

  const error = state?.error ?? urlError
  const success = state?.success ?? urlSuccess

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1.5">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Continue your progress.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 rounded-xl bg-success/8 border border-success/20 px-3.5 py-3 text-sm text-success">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link
          href="/auth/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Create one
        </Link>
      </p>
    </>
  )
}

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  )
}
