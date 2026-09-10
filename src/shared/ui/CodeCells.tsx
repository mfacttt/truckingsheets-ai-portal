import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { VERIFICATION_CODE_LENGTH } from '@/shared/config/constants'

export type CodeCheckStatus = 'checking' | 'valid' | 'invalid' | null

export function CodeCells({
  value,
  onChange,
  status,
}: {
  value: string
  onChange: (next: string) => void
  status: CodeCheckStatus
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const chars = Array.from({ length: VERIFICATION_CODE_LENGTH }, (_, i) => value[i] ?? '')

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      onChange(value.slice(0, index) + value.slice(index + 1))
      return
    }
    const next = (value.slice(0, index) + digits + value.slice(index + digits.length)).slice(
      0,
      VERIFICATION_CODE_LENGTH,
    )
    onChange(next)
    refs.current[Math.min(index + digits.length, VERIFICATION_CODE_LENGTH - 1)]?.focus()
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      e.preventDefault()
      onChange(value.slice(0, index - 1) + value.slice(index))
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < VERIFICATION_CODE_LENGTH - 1) {
      e.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const digits = (e.clipboardData.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, VERIFICATION_CODE_LENGTH)
    if (!digits) return
    e.preventDefault()
    onChange(digits)
    refs.current[Math.min(digits.length, VERIFICATION_CODE_LENGTH - 1)]?.focus()
  }

  const statusClass =
    status === 'valid' ? 'code-cells-valid' : status === 'invalid' ? 'code-cells-invalid' : ''

  return (
    <div className={`code-cells ${statusClass}`} onPaste={handlePaste}>
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="code-cell"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of ${VERIFICATION_CODE_LENGTH}`}
          value={char}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}
