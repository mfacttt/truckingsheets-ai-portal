import { fetchApi, jsonBody, throwProblem } from '@/shared/api/http-client'
import { registerAuthBridge } from '@/shared/api/auth-bridge'
import { REFRESH_TOKEN_HEADER } from '@/shared/config/constants'
import type { CurrentUser, LoginResult, VerificationPurpose } from '../model/types'
import { userFromToken } from '../model/jwt'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  storeTokensFromResponse,
} from './token-store'

async function readLoginBody(res: Response): Promise<LoginResult> {
  try {
    const body: unknown = await res.json()
    if (body !== null && typeof body === 'object') {
      const record = body as Record<string, unknown>
      const sentTo = record.codeSentTo ?? record.CodeSentTo
      const purpose = record.purpose ?? record.Purpose
      return {
        requiresCode: Boolean(record.requiresEmailCode ?? record.RequiresEmailCode),
        codeSentTo: typeof sentTo === 'string' ? sentTo : null,
        purpose: typeof purpose === 'string' ? (purpose as VerificationPurpose) : null,
      }
    }
    return { requiresCode: false, codeSentTo: null, purpose: null }
  } catch {
    return { requiresCode: false, codeSentTo: null, purpose: null }
  }
}

export function getCurrentUser(): CurrentUser | null {
  const token = getAccessToken()
  return token ? userFromToken(token) : null
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetchApi('/auth/login/email', {
    method: 'POST',
    ...jsonBody({ Email: email, Password: password }),
  })
  if (!res.ok) await throwProblem(res, 'Failed to sign in.')
  storeTokensFromResponse(res)
  return readLoginBody(res)
}

export async function confirmCode(email: string, code: string, purpose: VerificationPurpose): Promise<void> {
  const res = await fetchApi('/auth/session/confirm-verification', {
    method: 'POST',
    ...jsonBody({ Email: email, Code: code, Purpose: purpose }),
  })
  if (!res.ok) await throwProblem(res, 'Invalid or expired code.')
  storeTokensFromResponse(res)
}

export async function resendCode(email: string, purpose: VerificationPurpose): Promise<void> {
  const res = await fetchApi('/auth/session/resend-code', {
    method: 'POST',
    ...jsonBody({ Email: email, Purpose: purpose }),
  })
  if (!res.ok) await throwProblem(res, 'Failed to resend the code.')
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetchApi('/auth/password/reset', {
    method: 'POST',
    ...jsonBody({ Email: email }),
  })
  if (!res.ok) await throwProblem(res, 'Failed to send the reset code.')
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const res = await fetchApi('/auth/password/reset/confirm', {
    method: 'POST',
    ...jsonBody({ Email: email, Code: code, NewPassword: newPassword }),
  })
  if (!res.ok) await throwProblem(res, 'Failed to reset the password.')
  storeTokensFromResponse(res)
}

export async function checkVerificationCode(
  email: string,
  purpose: VerificationPurpose,
  code: string,
): Promise<void> {
  const res = await fetchApi('/auth/session/check-code', {
    method: 'POST',
    ...jsonBody({ Email: email, Purpose: purpose, Code: code }),
  })
  if (!res.ok) await throwProblem(res, 'The confirmation code is invalid.')
}

let restoreInFlight: Promise<CurrentUser | null> | null = null

export function tryRestoreSession(): Promise<CurrentUser | null> {
  if (!restoreInFlight) {
    restoreInFlight = restoreSession().finally(() => {
      restoreInFlight = null
    })
  }
  return restoreInFlight
}

async function restoreSession(): Promise<CurrentUser | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  let res: Response
  try {
    res = await fetchApi('/auth/refresh', {
      method: 'POST',
      headers: { [REFRESH_TOKEN_HEADER]: refresh },
    })
  } catch {
    return null
  }

  if (!res.ok) {
    clearTokens()
    return null
  }
  storeTokensFromResponse(res)
  return getCurrentUser()
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken()
  clearTokens()
  try {
    await fetchApi('/auth/logout', {
      method: 'POST',
      ...jsonBody({ RefreshToken: refresh ?? null }),
    })
  } catch {
    return
  }
}

registerAuthBridge({
  getAccessToken,
  refreshSession: async () => (await tryRestoreSession()) !== null,
  storeTokensFromResponse,
})
