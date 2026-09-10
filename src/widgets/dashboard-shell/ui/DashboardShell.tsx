import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CalendarIcon, ChevronDownIcon, SettingsIcon } from '@/shared/ui/icons'
import { useOutsideClick } from '@/shared/lib/hooks/use-outside-click'
import { SetupWizard } from '@/widgets/setup-wizard/ui/SetupWizard'
import { RANGE_PRESETS } from '@/entities/dashboard/model/use-week-range'
import type { WeekRange } from '@/entities/dashboard/model/types'
import './dashboard-shell.css'

export type DashTab = 'general' | 'trailer' | 'dispatchers' | 'fleetstatus'

const TABS: { id: DashTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'trailer', label: 'Per trailer type' },
  { id: 'dispatchers', label: 'Per dispatchers' },
  { id: 'fleetstatus', label: 'Fleet status' },
]

interface Props {
  tab: DashTab
  onTabChange(tab: DashTab): void
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
  const [rangeOpen, setRangeOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(activePreset === 'custom')
  const [setupOpen, setSetupOpen] = useState(false)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStart(range.start)
    setEnd(range.end)
    if (activePreset === 'custom') setCustomOpen(true)
  }, [range.start, range.end, activePreset])

  useOutsideClick(popRef, rangeOpen, () => setRangeOpen(false))

  const weekOptions = Array.from({ length: weekMax - weekMin + 1 }, (_, i) => weekMin + i)
  const showPeriod = tab !== 'fleetstatus'
  const dirty = start !== range.start || end !== range.end

  return (
    <>
      <div className="dtoolbar">
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

        <div className="dtoolbar-actions">
          <button type="button" className="dash-setup-btn" onClick={() => setSetupOpen(true)}>
            <SettingsIcon />
            <span>Setup</span>
          </button>

          {showPeriod && (
            <div className="drange-wrap" ref={popRef}>
              <button
                type="button"
                className={`drange-btn${activePreset === 'custom' ? ' is-custom' : ''}`}
                onClick={() => setRangeOpen((v) => !v)}
                aria-expanded={rangeOpen}
              >
                <CalendarIcon />
                Week {range.start} <span>→</span> Week {range.end}
                <ChevronDownIcon />
              </button>

              {rangeOpen && (
                <div className="drange-pop">
                  <div className="drange-presets">
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dash-panel-anim" key={tab}>
        {children}
      </div>

      {setupOpen && <SetupWizard onClose={() => setSetupOpen(false)} />}
    </>
  )
}
