import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  LinkIcon,
  SettingsIcon,
  SheetIcon,
} from '@/shared/ui/icons'
import './setup-wizard.css'

interface FakeSheet {
  id: string
  name: string
  meta: string
  headers: string[]
}

// Sample sheets the mock Google Picker "returns"
const SAMPLE_SHEETS: FakeSheet[] = [
  {
    id: 'sheet-a',
    name: 'Fleet Dispatch 2026',
    meta: 'Shared drive · edited 2h ago · 1,840 rows',
    headers: ['Truck', 'Wk', 'Dispatcher Name', 'Equipment', 'Total Pay', 'Loaded Miles', 'PU Date', 'DEL Date', 'Notes'],
  },
  {
    id: 'sheet-b',
    name: 'Loads master (live)',
    meta: 'My Drive · edited yesterday · 2,537 rows',
    headers: ['Unit_ID', 'Week Number', 'Dispatcher', 'Trailer_Type', 'Load Rate', 'TotalMiles', 'Pickup', 'Delivery'],
  },
  {
    id: 'sheet-c',
    name: 'Q3 dispatch board',
    meta: 'Shared with me · edited 5d ago · 960 rows',
    headers: ['Truck #', 'Week', 'Desk', 'Trailer', 'Gross $', 'Miles', 'Pick-up', 'Drop'],
  },
]

interface MapField {
  key: string
  label: string
  required: boolean
  aliases: string[]
}

const MAP_FIELDS: MapField[] = [
  { key: 'unit', label: 'Truck / Unit #', required: true, aliases: ['unit', 'unit_id', 'truck', 'truck #', 'truck#'] },
  { key: 'week', label: 'Week', required: true, aliases: ['wk', 'week', 'week number'] },
  { key: 'dispatcher', label: 'Dispatcher', required: true, aliases: ['dispatcher', 'dispatcher name', 'desk'] },
  { key: 'trailer', label: 'Trailer type', required: true, aliases: ['equipment', 'trailer', 'trailer_type', 'trailer type'] },
  { key: 'rate', label: 'Load rate ($)', required: true, aliases: ['total pay', 'load rate', 'gross', 'gross $', 'rate'] },
  { key: 'miles', label: 'Miles', required: true, aliases: ['loaded miles', 'totalmiles', 'miles'] },
  { key: 'pickup', label: 'Pickup date', required: false, aliases: ['pu date', 'pickup', 'pick-up'] },
  { key: 'delivery', label: 'Delivery date', required: false, aliases: ['del date', 'delivery', 'drop'] },
]

function autoMap(headers: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of MAP_FIELDS) {
    const hit = headers.find((h) => f.aliases.includes(h.trim().toLowerCase()))
    if (hit) out[f.key] = hit
  }
  return out
}

const STEPS = ['Connect', 'Map columns', 'Done'] as const

export function SetupWizard({ onClose }: { onClose(): void }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<FakeSheet | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const headers = picked?.headers ?? []
  const requiredMapped = useMemo(
    () => MAP_FIELDS.filter((f) => f.required).every((f) => mapping[f.key]),
    [mapping],
  )

  function choose(sheet: FakeSheet) {
    setPicked(sheet)
    setMapping(autoMap(sheet.headers))
  }

  return (
    <div className="sw-veil" onClick={onClose}>
      <div className="sw-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Connect a Google Sheet">
        <div className="sw-head">
          <span className="sw-head-ic">
            <SettingsIcon />
          </span>
          <div className="sw-head-txt">
            <h2>Connect your dispatch sheet</h2>
            <p>Point Trucking Sheets AI at the Google Sheet your fleet already runs on</p>
          </div>
          <button type="button" className="sw-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="sw-steps" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`sw-step-dot${i < step ? ' is-done' : ''}${i === step ? ' is-active' : ''}`}
            />
          ))}
        </div>

        <div className="sw-body" key={step}>
          {step === 0 && (
            <>
              <h3>Choose a Google Sheet</h3>
              <p className="sw-sub">
                In the live product this opens the Google Picker. Pick the spreadsheet that holds
                your loads — one row per load, with unit, week, dispatcher, trailer type, rate and
                miles.
              </p>
              <div className="sw-sheet-list">
                {SAMPLE_SHEETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`sw-sheet${picked?.id === s.id ? ' is-picked' : ''}`}
                    onClick={() => choose(s)}
                  >
                    <span className="sw-sheet-ic">
                      <SheetIcon />
                    </span>
                    <span className="sw-sheet-txt">
                      <b>{s.name}</b>
                      <span>{s.meta}</span>
                    </span>
                    {picked?.id === s.id && (
                      <span className="sw-sheet-check">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="sw-picker-note">
                <LinkIcon />
                Access is limited to the file you pick — Trucking Sheets AI never sees the rest of
                your Drive, and it only reads (never writes) your sheet.
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <h3>Match your columns</h3>
              <p className="sw-sub">
                We read the header row of <b>{picked?.name}</b> and matched what we could. Confirm or
                fix each field — you only do this once per sheet.
              </p>
              <div className="sw-map">
                {MAP_FIELDS.map((f) => (
                  <div className="sw-map-row" key={f.key}>
                    <span className="sw-map-need">
                      {f.label}
                      {f.required ? <span className="sw-req">required</span> : <span className="sw-opt">optional</span>}
                    </span>
                    <span className="sw-map-arrow">→</span>
                    <select
                      className={f.required && !mapping[f.key] ? 'is-unset' : ''}
                      value={mapping[f.key] ?? ''}
                      onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))}
                    >
                      <option value="">— not mapped —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="sw-map-hint">
                <InfoIcon />
                <span>
                  Trailer types like “reefer”, “Reefers”, “REF” are grouped into one family
                  automatically. Weeks can be numbers or dates — we normalise them.
                </span>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="sw-done">
              <span className="sw-done-ic">
                <CheckIcon />
              </span>
              <h3>Analytics are ready</h3>
              <p>
                <b>{picked?.name}</b> is connected. The dashboard now reads that sheet — weekly
                gross, RPM, revenue per truck, per trailer type and per dispatcher. Nothing else to
                set up.
              </p>
              <div className="sw-done-recap">
                <div className="sw-done-recap-row">
                  <span>Source sheet</span>
                  <b>{picked?.name}</b>
                </div>
                <div className="sw-done-recap-row">
                  <span>Columns mapped</span>
                  <b>
                    {Object.keys(mapping).filter((k) => mapping[k]).length} of {MAP_FIELDS.length}
                  </b>
                </div>
                <div className="sw-done-recap-row">
                  <span>Refresh</span>
                  <b>Live — updates as the sheet changes</b>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sw-foot">
          <span className="sw-demo-tag">Demo · nothing is actually connected</span>
          <div className="sw-foot-btns">
            {step > 0 && step < 2 && (
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeftIcon /> Back
              </button>
            )}
            {step === 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!picked}
                onClick={() => setStep(1)}
              >
                Continue
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!requiredMapped}
                onClick={() => setStep(2)}
              >
                {requiredMapped ? 'Finish setup' : 'Map all required fields'}
              </button>
            )}
            {step === 2 && (
              <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                Open dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
