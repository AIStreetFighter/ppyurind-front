const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'ppyurind.accessToken'

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

export async function apiRequest(path, options = {}) {
  const token = getAccessToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  const payload = await parseResponse(response)

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload?.detail
        ? payload.detail
        : `API request failed with ${response.status}`
    throw new ApiError(message, { status: response.status, payload })
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

export async function uploadFile(path, file) {
  const token = getAccessToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: form })
  const payload = await parseResponse(response)
  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.detail ? payload.detail : `Upload failed ${response.status}`
    throw new ApiError(message, { status: response.status, payload })
  }
  return payload
}
