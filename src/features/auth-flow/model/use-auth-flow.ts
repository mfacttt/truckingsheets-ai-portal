import { useRef, useState } from 'react'
import { errorMessage } from '@/shared/api/api-error'
import { VERIFICATION_CODE_LENGTH } from '@/shared/config/constants'
import { getEmailHint, isValidEmail, INVALID_EMAIL_MESSAGE } from '@/shared/lib/validators/email'
import { getPasswordHint } from '@/shared/lib/validators/password'
import { useCooldown } from '@/shared/lib/hooks/use-cooldown'
import {
  checkVerificationCode,
  confirmCode,
  confirmPasswordReset,
  login,
  requestPasswordReset,
  resendCode as resendCodeApi,
} from '@/entities/session/api/session-api'
import type { VerificationPurpose } from '@/entities/session/model/types'
import type { CodeCheckStatus } from '@/shared/ui/CodeCells'

export type AuthView = 'login' | 'loginCode' | 'forgot' | 'reset'

const CODE_PURPOSES: Partial<Record<AuthView, VerificationPurpose>> = {
  loginCode: 'AccountLogin',
  reset: 'PasswordReset',
}

function noticeForPurpose(purpose: VerificationPurpose | null, sentTo: string): string {
  if (purpose === 'EmailAddressConfirm') {
    return `Your email isn't verified yet. Enter the code we sent to ${sentTo}.`
  }
  if (purpose === 'AccountRestore') {
    return `This account is scheduled for deletion. Enter the code we sent to ${sentTo} to restore it.`
  }
  return `For your security, confirm this sign-in. We sent a code to ${sentTo}.`
}

const GENERIC_FAILURE = 'Something went wrong. Please try again.'

const CODE_CHECK_DEBOUNCE_MS = 700

export interface AuthFlow {
  view: AuthView
  email: string
  password: string
  code: string
  newPassword: string
  loading: boolean
  error: string | null
  notice: string | null
  codeStatus: CodeCheckStatus
  resendSecondsLeft: number
  canResendCode: boolean
  emailHint: string | null
  newPasswordHint: string | null
  setEmail(value: string): void
  setPassword(value: string): void
  setNewPassword(value: string): void
  changeCode(value: string): void
  switchView(view: AuthView): void
  submitCredentials(): void
  submitCode(): void
  submitForgot(): void
  submitReset(): void
  resendCode(): void
}

export function useAuthFlow(onAuthenticated: () => void): AuthFlow {
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [codeStatus, setCodeStatus] = useState<CodeCheckStatus>(null)
  const probeSeq = useRef(0)
  const probeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const checkedCodes = useRef(new Map<string, boolean>())
  const resend = useCooldown()

  function probeCode(codeValue: string) {
    const purpose = CODE_PURPOSES[view]
    if (!purpose) return

    const remembered = checkedCodes.current.get(codeValue)
    if (remembered !== undefined) {
      setCodeStatus(remembered ? 'valid' : 'invalid')
      return
    }

    const requestId = ++probeSeq.current
    if (probeTimer.current) clearTimeout(probeTimer.current)
    probeTimer.current = setTimeout(() => {
      setCodeStatus('checking')
      void (async () => {
        try {
          await checkVerificationCode(email.trim(), purpose, codeValue)
          checkedCodes.current.set(codeValue, true)
          if (probeSeq.current === requestId) setCodeStatus('valid')
        } catch (err) {
          checkedCodes.current.set(codeValue, false)
          if (probeSeq.current === requestId) {
            setCodeStatus('invalid')
            setError(errorMessage(err, GENERIC_FAILURE))
          }
        }
      })()
    }, CODE_CHECK_DEBOUNCE_MS)
  }

  function resetCodeState() {
    probeSeq.current += 1
    if (probeTimer.current) clearTimeout(probeTimer.current)
    checkedCodes.current.clear()
    setCode('')
    setCodeStatus(null)
  }

  function switchView(next: AuthView) {
    setError(null)
    setNotice(null)
    resetCodeState()
    setView(next)
  }

  function changeCode(next: string) {
    probeSeq.current += 1
    setCode(next)
    setCodeStatus(null)
    if (next) {
      setNotice(null)
      setError(null)
    }
    if (next.length === VERIFICATION_CODE_LENGTH) probeCode(next)
  }

  async function run(action: () => Promise<void>) {
    setError(null)
    setLoading(true)
    try {
      await action()
    } catch (err) {
      setError(errorMessage(err, GENERIC_FAILURE))
    } finally {
      setLoading(false)
    }
  }

  function submitCredentials() {
    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError(getEmailHint(email) ?? INVALID_EMAIL_MESSAGE)
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    setNotice(null)
    void run(async () => {
      const { requiresCode, codeSentTo, purpose } = await login(trimmedEmail, password)
      if (requiresCode) {
        const sentTo = codeSentTo ?? trimmedEmail
        setEmail(sentTo)
        resend.start()
        setNotice(noticeForPurpose(purpose, sentTo))
        resetCodeState()
        setView('loginCode')
        return
      }
      onAuthenticated()
    })
  }

  function submitCode() {
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      setError(`Enter all ${VERIFICATION_CODE_LENGTH} digits of the code.`)
      return
    }
    if (checkedCodes.current.get(code) === false) {
      setError('That code is not right. Check it and try again.')
      return
    }
    const purpose = CODE_PURPOSES[view]
    void run(async () => {
      if (!purpose) return
      await confirmCode(email.trim(), code, purpose)
      onAuthenticated()
    })
  }

  function resendCode() {
    if (resend.secondsLeft > 0 || loading) return
    setError(null)
    setNotice(null)
    checkedCodes.current.clear()
    const purpose = CODE_PURPOSES[view]
    void run(async () => {
      if (!purpose) return
      await resendCodeApi(email.trim(), purpose)
      resend.start()
      setNotice('A new code is on its way.')
    })
  }

  function submitForgot() {
    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError(getEmailHint(email) ?? INVALID_EMAIL_MESSAGE)
      return
    }
    setNotice(null)
    void run(async () => {
      await requestPasswordReset(trimmedEmail)
      resend.start()
      setNotice(`If ${trimmedEmail} has an account, a reset code is on its way.`)
      resetCodeState()
      setView('reset')
    })
  }

  function submitReset() {
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      setError(`Enter all ${VERIFICATION_CODE_LENGTH} digits of the code.`)
      return
    }
    const problem = getPasswordHint(newPassword) ?? (newPassword ? null : 'Enter a new password.')
    if (problem) {
      setError(problem)
      return
    }
    void run(async () => {
      await confirmPasswordReset(email.trim(), code, newPassword)
      onAuthenticated()
    })
  }

  return {
    view,
    email,
    password,
    code,
    newPassword,
    loading,
    error,
    notice,
    codeStatus,
    resendSecondsLeft: resend.secondsLeft,
    canResendCode: CODE_PURPOSES[view] !== undefined,
    emailHint: getEmailHint(email),
    newPasswordHint: view === 'reset' ? getPasswordHint(newPassword) : null,
    setEmail,
    setPassword,
    setNewPassword,
    changeCode,
    switchView,
    submitCredentials,
    submitCode,
    submitForgot,
    submitReset,
    resendCode,
  }
}
