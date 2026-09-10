export interface AuthBridge {
  getAccessToken(): string | null
  refreshSession(): Promise<boolean>
  storeTokensFromResponse(res: Response): void
}

let bridge: AuthBridge | null = null

export function registerAuthBridge(next: AuthBridge): void {
  bridge = next
}

export function getAuthBridge(): AuthBridge | null {
  return bridge
}
