import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center px-6 h-14 shrink-0 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Apex
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 h-12 shrink-0 border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Apex. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
