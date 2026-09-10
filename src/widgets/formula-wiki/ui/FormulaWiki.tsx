import { useEffect } from 'react'
import { CloseIcon } from '@/shared/ui/icons'
import { FORMULA_WIKI, FORMULA_WIKI_ORDER } from '../model/content'
import './formula-wiki.css'

export function FormulaWiki({
  code,
  onSelect,
  onClose,
}: {
  code: string
  onSelect(code: string): void
  onClose(): void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const entry = FORMULA_WIKI[code] ?? FORMULA_WIKI.start!

  return (
    <div className="fw-veil" onClick={onClose}>
      <div className="fw-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Formula wiki">
        <nav className="fw-nav">
          {FORMULA_WIKI_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              className={`fw-nav-item${c === entry.code ? ' is-active' : ''}`}
              onClick={() => onSelect(c)}
            >
              {FORMULA_WIKI[c]?.nav}
            </button>
          ))}
        </nav>
        <div className="fw-body">
          <button className="fw-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
          <h3>{entry.title}</h3>
          {/* Static, hand-authored glossary copy — no user input reaches this HTML. */}
          <div dangerouslySetInnerHTML={{ __html: entry.html }} />
        </div>
      </div>
    </div>
  )
}
