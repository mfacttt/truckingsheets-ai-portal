const EMAIL_REGEX =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

const EMAIL_MAX_LENGTH = 254
const EMAIL_LOCAL_MAX_LENGTH = 64

export const INVALID_EMAIL_MESSAGE =
  "That doesn't look like a valid email address (e.g. name@gmail.com)."

export function isValidEmail(raw: string): boolean {
  const trimmed = raw.trim()
  const localLength = trimmed.split('@')[0]?.length ?? 0
  return (
    trimmed.length <= EMAIL_MAX_LENGTH &&
    localLength <= EMAIL_LOCAL_MAX_LENGTH &&
    EMAIL_REGEX.test(trimmed)
  )
}

export function getEmailHint(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || isValidEmail(trimmed)) return null

  const atCount = (trimmed.match(/@/g) ?? []).length
  if (atCount === 0) return 'Missing the @ and a domain, like name@gmail.com.'
  if (atCount > 1) return 'Only one @ is allowed.'

  const [local, domain] = trimmed.split('@')
  if (!local) return 'Missing your username before the @.'
  if (local.length > EMAIL_LOCAL_MAX_LENGTH) {
    return `The part before the @ can't exceed ${EMAIL_LOCAL_MAX_LENGTH} characters.`
  }
  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return `Email can't exceed ${EMAIL_MAX_LENGTH} characters.`
  }
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return 'No leading, trailing, or double dots before the @.'
  }
  if (!domain) return 'Missing a domain after the @, like gmail.com.'
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return 'No leading, trailing, or double dots in the domain.'
  }
  if (!domain.includes('.')) return 'Domain is missing a dot, like gmail.com.'
  if (domain.split('.').some((label) => label.startsWith('-') || label.endsWith('-'))) {
    return "A part of the domain can't start or end with a hyphen."
  }
  return INVALID_EMAIL_MESSAGE
}
