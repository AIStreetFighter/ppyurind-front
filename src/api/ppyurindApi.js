import { api, setAccessToken, clearAccessToken } from './client'

export function checkApiHealth() {
  return api.get('/health')
}

export async function register({ nickname, email, password }) {
  const token = await api.post('/auth/register', { nickname, email, password })
  setAccessToken(token.access_token)
  return token
}

export async function login({ email, password }) {
  const token = await api.post('/auth/login', { email, password })
  setAccessToken(token.access_token)
  return token
}

export function logout() {
  clearAccessToken()
}

export function getMe() {
  return api.get('/users/me')
}

export function saveOnboarding(payload) {
  return api.post('/users/me/onboarding', payload)
}

export function createEmotion({ inputType = 'text', rawContent, mediaUrl, isSecretExcluded = false }) {
  return api.post('/emotions', {
    input_type: inputType,
    raw_content: rawContent,
    media_url: mediaUrl || null,
    is_secret_excluded: isSecretExcluded,
  })
}

export function listEmotions({ offset = 0, limit = 20 } = {}) {
  return api.get(`/emotions?offset=${offset}&limit=${limit}`)
}

// 기록 텍스트를 AI로 분석 (DB 저장·인증 없이 결과만 반환)
export function analyzeEmotion({ rawContent, inputType = 'text' }) {
  return api.post('/emotions/analyze', {
    raw_content: rawContent,
    input_type: inputType,
  })
}

export function convertText({ originalText, filterMode = 'soft', situationTag }) {
  return api.post('/filter', {
    original_text: originalText,
    filter_mode: filterMode,
    situation_tag: situationTag || null,
  })
}

export function listCommunityPosts({ offset = 0, limit = 20 } = {}) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  return api.get(`/community/posts?${params}`)
}

export function createCommunityPost({ content, isAnonymous = true, isAdultOnly = false, sourceRecordId }) {
  return api.post('/community/posts', {
    content,
    is_anonymous: isAnonymous,
    is_adult_only: isAdultOnly,
    source_record_id: sourceRecordId || null,
  })
}

export function likeCommunityPost(postId) {
  return api.post(`/community/posts/${postId}/like`, {})
}

export function dislikeCommunityPost(postId) {
  return api.post(`/community/posts/${postId}/dislike`, {})
}

export function createComment({ postId, content, isAnonymous = true }) {
  return api.post(`/community/posts/${postId}/comments`, {
    content,
    is_anonymous: isAnonymous,
  })
}
