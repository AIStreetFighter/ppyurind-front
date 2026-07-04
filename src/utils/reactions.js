// 공감/위로 반응 + 댓글 수를 localStorage로 영속화 —
// 피드(Community)와 상세(PostDetail)가 같은 반응 상태를 공유하도록 한다.
// 서버 게시글 count는 서버 응답만 사용하고, localStorage 반응은 active 상태 보조용이다.
// 서버가 없는 로컬 게시글에 한해 저장된 반응 상태로 로컬 count를 계산한다.

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
