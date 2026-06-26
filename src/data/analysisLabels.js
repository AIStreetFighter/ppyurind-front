// 분석 기준 라벨 — UI 비노출, AI 분석 로직에서 참조용
// 출처: 통계청·여가부·가족센터·가정법률상담소·Gottman·PHQ-9

// ── 감정 라벨 (primary_emotion / secondary_emotion)
export const EMOTION_LABELS = [
  { id: 'hurt',      label: '서운함',   desc: '기대했던 반응을 받지 못해 마음이 상한 상태' },
  { id: 'lonely',    label: '외로움',   desc: '관계 안에서 혼자라고 느끼는 상태' },
  { id: 'anger',     label: '분노',     desc: '부당함·반복된 실망·무시로 인해 화가 난 상태' },
  { id: 'anxiety',   label: '불안',     desc: '관계가 흔들릴까 걱정하거나 확신이 부족한 상태' },
  { id: 'frustrated',label: '답답함',   desc: '말이 통하지 않거나 상황이 풀리지 않는 느낌' },
  { id: 'wounded',   label: '상처',     desc: '말이나 행동으로 인해 마음이 다친 상태' },
  { id: 'confused',  label: '혼란',     desc: '상대의 말과 행동이 달라 판단이 어려운 상태' },
  { id: 'guilty',    label: '죄책감',   desc: '자신의 말이나 행동을 후회하는 상태' },
  { id: 'helpless',  label: '무력감',   desc: '바꿔보려 해도 달라지지 않는다고 느끼는 상태' },
  { id: 'fear',      label: '두려움',   desc: '상대나 상황으로 인해 안전하지 않다고 느끼는 상태' },
  { id: 'hopeful',   label: '기대감',   desc: '관계가 좋아질 가능성을 기대하는 상태' },
  { id: 'stable',    label: '안정감',   desc: '관계 안에서 편안함과 신뢰를 느끼는 상태' },
]

// ── 갈등 원인 라벨 (conflict_cause) — 공식 기관 지표 통합
export const CONFLICT_LABELS = [
  { id: 'communication',  label: '대화 단절',        source: '여가부·가족센터' },
  { id: 'empathy',        label: '공감 부족',         source: '가족센터·학술' },
  { id: 'personality',    label: '성격·가치관 차이',  source: '통계청 45.2%' },
  { id: 'economy',        label: '경제·소비 갈등',    source: '통계청 10.2%' },
  { id: 'housework',      label: '가사 분담',         source: '여가부·가족센터' },
  { id: 'childcare',      label: '육아 분담',         source: '여가부·가정법률' },
  { id: 'family',         label: '시댁·처가 갈등',    source: '통계청 7.4%' },
  { id: 'intimacy',       label: '스킨십·친밀감',     source: '가족센터·학술' },
  { id: 'trust',          label: '신뢰 문제',         source: '통계청 7.0%' },
  { id: 'promise',        label: '약속 불이행',       source: '학술 분류' },
  { id: 'affection',      label: '감정표현 부족',     source: '학술 분류' },
  { id: 'avoidance',      label: '회피·묵묵부답',     source: '학술 분류' },
  { id: 'lifestyle',      label: '생활패턴 차이',     source: '학술 분류' },
  { id: 'repeat',         label: '반복 다툼',         source: '학술 분류' },
  { id: 'child_plan',     label: '아이 계획',         source: '신혼·연애 특화' },
  { id: 'future',         label: '미래 계획',         source: '연애 특화' },
  { id: 'health',         label: '건강·생활습관',     source: '통계청·가정법률' },
]

// ── 숨은 욕구 라벨 (hidden_need)
export const HIDDEN_NEED_LABELS = [
  { id: 'need_empathy',     label: '공감받고 싶음' },
  { id: 'need_respect',     label: '존중받고 싶음' },
  { id: 'need_stability',   label: '안정감을 느끼고 싶음' },
  { id: 'need_shared',      label: '함께 책임지고 싶음' },
  { id: 'need_first_move',  label: '먼저 다가와주길 바람' },
  { id: 'need_on_my_side',  label: '내 편이라는 확신이 필요함' },
  { id: 'need_love_check',  label: '사랑받고 있다는 확인이 필요함' },
  { id: 'need_trust',       label: '신뢰를 회복하고 싶음' },
  { id: 'need_not_alone',   label: '혼자 감당하고 싶지 않음' },
  { id: 'need_safety',      label: '안전하게 보호받고 싶음' },
  { id: 'need_autonomy',    label: '자율성을 존중받고 싶음' },
  { id: 'need_recognition', label: '인정받고 싶음' },
]

// ── 대화 패턴 라벨 (communication_pattern) — Gottman 4기사 기반
export const COMM_PATTERN_LABELS = [
  { id: 'criticism',    label: '비난',          type: 'negative', desc: '특정 행동이 아닌 사람 자체를 공격하는 표현' },
  { id: 'contempt',     label: '경멸',          type: 'negative', desc: '조롱·무시·비웃음·우월감이 담긴 표현' },
  { id: 'defensive',    label: '방어',          type: 'negative', desc: '책임 불인정, 변명, 역으로 탓함' },
  { id: 'stonewalling', label: '회피·묵묵부답', type: 'negative', desc: '대화에서 빠지거나 침묵으로 대응' },
  { id: 'explosion',    label: '감정폭발',      type: 'negative', desc: '감정이 격해져 표현 수위가 높아짐' },
  { id: 'repeat_push',  label: '반복설득',      type: 'negative', desc: '같은 말을 반복하며 상대를 설득하려 함' },
  { id: 'solution_first', label: '문제해결 우선', type: 'neutral', desc: '감정 공감보다 해결책을 먼저 제시' },
  { id: 'empathy_try',  label: '공감시도',      type: 'positive', desc: '상대 감정을 이해하려는 표현' },
  { id: 'repair',       label: '화해시도',      type: 'positive', desc: '갈등을 줄이거나 관계를 회복하려는 표현' },
  { id: 'self_express', label: '자기표현',      type: 'positive', desc: '비난 없이 자신의 감정과 욕구를 말함' },
]

// ── 스트레스 유발 요인 라벨 (stressors) — 주간/월간 리포트·비밀도감 자동 추출용
export const STRESSOR_LABELS = [
  { id: 'money',      label: '돈·경제' },
  { id: 'childcare',  label: '자녀·육아' },
  { id: 'partner',    label: '배우자 태도' },
  { id: 'family',     label: '처가·시댁·가족' },
  { id: 'housework',  label: '가사·생활관리' },
  { id: 'work',       label: '직장·학업' },
  { id: 'health',     label: '건강·수면' },
  { id: 'contact',    label: '연락·시간' },
  { id: 'intimacy',   label: '스킨십·친밀감' },
  { id: 'phone',      label: '휴대폰·SNS' },
  { id: 'anniversary',label: '기념일·선물' },
  { id: 'future',     label: '미래계획' },
]

// ── 위험도 라벨 (risk_level)
export const RISK_LEVELS = {
  normal:  { label: '일반',  action: 'AI 분석 및 기록 저장' },
  caution: { label: '주의',  action: 'AI 분석 + 상담기관 연결 안내' },
  danger:  { label: '위험',  action: '안전 안내 우선, 긴급 기관 연결' },
}

// ── 비밀도감 자동 추출 카테고리
export const SECRET_NOTE_CATEGORIES = [
  { id: 'taboo',    label: '조심해야 할 대화 주제', desc: '건드리면 감정이 크게 상하는 주제' },
  { id: 'cheatkey', label: '기분 풀리는 치트키',    desc: '기분이 풀리거나 안정되는 행동·음식·장소' },
  { id: 'wishlist', label: '흘려 말한 위시리스트',  desc: '원하는 것, 받고 싶은 것, 해보고 싶은 것' },
  { id: 'hurt',     label: '반복 서운함 포인트',    desc: '반복적으로 상처받는 패턴' },
]

// ── AI 응답 톤
export const AI_TONE_OPTIONS = [
  { id: 'soft',     label: '부드럽게',    desc: '따뜻하고 위로 중심의 응답' },
  { id: 'honest',   label: '현실적으로',  desc: '핵심을 분명하게 짚는 응답' },
  { id: 'empathy',  label: '공감 중심',   desc: '감정 공감을 최우선으로 하는 응답' },
  { id: 'solution', label: '해결책 중심', desc: '실질적 개선 방향을 제시하는 응답' },
]
