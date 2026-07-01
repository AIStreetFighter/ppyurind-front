// ─────────────────────────────────────────────
// 쀼라인드 API 함수 모음 (명세서 v2 — 백엔드 코드 정렬 기준)
// 백엔드 연결 시 각 화면의 [API] 주석 위치에서 이 함수들을 import해서 사용하세요.
// 🆕 미구현 = ppyurind-backend에 아직 라우터/엔드포인트 없음 (백엔드_추가구현_필요.md 참고)
// ─────────────────────────────────────────────
import { api, uploadFile, setAccessToken, clearAccessToken } from './client'

// ── 1. 헬스체크 ──────────────────────────────
// 🆕 미구현 (백엔드에 /health 라우터 없음)
export const checkHealth    = ()  => api.get('/health')
export const checkHealthDb  = ()  => api.get('/health/db')
export const checkHealthAi  = ()  => api.get('/health/ai')

// ── 2. 인증 / OAuth ───────────────────────────
// 소셜 로그인: 버튼 클릭 시 window.location.href = getOAuthUrl('kakao') 형태로 사용
// 백엔드 신버전 경로: /auth/oauth/{provider}/login
export const getOAuthUrl = (provider) =>
  `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/oauth/${provider}/login`

// OAuth 콜백 후 /auth/success?token=...&isNew=... 에서 토큰 추출 (🆕 미구현)
export function handleOAuthSuccess(searchParams) {
  const token = searchParams.get('token')
  const isNew  = searchParams.get('isNew') === 'true'
  if (token) setAccessToken(token)
  return { token, isNew }
}

// 이메일 로그인/회원가입 (✅ 구현됨) — 응답: { access_token, token_type }
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

// 로그아웃: 서버 /auth/logout 은 🆕 미구현. JWT 무상태라 토큰 삭제만으로 충분.
export async function logout() {
  clearAccessToken()
}

// ── 3. 사용자 ─────────────────────────────────
// 응답(UserResponse): { id, nickname, email, birth_date, gender, profile_image_url,
//   ai_tone, relationship_status[], relationship_years, relationship_start_date,
//   anniversary_date, children_count, main_concern_topic, push_enabled,
//   onboarding_completed, is_adult_verified, created_at, updated_at }
export const getMe         = ()        => api.get('/users/me')

// 온보딩 저장 (✅) — payload: { relationship_status:[], relationship_years, relationship_start_date,
//   anniversary_date, children_count, main_concern_topic, ai_tone }
export const saveOnboarding = (payload) => api.post('/users/me/onboarding', payload)

// 정보 수정 (✅ PUT) — UserUpdate 가능 필드: nickname, birth_date, gender, profile_image_url,
//   ai_tone, relationship_start_date, anniversary_date, children_count, push_enabled
//   ⚠️ relationship_status / main_concern_topic 은 PUT 불가 → 온보딩으로 변경
export const updateMe      = (payload) => api.put('/users/me', payload)

// 🆕 미구현 (백엔드에 DELETE /users/me 없음)
export const deleteMe      = ()        => api.delete('/users/me')

// 알림 설정 (PWA Web Push) — 🆕 전부 미구현 (백엔드엔 push_enabled 컬럼만)
export const getVapidPublicKey = () =>
  api.get('/push/vapid-public-key')
export const registerPushSubscription = (subscription) =>
  api.post('/users/me/push-subscription', subscription)
export const deletePushSubscription = () =>
  api.delete('/users/me/push-subscription')
export const updateNotificationSettings = (settings) =>
  api.patch('/users/me/notification-settings', settings)

// ── 4. 감정 기록 ──────────────────────────────
// 분석만 (✅) — 응답(AnalyzeResult): { primary_emotion, secondary_emotion, conflict_cause,
//   hidden_need, new_self_insight, sentiment_score, risk_level, recommended_action }
export const analyzeEmotion = ({ rawContent, inputType = 'text' }) =>
  api.post('/emotions/analyze', { raw_content: rawContent, input_type: inputType })

// 저장 (✅) — 응답(EmotionResponse) 생성시각은 recorded_at 사용
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
// 🆕 미구현 (백엔드에 PUT /emotions/{id} 없음)
export const updateEmotion  = (id, body)   => api.put(`/emotions/${id}`, body)
export const deleteEmotion  = (id)         => api.delete(`/emotions/${id}`)

// 미디어 업로드 — 🆕 미구현 (백엔드에 /uploads 없음 → 음성/캡처 입력 불가)
export const uploadMedia = (file) => uploadFile('/uploads', file)

// ── 5. 말투 변환 (✅ 구현됨) ──────────────────
// filterMode: 'soft' | 'honest' | 'short' | 'request'
// 응답(FilterResponse): { original_text, converted_text, filter_mode, situation_tag }
export const convertText = ({ originalText, filterMode = 'soft', situationTag }) =>
  api.post('/filter', {
    original_text: originalText,
    filter_mode: filterMode,
    situation_tag: situationTag ?? null,
  })

// ── 6. AI 채팅 상담 ───────────────────────────
// 🆕 미구현 (백엔드에 /chat 라우터 없음)
export const sendChatMessage = ({ message, history = [] }) =>
  api.post('/chat', { message, history })

// ── 7. 커뮤니티 ──────────────────────────────
// 응답(PostResponse): { id, author_id, content, ai_summary, ai_tags[], is_anonymous,
//   is_adult_only, like_count, dislike_count, comment_count, created_at, ... }
//   ⚠️ anonymous_nickname/anonymous_avatar 는 백엔드 미생성 → 프론트 매핑 필요
export const listCommunityPosts = ({ offset = 0, limit = 20 } = {}) =>
  api.get(`/community/posts?offset=${offset}&limit=${limit}`)

// 🆕 미구현 (백엔드 목록에 author=me 필터 없음)
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

// 리액션 — 응답은 InteractionResponse(생성된 리액션 객체). 카운트는 게시글 재조회로 갱신.
export const likePost       = (id) => api.post(`/community/posts/${id}/like`, {})
export const unlikePost     = (id) => api.post(`/community/posts/${id}/dislike`, {})
// 🆕 미구현 (백엔드에 /comfort 없음 — like/dislike만 있음)
export const comfortPost    = (id) => api.post(`/community/posts/${id}/comfort`, {})

// 댓글 — 응답(InteractionResponse): { id, post_id, user_id, type, content, is_anonymous, created_at }
export const listComments = (postId) =>
  api.get(`/community/posts/${postId}/comments`)

// 작성 (✅) — ⚠️ 백엔드 CommentCreate 엔 parent_id 없음(1단 댓글만). 대댓글은 미지원.
export const createComment = ({ postId, content, isAnonymous = true }) =>
  api.post(`/community/posts/${postId}/comments`, {
    content,
    is_anonymous: isAnonymous,
  })

// 🆕 미구현 (댓글 좋아요 없음)
export const likeComment = (postId, commentId) =>
  api.post(`/community/posts/${postId}/comments/${commentId}/like`, {})

// 신고 / 작성자 숨김 — 🆕 둘 다 미구현
export const reportPost   = (id, reason) => api.post(`/community/posts/${id}/report`, { reason })
export const muteAuthor   = (id)         => api.post(`/community/posts/${id}/mute-author`, {})

// ── 8. 캘린더 이벤트 (경로: /calendar) ───────
// event_type: 'anniv' | 'birthday' | 'fight' | 'talk' | 'date'
// ⚠️ 백엔드는 from/to 쿼리 없이 전체 배열 반환 → 월별 필터는 프론트에서 처리
export const listEvents = () => api.get('/calendar')

export const createEvent = ({ eventType, eventDate, title, description, recommendationCategory, externalLink }) =>
  api.post('/calendar', {
    event_type: eventType,
    event_date: eventDate,
    title,
    description: description ?? null,
    recommendation_category: recommendationCategory ?? null,
    external_link: externalLink ?? null,
  })

export const updateEvent = (id, body) => api.put(`/calendar/${id}`, body)
export const deleteEvent = (id)       => api.delete(`/calendar/${id}`)

// ── 10. 관계 마음 리포트 (POST /reports) ─────
// reportType: 'weekly' | 'monthly', period_start/end: 'YYYY-MM-DD'
// 응답(ReportResponse): { report_type, period_start, period_end, emotion_summary[],
//   recurring_conflict_pattern, monthly_self_insight, record_count }
//   ⚠️ gaslight/phrases/weekly 등 Analysis.jsx 상세필드는 백엔드 미제공
export const getReport = ({ reportType = 'weekly', periodStart, periodEnd }) =>
  api.post('/reports', {
    report_type: reportType,
    period_start: periodStart,
    period_end: periodEnd,
  })

// ── 11. 나만의 도감 (경로: /secrets) ──────────
// category: 'secret' | 'partner' | 'taboo' | 'cheat' | 'wish'
// ⚠️ 백엔드는 평면 배열(SecretResponse[]) 반환 → category별 그룹핑은 프론트에서
export const getDex    = ()                             => api.get('/secrets')
export const addDex    = ({ category, title, content }) => api.post('/secrets', { category, title: title ?? null, content })
export const updateDex = (id, body)                     => api.put(`/secrets/${id}`, body)
export const deleteDex = (id)                           => api.delete(`/secrets/${id}`)

// ── 13. 마음건강 자가점검 ─────────────────────
// 🆕 미구현 (백엔드에 /checkups 라우터 없음)
export const saveCheckup  = ({ checkupId, score, level }) =>
  api.post('/checkups', { checkup_id: checkupId, score, level })
export const listCheckups = () => api.get('/checkups')
