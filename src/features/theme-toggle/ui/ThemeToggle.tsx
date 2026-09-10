import { SunIcon, MoonIcon } from '@/shared/ui/icons'
import { toggleTheme } from '../model/theme'

export function ThemeToggle() {
  return (
    <button className="theme-btn" aria-label="Toggle dark mode" onClick={toggleTheme}>
      <SunIcon />
      <MoonIcon />
    </button>
  )
}
