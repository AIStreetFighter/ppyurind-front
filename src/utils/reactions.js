// 공감/위로 반응 + 댓글 수를 localStorage로 영속화 —
// 피드(Community)와 상세(PostDetail)가 같은 소스를 공유해 카운트/아이콘이 항상 일치하도록 한다.
// 규칙: 원본 카운트(post.empathy 등)는 절대 수정하지 않고, "원본 + (liked?1:0)"으로만 표시한다.

const REACT_KEY = 'ppyurind:reactions'   // { [postId]: { liked, comforted } }
const CCOUNT_KEY = 'ppyurind:commentCounts' // { [postId]: number } — 상세에서 계산한 실제 댓글 수

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

// ── 공감/위로 반응 ──────────────────────────────────────────
export function getAllReactions() { return readJson(REACT_KEY) }

export function getReaction(id) {
  return getAllReactions()[String(id)] || { liked: false, comforted: false }
}

export function setReaction(id, patch) {
  const all = getAllReactions()
  const cur = all[String(id)] || { liked: false, comforted: false }
  all[String(id)] = { ...cur, ...patch }
  localStorage.setItem(REACT_KEY, JSON.stringify(all))
  return all[String(id)]
}

// Community의 초기 state용 { [id]: true } 맵
export function likedMap() {
  const all = getAllReactions(); const m = {}
  for (const k in all) if (all[k].liked) m[k] = true
  return m
}
export function comfortedMap() {
  const all = getAllReactions(); const m = {}
  for (const k in all) if (all[k].comforted) m[k] = true
  return m
}

// ── 댓글 수 캐시 ────────────────────────────────────────────
// 상세에서 실제 로드/계산한 댓글 수를 저장 → 피드가 재사용해 "댓글 0" 불일치 제거.
export function getCommentCount(id) {
  const v = readJson(CCOUNT_KEY)[String(id)]
  return typeof v === 'number' ? v : null
}
export function setCommentCount(id, n) {
  const all = readJson(CCOUNT_KEY)
  all[String(id)] = n
  localStorage.setItem(CCOUNT_KEY, JSON.stringify(all))
}
