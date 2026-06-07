'use client'

import { cn } from '@/lib/utils'
import { useTheme } from '@/components/layout/theme-provider'
import { type Theme } from '@/store/use-theme-store'
import { Check } from 'lucide-react'

type ThemeOption = {
  id: Theme
  label: string
  description: string
  swatch: string
  preview: string
  isDefault?: boolean
}

const THEMES: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Clean and bright',
    swatch: '#f5f4f0',
    preview: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Premium dark',
    swatch: '#1e1e2a',
    preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0d1b34 100%)',
    isDefault: true,
  },
  {
    id: 'pink',
    label: 'Pink',
    description: 'Wellness glow',
    swatch: '#f4a7b9',
    preview: 'linear-gradient(135deg, #fff0f5 0%, #fce7f3 50%, #fbcfe8 100%)',
  },
  {
    id: 'maria',
    label: 'Maria 🌻',
    description: 'Sunflower warmth',
    swatch: '#F5C842',
    preview: 'linear-gradient(135deg, #ffffff 0%, #fffbe8 50%, #fff3b0 100%)',
  },
]

/** Compact 3-dot switcher for the sidebar */
export function ThemeSwitcherCompact() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Theme</span>
      <div className="flex items-center gap-1.5">
        {THEMES.map(({ id, label, swatch }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            title={label}
            aria-label={`Switch to ${label} theme`}
            className={cn(
              'w-5 h-5 rounded-full transition-all duration-200',
              theme === id
                ? 'ring-2 ring-offset-2 ring-primary ring-offset-card scale-110'
                : 'opacity-50 hover:opacity-80 hover:scale-110'
            )}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>
    </div>
  )
}

/** Full theme picker for the settings page */
export function ThemeSwitcherFull() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map(({ id, label, description, preview, isDefault }) => {
        const isActive = theme === id
        return (
          <button
            key={id}
            onClick={() => setTheme(id)}
            aria-label={`Switch to ${label} theme`}
            className={cn(
              'flex flex-col gap-2.5 p-3.5 rounded-2xl border-2 text-left w-full transition-all duration-200',
              isActive
                ? 'border-primary shadow-sm'
                : 'border-border hover:border-muted-foreground/40 hover:shadow-sm'
            )}
          >
            {/* Mini preview strip */}
            <div
              className="w-full h-10 rounded-xl shadow-inner"
              style={{ background: preview }}
            />

            {/* Info row */}
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1 flex-wrap">
                  {description}
                  {isDefault && (
                    <span className="inline-block bg-primary/15 text-primary px-1.5 py-px rounded-full text-[9px] font-semibold leading-tight tracking-wide">
                      Default
                    </span>
                  )}
                </p>
              </div>
              {isActive && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
