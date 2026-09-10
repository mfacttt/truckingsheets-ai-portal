export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

const PRINTABLE_ASCII_MIN = '\x21'
const PRINTABLE_ASCII_MAX = '\x7E'

export function getPasswordHint(value: string): string | null {
  if (!value) return null
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.`
  }
  if ([...value].some((c) => c < PRINTABLE_ASCII_MIN || c > PRINTABLE_ASCII_MAX)) {
    return 'Only visible Latin letters, digits and symbols. No spaces or non-Latin characters.'
  }
  if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter.'
  if (!/[0-9]/.test(value)) return 'Add at least one digit.'
  if (!/[^a-zA-Z0-9]/.test(value)) return 'Add at least one special character (e.g. ! ? #).'
  return null
}
