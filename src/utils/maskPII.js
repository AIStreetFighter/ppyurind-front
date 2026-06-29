// 커뮤니티 게시 전 개인정보 마스킹
//
// 2단계 전략:
//  1) maskPIIByRegex  — 패턴이 명확한 정보(전화·이메일·주민번호·카드 등)를 프론트에서 즉시 마스킹.
//  2) maskPIIWithAI   — 실명·자녀이름·회사명·구체적 장소 등 문맥 기반 정보는
//                       백엔드(Azure AI Language PII 탐지)가 준비되면 연결.
//                       지금은 정규식 결과를 그대로 반환(no-op)하며, 연결 지점만 마련.

// ── 1) 정규식 기반 마스킹 ────────────────────────────────
// 전화번호 (010-1234-5678, 01012345678, 02-123-4567 등) — 국번만 남기고 마스킹
const PHONE_RE = /\b0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}\b/g

const RULES = [
  // 주민등록번호 (000000-0000000)
  { label: '주민번호', re: /\b\d{6}[-\s]?[1-4]\d{6}\b/g, to: '******-*******' },
  // 카드번호 (4-4-4-4)
  { label: '카드번호', re: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, to: '****-****-****-****' },
  // 이메일
  { label: '이메일', re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, to: '✱✱✱@✱✱✱' },
  // 계좌번호 비슷한 긴 숫자열 (10자리 이상)
  { label: '계좌·숫자정보', re: /\b\d{10,}\b/g, to: (m) => '*'.repeat(m.length) },
]

export function maskPIIByRegex(text) {
  if (!text) return { text: '', hits: [] }
  let out = text
  const hits = []

  // 전화번호: 국번(앞 3자리)만 남기고 마스킹 — 주민번호보다 먼저 처리하지 않도록 카드·주민 뒤에 둠
  out = out.replace(PHONE_RE, (m) => {
    hits.push('전화번호')
    return `${m.slice(0, 3)}-****-****`
  })

  for (const { label, re, to } of RULES) {
    out = out.replace(re, (m) => {
      hits.push(label)
      return typeof to === 'function' ? to(m) : to
    })
  }

  return { text: out, hits: [...new Set(hits)] }
}

// ── 2) AI 기반 마스킹 (백엔드 연결 예정) ──────────────────
// 백엔드 준비되면 이 함수 안에서 Azure AI Language PII API를 호출하도록 교체.
// 실패하거나 미연결 상태면 정규식 결과를 그대로 사용한다.
//
// 예상 시그니처:
//   POST /api/community/mask  { text }  ->  { text, entities: [{category,text}] }
export async function maskPIIWithAI(text) {
  const base = maskPIIByRegex(text)
  try {
    // TODO: 백엔드 연결 시 아래 주석 해제
    // const res = await fetch('/api/community/mask', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: base.text }),
    // })
    // if (res.ok) {
    //   const data = await res.json()
    //   return { text: data.text, hits: [...base.hits, ...data.entities.map(e => e.category)] }
    // }
    return base
  } catch {
    return base // AI 미연결/실패 시 정규식 결과로 폴백
  }
}
