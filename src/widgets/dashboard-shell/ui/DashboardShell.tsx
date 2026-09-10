import { useEffect, useState, type ReactNode } from 'react'
import { Link } from '@/shared/lib/router/router'
import { CalendarIcon, ChevronDownIcon, GridIcon, LogoMark, SettingsIcon, SignOutIcon } from '@/shared/ui/icons'
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle'
import { SetupWizard } from '@/widgets/setup-wizard/ui/SetupWizard'
import { RANGE_PRESETS } from '@/entities/dashboard/model/use-week-range'
import type { WeekRange } from '@/entities/dashboard/model/types'
import { SUBTABS, type SubTabOption } from '../model/subnav'
import './dashboard-shell.css'

export type DashTab = 'general' | 'trailer' | 'dispatchers' | 'fleetstatus'

const TABS: { id: DashTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'trailer', label: 'Per trailer type' },
  { id: 'dispatchers', label: 'Per dispatchers' },
  { id: 'fleetstatus', label: 'Fleet status' },
]

const SIDEBAR_COLLAPSED_KEY = 'ts_dash_sidebar_collapsed'

interface Props {
  tab: DashTab
  onTabChange(tab: DashTab): void
  subTab: string
  onSubTabChange(value: string): void
  weekMin: number
  weekMax: number
  range: WeekRange
  activePreset: string
  onApplyPreset(v: string): void
  onApply(start: number, end: number): void
  onReset(): void
  children: ReactNode
}

export function DashboardShell({
  tab,
  onTabChange,
  subTab,
  onSubTabChange,
  weekMin,
  weekMax,
  range,
  activePreset,
  onApplyPreset,
  onApply,
  onReset,
  children,
}: Props) {
  const [start, setStart] = useState(range.start)
  const [end, setEnd] = useState(range.end)
  const [customOpen, setCustomOpen] = useState(activePreset === 'custom')
  const [setupOpen, setSetupOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    setStart(range.start)
    setEnd(range.end)
    if (activePreset === 'custom') setCustomOpen(true)
  }, [range.start, range.end, activePreset])

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const weekOptions = Array.from({ length: weekMax - weekMin + 1 }, (_, i) => weekMin + i)
  const showPeriod = tab !== 'fleetstatus'
  const subOptions: SubTabOption[] = SUBTABS[tab] ?? []
  const dirty = start !== range.start || end !== range.end

  return (
    <div className="dash-body">
      <nav className="dash-nav">
        <div className="dash-nav-top">
          <Link className="dash-brand" to="/">
            <LogoMark size={30} />
            <span className="dash-brand-txt">
              <span className="dash-brand-title">Trucking Sheets AI</span>
              <span className="dash-brand-sub">Demo · fleet analytics</span>
            </span>
          </Link>

          <div className="dash-nav-actions">
            <button type="button" className="dash-setup-btn" onClick={() => setSetupOpen(true)}>
              <SettingsIcon />
              <span>Setup</span>
            </button>
            <ThemeToggle />
            <Link className="dash-exit" to="/">
              <SignOutIcon /> Exit demo
            </Link>
          </div>
        </div>
      </nav>

      {setupOpen && <SetupWizard onClose={() => setSetupOpen(false)} />}

      <div className={`dash-layout${collapsed ? ' is-collapsed' : ''}`}>
        <aside className="dash-side" aria-label="Dashboard controls">
          <button
            type="button"
            className="dash-side-toggle"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            title={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <span className="dash-side-toggle-ic">{collapsed ? '»' : '«'}</span>
            {!collapsed && <span>Hide panel</span>}
          </button>

          {collapsed ? (
            <div className="dash-side-rail">
              {subOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`dash-rail-btn${subTab === o.value ? ' is-active' : ''}`}
                  onClick={() => onSubTabChange(o.value)}
                  title={o.label}
                >
                  {o.label
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </button>
              ))}
              {showPeriod && (
                <button
                  type="button"
                  className="dash-rail-btn dash-rail-cal"
                  onClick={toggleCollapsed}
                  title={`Week ${range.start} → Week ${range.end}`}
                >
                  <CalendarIcon />
                </button>
              )}
            </div>
          ) : (
            <>
              {subOptions.length > 0 && (
                <section className="dash-side-sec">
                  <h4>
                    <GridIcon /> View
                  </h4>
                  <div className="dash-side-nav">
                    {subOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`dash-side-navbtn${subTab === o.value ? ' is-active' : ''}`}
                        onClick={() => onSubTabChange(o.value)}
                      >
                        <span className="dash-side-navbtn-label">{o.label}</span>
                        {o.hint && <span className="dash-side-navbtn-hint">{o.hint}</span>}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="dash-side-sec">
                <h4>
                  <CalendarIcon /> Date range
                </h4>

                <div className={`dash-range-box${activePreset === 'custom' ? ' is-custom' : ''}`}>
                  <span className="dash-range-box-weeks">
                    Week {range.start} <span>→</span> Week {range.end}
                  </span>
                  <span className="dash-range-box-year">2026 season</span>
                </div>

                {showPeriod ? (
                  <>
                    <div className="dash-range-presets">
                      {RANGE_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          className={`dash-preset-btn${activePreset === p.value ? ' is-active' : ''}`}
                          onClick={() => {
                            onApplyPreset(p.value)
                            setCustomOpen(false)
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`dash-preset-btn dash-preset-custom${customOpen || activePreset === 'custom' ? ' is-active' : ''}`}
                        onClick={() => setCustomOpen((v) => !v)}
                        aria-expanded={customOpen}
                      >
                        Custom range
                        <ChevronDownIcon />
                      </button>
                    </div>

                    {customOpen && (
                      <div className="dash-range-custom">
                        <div className="dash-side-field">
                          <label htmlFor="sd-start">From week</label>
                          <select id="sd-start" value={start} onChange={(e) => setStart(Number(e.target.value))}>
                            {weekOptions.map((w) => (
                              <option key={w} value={w}>
                                Week {w}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="dash-side-field">
                          <label htmlFor="sd-end">To week</label>
                          <select id="sd-end" value={end} onChange={(e) => setEnd(Number(e.target.value))}>
                            {weekOptions.map((w) => (
                              <option key={w} value={w}>
                                Week {w}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          className={`btn btn-primary btn-block btn-sm${dirty ? ' dash-side-apply-dirty' : ''}`}
                          onClick={() => onApply(start, end)}
                          disabled={!dirty}
                        >
                          {dirty ? 'Show this range' : 'Range applied'}
                        </button>
                      </div>
                    )}

                    {activePreset === 'custom' && (
                      <button type="button" className="dash-range-clear" onClick={onReset}>
                        Back to full season
                      </button>
                    )}
                  </>
                ) : (
                  <p className="dash-side-note">
                    The Fleet status board has its own day-by-day window — set it right on the board.
                  </p>
                )}
              </section>
            </>
          )}
        </aside>

        <div className="dash-main">
          <div className="dash-panel">
            <div className="dash-tabbar" role="tablist" aria-label="Dashboard views">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`dash-tab${tab === t.id ? ' is-active' : ''}`}
                  onClick={() => onTabChange(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="dash-panel-anim" key={`${tab}-${subTab}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
