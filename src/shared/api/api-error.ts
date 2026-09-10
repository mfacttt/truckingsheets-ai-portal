export class ApiError extends Error {
  readonly code: string | null
  readonly status: number

  constructor(message: string, code: string | null, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function errorCode(error: unknown): string | null {
  return error instanceof ApiError ? error.code : null
}

export function isCodeAlreadySent(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.status === 429) return true
  const text = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  return (
    /\bcode\b[^.]{0,30}\bsent\b/.test(text) ||
    /already[^.]{0,20}\b(code|sent)\b/.test(text) ||
    /\bwait\b[^.]{0,20}(minute|second|moment|before)/.test(text) ||
    /too soon|recently sent|resend|throttl/.test(text)
  )
}
