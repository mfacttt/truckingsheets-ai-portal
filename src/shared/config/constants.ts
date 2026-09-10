export const THEME_STORAGE_KEY = 'ts-theme'
export const MARKETPLACE_URL =
  'https://workspace.google.com/marketplace/app/dispatch_sheetsai/750221744829'
export const DISPATCH_SHEETS_URL = 'https://dispatchsheets.ai'

// --- shared Solei identity-service auth (same account as Dispatch Sheets AI) ---
export const GATEWAY_BASE: string = import.meta.env.VITE_GATEWAY_BASE || 'https://api.soleidispatch.com'
export const API_PREFIX = '/api'
export const REQUEST_TIMEOUT_MS = 8000

export const CLIENT_APP_HEADER = 'X-Client-App'
export const CLIENT_APP = 'trucking-portal'
export const DEVICE_ID_HEADER = 'X-Device-Id'
export const DEVICE_ID_STORAGE_KEY = 'ts_device_id'
export const REFRESH_TOKEN_HEADER = 'X-Refresh-Token'
export const SESSION_EXPIRED_EVENT = 'session-expired'
export const ACCESS_TOKEN_STORAGE_KEY = 'ts_access_token'
export const REFRESH_TOKEN_STORAGE_KEY = 'ts_refresh_token'
export const RESEND_COOLDOWN_SECONDS = 60
export const VERIFICATION_CODE_LENGTH = 8
