// 앱 잠금(PIN) — 기기 잠금 성격이라 검증은 로컬에서, PIN 자체는 백엔드에도 저장(영속).
// 평문 대신 간단 해시를 로컬에 보관한다(데모 수준).

const LOCK_KEY = 'ppyurind:appLock'     // '1' = 잠금 사용
const HASH_KEY = 'ppyurind:pinHash'     // PIN 해시
const UNLOCK_KEY = 'ppyurind:unlocked'  // sessionStorage: 이번 세션 해제 여부

function hashPin(pin) {
  let h = 5381
  for (let i = 0; i < pin.length; i++) h = ((h << 5) + h + pin.charCodeAt(i)) | 0
  return String(h >>> 0)
}

export function isLockEnabled() {
  return localStorage.getItem(LOCK_KEY) === '1' && !!localStorage.getItem(HASH_KEY)
}

export function enableLock(pin) {
  localStorage.setItem(HASH_KEY, hashPin(pin))
  localStorage.setItem(LOCK_KEY, '1')
  sessionStorage.setItem(UNLOCK_KEY, '1') // 방금 설정 → 이번 세션은 해제 상태
}

export function disableLock() {
  localStorage.removeItem(LOCK_KEY)
  localStorage.removeItem(HASH_KEY)
  sessionStorage.removeItem(UNLOCK_KEY)
}

export function verifyPin(pin) {
  return localStorage.getItem(HASH_KEY) === hashPin(pin)
}

export function isUnlocked() {
  return sessionStorage.getItem(UNLOCK_KEY) === '1'
}

export function markUnlocked() {
  sessionStorage.setItem(UNLOCK_KEY, '1')
}

// 앱 오픈 시 잠금화면을 띄워야 하는가
export function shouldLock() {
  return isLockEnabled() && !isUnlocked()
}
