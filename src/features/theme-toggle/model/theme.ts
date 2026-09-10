import { THEME_STORAGE_KEY } from '@/shared/config/constants'

export type Theme = 'light' | 'dark'

export function toggleTheme(): void {
  const current =
    document.documentElement.getAttribute('data-theme') ??
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    return
  }
}
