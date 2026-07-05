import { isDemo, disableDemo } from '../utils/demo'
import { resolveDemo, DEMO_UNHANDLED } from '../data/demoData'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'ppyurind.accessToken'
const REFRESH_KEY = 'ppyurind.refreshToken'

export function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

export function clearAccessToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token) {
  if (token) {
    window.localStorage.setItem(REFRESH_KEY, token)
  } else {
    window.localStorage.removeItem(REFRESH_KEY)
  }
}

// 로그인/OAuth 성공 시 두 토큰을 한 번에 저장
// 실제 토큰이 저장되면(=실 로그인) 데모 플래그를 해제한다.
// 데모 둘러보기 후 로그아웃 없이 로그인해도 목데이터에 갇히지 않도록.
export function setTokens({ access, refresh } = {}) {
  if (access) {
    setAccessToken(access)
    disableDemo()
  }
  if (refresh) setRefreshToken(refresh)
}

function clearTokens() {
  clearAccessToken()
  setRefreshToken(null)
}

function forceLogout() {
  clearTokens()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ppyurind:unauthorized'))
  }
}

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (response.status === 204) return null
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}

function errorMessage(payload, status) {
  const detail = typeof payload === 'object' ? payload?.detail : null
  if (!detail) return `오류가 발생했어요 (${status})`
  return Array.isArray(detail)
    ? detail.map(e => (typeof e === 'string' ? e : e?.msg || '입력 오류')).join(', ')
    : String(detail)
}

// ── Refresh 토큰으로 액세스 재발급 (동시 401 시 단일 요청 공유) ──
let refreshPromise = null

async function refreshAccessToken() {
  const rt = getRefreshToken()
  if (!rt) return null
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        })
        if (!res.ok) return null
        const data = await res.json()
        const newAccess = data.accessToken || data.access_token
        const newRefresh = data.refreshToken || data.refresh_token
        if (newAccess) setAccessToken(newAccess)
        if (newRefresh) setRefreshToken(newRefresh)
        return newAccess || null
      } catch {
        return null
      }
    })()
    refreshPromise.finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

export async function apiRequest(path, options = {}, _retried = false) {
  // 데모 모드: 네트워크 없이 목데이터로 응답 (미정의 경로는 조용히 null → 화면 자체 폴백)
  const isCommunityRequest = path === '/community' || path.startsWith('/community/')
  if (isDemo() && !isCommunityRequest && options.useRealApi !== true) {
    const method = (options.method || 'GET').toUpperCase()
    let body = null
    try { body = options.body ? JSON.parse(options.body) : null } catch {}
    const demoRes = resolveDemo(method, path, body)
    await new Promise(r => setTimeout(r, 150)) // 자연스러운 로딩 느낌
    return demoRes === DEMO_UNHANDLED ? null : demoRes
  }

  const token = getAccessToken()
  const { useRealApi: _useRealApi, skipAuth = false, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers || {})

  if (!headers.has('Content-Type') && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (!skipAuth && token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers })

  // 401 → refresh 1회 시도 후 원요청 재시도. refresh 대상 자체는 제외.
  if (response.status === 401 && !_retried && !skipAuth && path !== '/auth/refresh') {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiRequest(path, options, true)
    }
    // refresh 실패(또는 refresh 토큰 없음) → 세션 종료, 로그인 유도
    if (token || getRefreshToken() || isCommunityRequest) forceLogout()
  }

  const payload = await parseResponse(response)

  if (!response.ok) {
    // 재시도 후에도 401이면 세션 종료
    if (response.status === 401 && _retried && !skipAuth) forceLogout()
    throw new ApiError(errorMessage(payload, response.status), { status: response.status, payload })
  }

  return payload
}

export const api = {
  get:    (path, options)        => apiRequest(path, { ...options, method: 'GET' }),
  post:   (path, body, options)  => apiRequest(path, { ...options, method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body, options)  => apiRequest(path, { ...options, method: 'PATCH',  body: JSON.stringify(body) }),
  put:    (path, body, options)  => apiRequest(path, { ...options, method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path, options)        => apiRequest(path, { ...options, method: 'DELETE' }),
}

export async function uploadFile(path, file, _retried = false) {
  if (isDemo()) {
    await new Promise(r => setTimeout(r, 200))
    // OCR은 masked_text, 미디어 업로드는 media_url 형태를 기대 — 둘 다 채워 안전하게 반환
    return { masked_text: '○○: 오늘 늦어?\n나: 7시쯤 될 것 같아\n○○: 응\n나: 밥은 먹고 올게\n○○: 알겠어\n나: 피곤하지? 오늘 무슨 일 있었어?\n○○: 그냥', media_url: '', url: '' }
  }
  const token = getAccessToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: form })

  if (response.status === 401 && !_retried) {
    const newToken = await refreshAccessToken()
    if (newToken) return uploadFile(path, file, true)
    if (token || getRefreshToken()) forceLogout()
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401 && _retried) forceLogout()
    throw new ApiError(errorMessage(payload, response.status), { status: response.status, payload })
  }
  return payload
}
