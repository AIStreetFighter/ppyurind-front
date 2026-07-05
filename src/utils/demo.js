// 시연용 데모 모드 — 백엔드 없이 프론트에서 풍부한 목데이터로 동작.
// 로그인 화면의 '둘러보기'로 진입하며, 로그아웃 시 해제된다.
const DEMO_KEY = 'ppyurind:demo'
export const DEMO_GUEST_KEY = 'ppyurind:demoGuestId'

export function getOrCreateDemoGuestId() {
  try {
    const stored = localStorage.getItem(DEMO_GUEST_KEY)
    if (stored) return stored
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(DEMO_GUEST_KEY, id)
    return id
  } catch {
    return `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

export function isDemo() {
  try { return localStorage.getItem(DEMO_KEY) === '1' } catch { return false }
}

export function enableDemo() {
  try {
    localStorage.setItem(DEMO_KEY, '1')
    getOrCreateDemoGuestId()
  } catch {}
}

export function disableDemo() {
  try { localStorage.removeItem(DEMO_KEY) } catch {}
}
