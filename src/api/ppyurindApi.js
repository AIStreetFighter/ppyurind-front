// ─────────────────────────────────────────────
// 쀼라인드 API 함수 모음 (신버전 백엔드 정렬 기준)
// ─────────────────────────────────────────────
import { api, uploadFile, setAccessToken, clearAccessToken, getAccessToken } from './client'

// ── 1. 헬스체크 ──────────────────────────────
export const checkHealth   = () => api.get('/health')
export const checkHealthDb = () => api.get('/health/db')
export const checkHealthAi = () => api.get('/health/ai')

// ── 2. 인증 / OAuth ───────────────────────────
// 소셜 로그인: 버튼 클릭 시 window.location.href = getOAuthUrl('kakao')
export const getOAuthUrl = (provider) =>
  `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/oauth/${provider}/login`

// 이메일 회원가입 — 응답: { userId, email, nickname, message } (토큰 없음 → 자동 로그인)
export async function register({ nickname, email, password }) {
  const data = await api.post('/auth/register', { nickname, email, password })
  // 회원가입 후 자동 로그인
  const loginData = await api.post('/auth/login', { email, password })
  setAccessToken(loginData.accessToken || loginData.access_token)
  return loginData
}

// 이메일 로그인 — 응답: { accessToken, tokenType, user }
export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password })
  setAccessToken(data.accessToken || data.access_token)
  return data
}

// 로그아웃
export async function logout() {
  try { await api.post('/auth/logout', {}) } catch (_) {}
  clearAccessToken()
}

// ── 3. 사용자 ─────────────────────────────────
// 응답(UserResponse): { id, nickname, email, birth_date, gender, profile_image_url,
//   ai_tone, relationship_status[], relationship_years, relationship_start_date,
//   anniversary_date, children_count, main_concern_topics[], concern_etc,
//   push_enabled, push_empathy, push_comment, push_anniversary,
//   onboarding_completed, is_adult_verified, created_at, updated_at }
export const getMe    = ()        => api.get('/users/me')
export const updateMe = (payload) => api.put('/users/me', payload)
export const deleteMe = ()        => api.delete('/users/me')

// 온보딩 (camelCase body) — /auth/onboarding
// payload: { nickname, birthDate, gender, relationshipStatus[], relationshipYears,
//   relationshipStartDate, anniversaryDate, childrenCount, mainConcernTopics[], concernEtc, aiTone }
export const saveOnboarding = (payload) => api.post('/users/me/onboarding', payload)

// 알림 설정 — PATCH /users/me/notification-settings
// payload: { notify_empathy, notify_comment, notify_anniversary }
export const updateNotificationSettings = (payload) =>
  api.patch('/users/me/notification-settings', payload)

// PIN 설정 — PUT /users/me/pin
export const setPin = (pin) => api.put('/users/me/pin', { pin })

// ── 4. 감정 기록 ──────────────────────────────
// 분석만 (저장 없음) — POST /emotions/analyze
// inputType: 'text' | 'voice' | 'image'
export const analyzeEmotion = ({ rawContent, inputType = 'text' }) =>
  api.post('/emotions/analyze', { raw_content: rawContent, input_type: inputType })

// 저장
export const createEmotion = ({ inputType = 'text', rawContent, mediaUrl, isSecretExcluded = false }) =>
  api.post('/emotions', {
    input_type: inputType,
    raw_content: rawContent,
    media_url: mediaUrl ?? null,
    is_secret_excluded: isSecretExcluded,
  })

export const listEmotions  = ({ offset = 0, limit = 20 } = {}) =>
  api.get(`/emotions?offset=${offset}&limit=${limit}`)
export const getEmotion    = (id) => api.get(`/emotions/${id}`)
export const deleteEmotion = (id) => api.delete(`/emotions/${id}`)

// 미디어 업로드 — /records/image | /records/voice (DB 저장까지 포함)
export const uploadRecordImage = (file) => uploadFile('/records/image', file)
export const uploadRecordVoice = (file) => uploadFile('/records/voice', file)

// 음성 탭 클라이언트 STT용 토큰 — GET /media/speech-token
// 응답: { token: string, region: string }
export const getSpeechToken = () => api.get('/media/speech-token')

// 대화 캡처 탭 OCR (저장 없음) — POST /media/ocr
// 응답: { masked_text: string }
export const uploadOcrImage = (file) => uploadFile('/media/ocr', file)

// ── 5. 말투 변환 ──────────────────────────────
// filterMode: 'soft' | 'honest' | 'short' | 'request'
// 응답: { original_text, converted_text, filter_mode, situation_tag }
export const convertText = ({ originalText, filterMode = 'soft', situationTag }) =>
  api.post('/filter', {
    original_text: originalText,
    filter_mode: filterMode,
    situation_tag: situationTag ?? null,
  })

// ── 6. AI 채팅 상담 ──────────────────────────
export const sendChatMessage = ({ message, history = [] }) =>
  api.post('/chat', { message, history })

// ── 7. 커뮤니티 ──────────────────────────────
export const listCommunityPosts = ({ offset = 0, limit = 20, author } = {}) => {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  if (author) params.set('author', author)
  return api.get(`/community/posts?${params.toString()}`)
}

export const listMyCommunityPosts = ({ offset = 0, limit = 50 } = {}) =>
  getAccessToken()
    ? listCommunityPosts({ offset, limit, author: 'me' })
    : Promise.resolve({ items: [], total: 0 })

export const getCommunityPost = (id) =>
  api.get(`/community/posts/${id}`)

export const createCommunityPost = ({ content, title, isAnonymous = true, isAdultOnly = false, sourceRecordId }) =>
  api.post('/community/posts', {
    content,
    title: title ?? null,
    is_anonymous: isAnonymous,
    is_adult_only: isAdultOnly,
    source_record_id: sourceRecordId ?? null,
  })

// 리액션
export const likePost    = (id) => api.post(`/community/posts/${id}/like`, {})
export const dislikePost = (id) => api.post(`/community/posts/${id}/dislike`, {})
export const empathyPost = (id) => api.post(`/community/posts/${id}/empathy`, {})
export const comfortPost = (id) => api.post(`/community/posts/${id}/comfort`, {})

// 댓글
export const listComments  = (postId) => api.get(`/community/posts/${postId}/comments`)
export const createComment = ({ postId, content, isAnonymous = true }) =>
  api.post(`/community/posts/${postId}/comments`, { content, is_anonymous: isAnonymous })

// 댓글 대댓글
export const listReplies   = (commentId) => api.get(`/community/comments/${commentId}/replies`)
export const createReply   = ({ commentId, content, isAnonymous = true }) =>
  api.post(`/community/comments/${commentId}/replies`, { content, is_anonymous: isAnonymous })
export const likeComment   = (commentId) => api.post(`/community/comments/${commentId}/like`, {})

// 내 게시글 삭제 — 백엔드 DELETE /community/posts/{id} 구현 후 사용 가능
export const deleteCommunityPost = (id) => api.delete(`/community/posts/${id}`)

// 신고 / 작성자 숨김
export const reportPost = (id, reason) => api.post(`/community/posts/${id}/report`, { reason })
export const muteAuthor = (id)         => api.post(`/community/posts/${id}/mute-author`, {})

// 유사 게시글
export const getSimilarPosts = (id) => api.get(`/community/posts/${id}/similar`)

// ── 8. 캘린더 이벤트 (경로: /events) ──────────
// 응답(EventResponse): { id, date, type, title }
// type: 'anniv' | 'birthday' | 'fight' | 'talk' | 'date'
export const listEvents  = ()        => api.get('/events')
export const deleteEvent = (id)      => api.delete(`/events/${id}`)

export const createEvent = ({ eventType, eventDate, title, description, recommendationCategory, externalLink, repeatYearly, sourceRecordId }) =>
  api.post('/events', {
    event_type: eventType,
    event_date: eventDate,
    title,
    description: description ?? null,
    recommendation_category: recommendationCategory ?? null,
    external_link: externalLink ?? null,
    repeat_yearly: repeatYearly ?? false,
    source_record_id: sourceRecordId ?? null,
  })

export const updateEvent = (id, body) => api.put(`/events/${id}`, body)

// ── 9. 관계 마음 리포트 ───────────────────────
// 응답: { report_type, period_start, period_end, emotion_summary[],
//   recurring_conflict_pattern, monthly_self_insight, record_count }
export const getReport = ({ reportType = 'weekly', periodStart, periodEnd }) =>
  api.post('/reports', {
    report_type: reportType,
    period_start: periodStart,
    period_end: periodEnd,
  })

// ── 10. 나만의 도감 (경로: /secrets) ──────────
// category: 'secret' | 'partner' | 'taboo' | 'cheat' | 'wish'
// ⚠️ 백엔드는 평면 배열 반환 → category별 그룹핑은 프론트에서
export const getDex    = ()                              => api.get('/secrets')
export const addDex    = ({ category, title, content }) => api.post('/secrets', { category, title: title ?? null, content })
export const updateDex = (id, body)                      => api.put(`/secrets/${id}`, body)
export const deleteDex = (id)                            => api.delete(`/secrets/${id}`)

// ── 11. 마음건강 자가점검 ─────────────────────
export const saveCheckup  = ({ checkupId, score, level }) =>
  api.post('/checkups', { checkup_id: checkupId, score, level })
export const listCheckups = () => api.get('/checkups')
