export type UserRole = 'User' | 'Stuff' | 'Admin'

export interface CurrentUser {
  userId: string
  email: string
  role: UserRole
}

export interface LoginResult {
  requiresCode: boolean
  codeSentTo: string | null
  purpose: VerificationPurpose | null
}

export type VerificationPurpose =
  | 'EmailAddressConfirm'
  | 'PasswordReset'
  | 'AccountRestore'
  | 'AccountLogin'
