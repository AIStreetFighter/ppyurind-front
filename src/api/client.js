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
export function setTokens({ access, refresh } = {}) {
  if (access) setAccessToken(access)
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
  const token = getAccessToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  // 401 → refresh 1회 시도 후 원요청 재시도. refresh 대상 자체는 제외.
  if (response.status === 401 && !_retried && path !== '/auth/refresh') {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiRequest(path, options, true)
    }
    // refresh 실패(또는 refresh 토큰 없음) → 세션 종료, 로그인 유도
    if (token || getRefreshToken()) forceLogout()
  }

  const payload = await parseResponse(response)

  if (!response.ok) {
    // 재시도 후에도 401이면 세션 종료
    if (response.status === 401 && _retried) forceLogout()
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
