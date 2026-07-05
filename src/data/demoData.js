// 시연용 데모 데이터 — client.js가 데모 모드일 때 (method, path)로 이 리졸버를 호출한다.
// 대부분 화면은 자체 SEED/더미를 갖고 있어, 여기선 폴백이 없는 곳(사용자·캘린더·유사글·채팅 등)만 채운다.
import { createMockEvents } from './events'

export const DEMO_UNHANDLED = Symbol('demo-unhandled')

function demoUser() {
  return {
    id: 'demo',
    nickname: localStorage.getItem('ppyurind:nickname') || '지우',
    email: 'demo@ppyurind.app',
    onboarding_completed: true,
    ai_tone: '부드럽게',
    push_empathy: true,
    push_comment: true,
    push_anniversary: true,
    relationship_status: ['신혼'],
    relationship_years: 2,
    main_concern_topics: ['대화 단절', '서운함', '가사 분담'],
  }
}

// 항상 '이번 달'에 일정이 보이도록 현재 월 기준으로 생성
const demoSimilar = [
  { postId: 1, content: '기념일을 매번 제가 챙기는 것 같아 서운해요', similarityScore: 86 },
  { postId: 4, content: '육아는 왜 늘 제 몫일까요', similarityScore: 82 },
  { postId: 8, content: '서로 너무 바빠서 대화가 없어요', similarityScore: 79 },
  { postId: 99, content: '결혼 후 스킨십이 확 줄었어요. 먼저 다가가기도 눈치 보여요', similarityScore: 74, is_adult: true },
]

function demoAnalysis(body) {
  const summary = '오늘 기록엔 상대에게 서운했던 마음과, 그래도 잘 지내고 싶은 바람이 함께 담겨 있어요.'
  return {
    summary,
    emotions: ['서운함', '답답함', '기대감'],
    conflictTopic: '대화 방식',
    hiddenNeed: '존중받고 인정받고 싶은 마음',
    relationshipPattern: '반복되는 말투 갈등',
    riskLevel: 'normal',
    recommendedMessage: '나는 그 말투가 조금 차갑게 느껴져서 서운했어. 내 마음도 알아주면 좋겠어.',
    recommended_action: '오늘은 상대의 행동보다 내가 느낀 감정을 먼저 한 문장으로 전해보세요.',
    suggestedAction: '오늘은 상대의 행동보다 내가 느낀 감정을 먼저 한 문장으로 전해보세요.',
    tags: ['말투', '인정욕구', '대화단절'],
    raw_content: body?.raw_content ?? '',
  }
}

// method: 'GET'|'POST'|..., path: '/users/me' 등 (쿼리 포함 가능)
export function resolveDemo(method, path, body) {
  const p = path.split('?')[0]

  if (method === 'GET' && p === '/users/me') return demoUser()
  if (method === 'GET' && p === '/calendar') return createMockEvents()
  // 커뮤니티 목록: DEMO_UNHANDLED → catch → setApiPosts(null) → Community.jsx ALL_POSTS(25개) 사용
  if (method === 'GET' && p === '/community/posts') return DEMO_UNHANDLED
  if (method === 'GET' && /^\/community\/posts\/[^/]+\/similar$/.test(p)) return demoSimilar
  // 댓글 목록: 데모 모드에선 댓글 데이터가 없으므로 빈 목록 반환 (undefined면 화면에서 크래시)
  if (method === 'GET' && /^\/community\/posts\/[^/]+\/comments$/.test(p)) return { comments: [], total: 0 }

  // 쓰기/상호작용 요청은 조용히 성공 처리 → 화면의 낙관적 UI/자체 폴백 사용
  if (method === 'POST' && p === '/emotions/analyze') return demoAnalysis(body)
  if (method === 'POST' && p === '/chat') return DEMO_UNHANDLED
  if (method === 'POST' && p === '/calendar') return { id: 'new-' + Date.now(), ...(body || {}) }
  if (method === 'PUT' && /^\/calendar\//.test(p)) return { ...(body || {}) }
  if (method === 'POST' && p === '/secrets') return { id: 'new-' + Date.now(), ...(body || {}) }
  if (method === 'PUT' && /^\/secrets\//.test(p)) return { ...(body || {}) }
  if (method === 'PUT' && p === '/users/me') return { ...demoUser(), ...(body || {}) }

  // 커뮤니티 익명 게시 — Record → 공유 플로우 완성
  if (method === 'POST' && p === '/community/posts') {
    return {
      id: 'demo-post-' + Date.now(),
      title: body?.title ?? '속마음 기록',
      content: body?.content ?? '',
      is_anonymous: true,
      anonymous_nickname: '익명의 쀼냥',
      anonymous_avatar: 'cat_02_t',
      empathy_count: 0, comfort_count: 0, comment_count: 0,
      ai_tags: ['서운함', '대화단절'],
      created_at: new Date().toISOString(),
    }
  }
  if (method === 'DELETE' && /^\/community\/posts\//.test(p)) return null
  if (method === 'POST' && /^\/community\/posts\/[^/]+(\/like|\/empathy|\/comfort|\/dislike)$/.test(p)) return null

  // 말투 변환 — 톤별 고정 응답 (Translate.jsx 자체 mockConvert 폴백보다 더 자연스럽게)
  if (method === 'POST' && p === '/filter') {
    const tone = body?.filter_mode || 'soft'
    const converted = {
      soft:    '오늘 말이 없었던 것 같아서 나 좀 외로웠어. 조금만 더 얘기해줄 수 있어?',
      honest:  '솔직히 오늘 너무 말이 없어서 서운했어. 나도 힘들었거든.',
      short:   '오늘 좀 외로웠어. 나중에 얘기하자.',
      request: '오늘 퇴근하고 10분만 나랑 얘기해줄 수 있어?',
    }
    return {
      original_text: body?.original_text ?? '',
      converted_text: converted[tone] ?? converted.soft,
      filter_mode: tone,
      situation_tag: body?.situation_tag ?? null,
    }
  }

  return DEMO_UNHANDLED
}
