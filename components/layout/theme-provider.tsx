'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { useThemeStore, type Theme } from '@/store/use-theme-store'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore()
  const isFirstMount = useRef(true)

  useEffect(() => {
    const root = document.documentElement

    if (isFirstMount.current) {
      isFirstMount.current = false
      // Initial apply — inline script already handled this, just confirm
      root.classList.remove('dark', 'pink', 'maria')
      if (theme === 'dark') root.classList.add('dark')
      else if (theme === 'pink') root.classList.add('pink')
      else if (theme === 'maria') root.classList.add('maria')
      return
    }

    // Subsequent theme changes — enable transitions briefly
    root.setAttribute('data-theme-transition', '')
    root.classList.remove('dark', 'pink', 'maria')
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'pink') root.classList.add('pink')
    else if (theme === 'maria') root.classList.add('maria')

    const t = setTimeout(() => root.removeAttribute('data-theme-transition'), 350)
    return () => clearTimeout(t)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
