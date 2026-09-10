import type { FormEvent } from 'react'
import { Banner } from '@/shared/ui/Banner'
import { Spinner } from '@/shared/ui/Spinner'
import { CodeCells } from '@/shared/ui/CodeCells'
import { PasswordField } from '@/shared/ui/PasswordField'
import { LockIcon, MailIcon } from '@/shared/ui/icons'
import { useAuthFlow, type AuthView } from '../model/use-auth-flow'

const TITLES: Record<AuthView, string> = {
  login: 'Welcome back',
  loginCode: 'Confirm your sign-in',
  forgot: 'Reset your password',
  reset: 'Enter your new password',
}

export function AuthFlow({ onAuthenticated }: { onAuthenticated: () => void }) {
  const flow = useAuthFlow(onAuthenticated)
  const {
    view,
    email,
    password,
    code,
    newPassword,
    loading,
    error,
    notice,
    codeStatus,
    resendSecondsLeft,
    canResendCode,
    emailHint,
    newPasswordHint,
  } = flow

  const isCodeView = view === 'loginCode'

  const subtitle: Record<AuthView, string> = {
    login: 'Sign in with your Solei account.',
    loginCode: `Enter the code we sent to ${email.trim() || 'your email'} to continue.`,
    forgot: "Enter your account email. We'll send a reset code.",
    reset: `We sent a reset code to ${email.trim() || 'your email'}.`,
  }

  function onSubmit(e: FormEvent, action: () => void) {
    e.preventDefault()
    action()
  }

  return (
    <div className="card auth-card" key={view}>
      {(isCodeView || view === 'forgot' || view === 'reset') && (
        <div className="auth-ic" aria-hidden="true">
          {view === 'forgot' ? <LockIcon /> : <MailIcon />}
        </div>
      )}
      <div className="auth-head">
        <h1>{TITLES[view]}</h1>
        <p>{subtitle[view]}</p>
      </div>

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="info">{notice}</Banner>}

      {view === 'login' && (
        <form onSubmit={(e) => onSubmit(e, flow.submitCredentials)}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              className={emailHint ? 'input-warn' : undefined}
              autoComplete="email"
              value={email}
              onChange={(e) => flow.setEmail(e.target.value)}
              autoFocus
              required
            />
            {emailHint && <div className="field-hint-warn">{emailHint}</div>}
          </div>
          <PasswordField
            id="auth-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => flow.setPassword(e.target.value)}
          />
          <p className="auth-aside">
            <button
              type="button"
              className="linklike"
              disabled={loading}
              onClick={() => flow.switchView('forgot')}
            >
              Forgot your password?
            </button>
          </p>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Sign in'}
          </button>
        </form>
      )}

      {isCodeView && (
        <>
          <form onSubmit={(e) => onSubmit(e, flow.submitCode)}>
            <CodeCells value={code} onChange={flow.changeCode} status={codeStatus} />
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Confirm and sign in'}
            </button>
          </form>
          <p className="auth-switch">
            {canResendCode && (
              <>
                <button
                  type="button"
                  className="linklike"
                  disabled={loading || resendSecondsLeft > 0}
                  onClick={flow.resendCode}
                >
                  {resendSecondsLeft > 0 ? `Resend code (${resendSecondsLeft}s)` : 'Resend code'}
                </button>
                {' · '}
              </>
            )}
            <button
              type="button"
              className="linklike"
              disabled={loading}
              onClick={() => flow.switchView('login')}
            >
              Back to sign in
            </button>
          </p>
        </>
      )}

      {view === 'forgot' && (
        <>
          <form onSubmit={(e) => onSubmit(e, flow.submitForgot)}>
            <div className="field">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                className={emailHint ? 'input-warn' : undefined}
                autoComplete="email"
                value={email}
                onChange={(e) => flow.setEmail(e.target.value)}
                autoFocus
                required
              />
              {emailHint && <div className="field-hint-warn">{emailHint}</div>}
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Send reset code'}
            </button>
          </form>
          <p className="auth-switch">
            <button
              type="button"
              className="linklike"
              disabled={loading}
              onClick={() => flow.switchView('login')}
            >
              Back to sign in
            </button>
          </p>
        </>
      )}

      {view === 'reset' && (
        <>
          <form onSubmit={(e) => onSubmit(e, flow.submitReset)}>
            <CodeCells value={code} onChange={flow.changeCode} status={codeStatus} />
            <PasswordField
              id="reset-password"
              label="New password"
              warn={Boolean(newPasswordHint)}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => flow.setNewPassword(e.target.value)}
            />
            {newPasswordHint && <div className="field-hint-warn hint-under">{newPasswordHint}</div>}
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Set new password and sign in'}
            </button>
          </form>
          <p className="auth-switch">
            <button
              type="button"
              className="linklike"
              disabled={loading}
              onClick={() => flow.switchView('login')}
            >
              Back to sign in
            </button>
          </p>
        </>
      )}
    </div>
  )
}
