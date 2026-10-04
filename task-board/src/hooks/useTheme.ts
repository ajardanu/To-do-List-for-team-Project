import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../lib/theme'
import { applyTheme, readStoredTheme, storeTheme, systemTheme } from '../lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme())

  useEffect(() => {
    applyTheme(theme)
    storeTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}