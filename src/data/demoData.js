// 시연용 데모 데이터 — client.js가 데모 모드일 때 (method, path)로 이 리졸버를 호출한다.
// 대부분 화면은 자체 SEED/더미를 갖고 있어, 여기선 폴백이 없는 곳(사용자·캘린더·유사글·채팅 등)만 채운다.
import { ymd } from './events'

export const DEMO_UNHANDLED = Symbol('demo-unhandled')

function demoUser() {
  return {
    id: 'demo',
    nickname: '지우',
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
function demoEvents() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth()
  const mk = (year, month, day) => ymd(new Date(year, month, day))
  return [
    { id: 'd1', event_date: mk(y, m, 3),  event_type: 'talk',     title: '오래 대화한 날' },
    { id: 'd2', event_date: mk(y, m, 7),  event_type: 'date',     title: '한강 데이트' },
    { id: 'd3', event_date: mk(y, m, 11), event_type: 'fight',    title: '저녁에 다툰 날' },
    { id: 'd4', event_date: mk(y, m, 15), event_type: 'anniv',    title: '결혼기념일' },
    { id: 'd5', event_date: mk(y, m, 20), event_type: 'birthday', title: '첫째 생일' },
    { id: 'd6', event_date: mk(y, m, 26), event_type: 'date',     title: '영화 데이트' },
    { id: 'd7', event_date: mk(y, m + 1, 4), event_type: 'anniv', title: '처음 만난 날' },
  ]
}

const demoSimilar = [
  { postId: 1, content: '기념일을 매번 제가 챙기는 것 같아 서운해요', score: 0.86 },
  { postId: 4, content: '육아는 왜 늘 제 몫일까요', score: 0.82 },
  { postId: 8, content: '서로 너무 바빠서 대화가 없어요', score: 0.79 },
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

function demoChatReply() {
  return {
    reply: [
      '말해줘서 고마워요. 지금 마음이 많이 무거우셨겠어요. 🐾',
      '어떤 순간이 가장 속상하게 느껴졌는지 조금 더 들려줄래요?',
    ],
    show_safety_card: false,
    risk_level: 'normal',
  }
}

// method: 'GET'|'POST'|..., path: '/users/me' 등 (쿼리 포함 가능)
export function resolveDemo(method, path, body) {
  const p = path.split('?')[0]

  if (method === 'GET' && p === '/users/me') return demoUser()
  if (method === 'GET' && p === '/calendar') return demoEvents()
  if (method === 'GET' && /^\/community\/posts\/[^/]+\/similar$/.test(p)) return demoSimilar

  // 쓰기/상호작용 요청은 조용히 성공 처리 → 화면의 낙관적 UI/자체 폴백 사용
  if (method === 'POST' && p === '/emotions/analyze') return demoAnalysis(body)
  if (method === 'POST' && p === '/chat') return demoChatReply()
  if (method === 'POST' && p === '/calendar') return { id: 'new-' + Date.now(), ...(body || {}) }
  if (method === 'PUT' && /^\/calendar\//.test(p)) return { ...(body || {}) }
  if (method === 'POST' && p === '/secrets') return { id: 'new-' + Date.now(), ...(body || {}) }
  if (method === 'PUT' && /^\/secrets\//.test(p)) return { ...(body || {}) }
  if (method === 'PUT' && p === '/users/me') return { ...demoUser(), ...(body || {}) }

  return DEMO_UNHANDLED
}
