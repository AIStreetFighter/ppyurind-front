// ─────────────────────────────────────────────
// 쀼라인드 API 함수 모음 (명세서 v1 기준)
// 백엔드 연결 시 각 화면의 [API] 주석 위치에서 이 함수들을 import해서 사용하세요.
// ─────────────────────────────────────────────
import { api, uploadFile, setAccessToken, clearAccessToken } from './client'

// ── 1. 헬스체크 ──────────────────────────────
export const checkHealth    = ()  => api.get('/health')
export const checkHealthDb  = ()  => api.get('/health/db')
export const checkHealthAi  = ()  => api.get('/health/ai')

// ── 2. 인증 / OAuth ───────────────────────────
// 소셜 로그인: 버튼 클릭 시 window.location.href = getOAuthUrl('kakao') 형태로 사용
export const getOAuthUrl = (provider) =>
  `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/${provider}/login`

// OAuth 콜백 후 /auth/success?token=...&isNew=... 에서 토큰 추출
export function handleOAuthSuccess(searchParams) {
  const token = searchParams.get('token')
  const isNew  = searchParams.get('isNew') === 'true'
  if (token) setAccessToken(token)
  return { token, isNew }
}

// 개발용 이메일 로그인/회원가입
export async function register({ nickname, email, password }) {
  const data = await api.post('/auth/register', { nickname, email, password })
  setAccessToken(data.access_token)
  return data
}
export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password })
  setAccessToken(data.access_token)
  return data
}

// 로그아웃
export async function logout() {
  try { await api.post('/auth/logout', {}) } catch (_) {}
  clearAccessToken()
}

// ── 3. 사용자 ─────────────────────────────────
// 응답: { id, nickname, email, relation, relation_year, concerns, ai_tone, created_at }
export const getMe         = ()        => api.get('/users/me')
export const saveOnboarding = (payload) => api.post('/users/me/onboarding', payload)
// payload: { ai_tone?, relation?, relation_year?, concerns? } — 변경 필드만 포함
export const updateMe      = (payload) => api.patch('/users/me', payload)
export const deleteMe      = ()        => api.delete('/users/me')

// 알림 설정 (PWA Web Push)
export const getVapidPublicKey = () =>
  api.get('/push/vapid-public-key')
// subscription: { endpoint, keys: { p256dh, auth } } — pushManager.subscribe() 결과
export const registerPushSubscription = (subscription) =>
  api.post('/users/me/push-subscription', subscription)
export const deletePushSubscription = () =>
  api.delete('/users/me/push-subscription')
export const updateNotificationSettings = (settings) =>
  api.patch('/users/me/notification-settings', settings)
// settings: { notify_empathy, notify_comment, notify_anniversary }

// ── 4. 감정 기록 ──────────────────────────────
// 분석만 (저장 없음) — 응답: { primary_emotion, secondary_emotion, conflict_cause, hidden_need, recommended_action, new_self_insight }
export const analyzeEmotion = ({ rawContent, inputType = 'text' }) =>
  api.post('/emotions/analyze', { raw_content: rawContent, input_type: inputType })

// 저장 — 응답: emotion 객체 (분석 결과 포함)
export const createEmotion = ({ inputType = 'text', rawContent, mediaUrl, isSecretExcluded = false }) =>
  api.post('/emotions', {
    input_type: inputType,
    raw_content: rawContent,
    media_url: mediaUrl ?? null,
    is_secret_excluded: isSecretExcluded,
  })

export const listEmotions   = ({ offset = 0, limit = 20 } = {}) =>
  api.get(`/emotions?offset=${offset}&limit=${limit}`)

export const getEmotion     = (id)         => api.get(`/emotions/${id}`)
export const updateEmotion  = (id, body)   => api.put(`/emotions/${id}`, body)
export const deleteEmotion  = (id)         => api.delete(`/emotions/${id}`)

// 미디어 업로드 (음성 → stt_text, 이미지 → ocr_text 반환)
export const uploadMedia = (file) => uploadFile('/uploads', file)

// ── 5. 말투 변환 ──────────────────────────────
// filterMode: 'soft' | 'honest' | 'short' | 'request'
// 응답: { converted_text }
export const convertText = ({ originalText, filterMode = 'soft', situationTag }) =>
  api.post('/filter', {
    original_text: originalText,
    filter_mode: filterMode,
    situation_tag: situationTag ?? null,
  })

// ── 6. AI 채팅 상담 ───────────────────────────
// 응답: { reply: string[], risk_level: 'none'|'low'|'high', show_safety_card: bool }
export const sendChatMessage = ({ message, history = [] }) =>
  api.post('/chat', { message, history })

// ── 7. 커뮤니티 ──────────────────────────────
export const listCommunityPosts = ({ offset = 0, limit = 20 } = {}) =>
  api.get(`/community/posts?offset=${offset}&limit=${limit}`)

export const listMyCommunityPosts = ({ offset = 0, limit = 20 } = {}) =>
  api.get(`/community/posts?author=me&offset=${offset}&limit=${limit}`)

export const getCommunityPost = (id) =>
  api.get(`/community/posts/${id}`)

export const createCommunityPost = ({ content, isAnonymous = true, isAdultOnly = false, sourceRecordId }) =>
  api.post('/community/posts', {
    content,
    is_anonymous: isAnonymous,
    is_adult_only: isAdultOnly,
    source_record_id: sourceRecordId ?? null,
  })

// 공감/위로 토글 — 응답: { empathy_count, comfort_count, liked, comforted }
export const likePost       = (id) => api.post(`/community/posts/${id}/like`, {})
export const unlikePost     = (id) => api.post(`/community/posts/${id}/dislike`, {})
export const comfortPost    = (id) => api.post(`/community/posts/${id}/comfort`, {})

// 댓글
export const listComments = (postId) =>
  api.get(`/community/posts/${postId}/comments`)

export const createComment = ({ postId, content, isAnonymous = true, parentId }) =>
  api.post(`/community/posts/${postId}/comments`, {
    content,
    is_anonymous: isAnonymous,
    parent_id: parentId ?? null,
  })

export const likeComment = (postId, commentId) =>
  api.post(`/community/posts/${postId}/comments/${commentId}/like`, {})

// 신고 / 작성자 숨김
export const reportPost   = (id, reason) => api.post(`/community/posts/${id}/report`, { reason })
export const muteAuthor   = (id)         => api.post(`/community/posts/${id}/mute-author`, {})

// ── 8. 캘린더 이벤트 ─────────────────────────
// type: 'anniv' | 'birthday' | 'fight' | 'talk' | 'date'
export const listEvents = ({ from, to }) =>
  api.get(`/events?from=${from}&to=${to}`)

export const createEvent = ({ date, type, title }) =>
  api.post('/events', { date, type, title })

export const updateEvent = (id, body) => api.put(`/events/${id}`, body)
export const deleteEvent = (id)       => api.delete(`/events/${id}`)

// ── 10. 관계 마음 리포트 ─────────────────────
// period: 'weekly' | 'monthly'
// 응답: { period, range, summary, gaslight, emotion, phrases, weekly?, weeks?, ... }
export const getReport = (period = 'weekly') =>
  api.get(`/reports?period=${period}`)

// ── 11. 나만의 도감 ───────────────────────────
// category: 'secret' | 'partner' | 'taboo' | 'cheat' | 'wish'
export const getDex    = ()                      => api.get('/dex')
export const addDex    = ({ category, content }) => api.post('/dex', { category, content, source: 'user' })
export const deleteDex = (id)                    => api.delete(`/dex/${id}`)

// ── 13. 마음건강 자가점검 ─────────────────────
export const saveCheckup  = ({ checkupId, score, level }) =>
  api.post('/checkups', { checkup_id: checkupId, score, level })
export const listCheckups = () => api.get('/checkups')
