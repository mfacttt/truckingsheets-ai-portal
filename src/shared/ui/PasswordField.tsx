import { useState, type ChangeEvent } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  warn = false,
  autoFocus = false,
}: {
  id: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  autoComplete: string
  warn?: boolean
  autoFocus?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw-field">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={warn ? 'input-warn' : undefined}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          required
        />
        <button
          type="button"
          className="pw-eye"
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}
