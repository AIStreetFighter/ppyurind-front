// 상담기관 · 국가/지자체 지원사업(바우처) 정보
// 지역·연도별로 조건이 달라질 수 있어 "대표 사업명 + 한 줄 설명 + 안내처" 수준으로 정적 노출.
// 상세는 각 기관 문의 안내.

// 긴급 연락처 — 위험(danger) 또는 안전 점검 양성 시 최우선 노출
export const EMERGENCY_CONTACTS = [
  { name: '자살예방 상담전화', tel: '109', desc: '24시간 · 전화 상담' },
  { name: '정신건강 상담전화', tel: '1577-0199', desc: '24시간 · 정신건강 위기 상담' },
  { name: '여성긴급전화', tel: '1366', desc: '24시간 · 가정폭력·위기 지원' },
]

// 상담기관 — 5점 이상(가벼운 신호~)부터 노출
export const COUNSEL_CENTERS = [
  {
    name: '정신건강복지센터',
    tag: '무료 상담',
    desc: '전국 시·군·구 단위 운영. 무료 심리상담과 사례관리, 의료기관 연계를 제공해요.',
    link: 'https://www.mentalhealth.go.kr',
    linkLabel: '센터 찾기',
  },
  {
    name: '가족센터 (여성가족부)',
    tag: '부부·가족 상담',
    desc: '부부관계·가족관계 상담 프로그램을 운영해요. 일부 상담은 무료 또는 저비용이에요.',
    link: 'https://www.familynet.or.kr',
    linkLabel: '센터 찾기',
  },
]

// 국가/지자체 지원사업(바우처) — 5점 이상부터 노출, 점수 높을수록 위에
export const SUPPORT_PROGRAMS = [
  {
    name: '청년마음건강지원사업',
    tag: '바우처 · 만 19~34세',
    desc: '전문 심리상담을 최대 10회 지원해요. 소득에 따라 본인부담이 일부 있어요(자기부담 10% 내외).',
    link: 'https://www.bokjiro.go.kr',
    linkLabel: '복지로에서 확인',
  },
  {
    name: '전국민 마음투자 지원사업',
    tag: '바우처 · 전 연령',
    desc: '우울·불안 등으로 도움이 필요한 국민에게 전문 심리상담 바우처를 제공해요(8회 기준).',
    link: 'https://www.bokjiro.go.kr',
    linkLabel: '복지로에서 확인',
  },
]

// 점수/위험도에 따라 노출할 정보 묶음 결정 (B안: 5점부터 지원사업 노출)
//  - urgent=true (자해 신호/안전 점검 양성): 긴급 연락처 우선
//  - score >= 5: 상담기관 + 지원사업
//  - score < 5: 노출 안 함(격려 멘트만)
export function resolveSupport({ score = 0, urgent = false } = {}) {
  if (urgent) {
    return { urgent: true, emergency: EMERGENCY_CONTACTS, centers: COUNSEL_CENTERS, programs: [] }
  }
  if (score >= 5) {
    return { urgent: false, emergency: [], centers: COUNSEL_CENTERS, programs: SUPPORT_PROGRAMS }
  }
  return { urgent: false, emergency: [], centers: [], programs: [] }
}
