// 공감/위로 반응 + 댓글 수를 localStorage로 영속화 —
// 피드(Community)와 상세(PostDetail)가 같은 반응 상태를 공유하도록 한다.
// 서버 게시글 count는 서버 응답만 사용하고, localStorage 반응은 active 상태 보조용이다.
// 서버가 없는 로컬 게시글에 한해 저장된 반응 상태로 로컬 count를 계산한다.

const REACT_KEY = 'ppyurind:reactions'   // { [postId]: { liked, comforted } }
const CCOUNT_KEY = 'ppyurind:commentCounts' // { [postId]: number } — 상세에서 계산한 실제 댓글 수
const DEMO_REACT_KEY = 'ppyurind:demo:reactions'
const DEMO_COMMENTS_KEY = 'ppyurind:demo:comments'
const DEMO_CCOUNT_KEY = 'ppyurind:demo:commentCounts'

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

export function getAllDemoReactions() { return readJson(DEMO_REACT_KEY) }
export function getDemoReaction(id) {
  return getAllDemoReactions()[String(id)] || { liked: false, comforted: false, empathyCount: 0, comfortCount: 0 }
}
export function setDemoReaction(id, patch) {
  const all = getAllDemoReactions()
  all[String(id)] = { ...getDemoReaction(id), ...patch }
  localStorage.setItem(DEMO_REACT_KEY, JSON.stringify(all))
  return all[String(id)]
}
export function demoLikedMap() {
  const all = getAllDemoReactions(); const result = {}
  for (const id in all) if (all[id].liked) result[id] = true
  return result
}
export function demoComfortedMap() {
  const all = getAllDemoReactions(); const result = {}
  for (const id in all) if (all[id].comforted) result[id] = true
  return result
}
export function getDemoComments(postId) {
  const comments = readJson(DEMO_COMMENTS_KEY)[String(postId)]
  return Array.isArray(comments) ? comments : []
}
export function countActiveDemoComments(comments) {
  return comments.reduce((count, comment) => count
    + (comment.is_deleted || comment.deleted ? 0 : 1)
    + (comment.replies || []).filter(reply => !(reply.is_deleted || reply.deleted)).length, 0)
}
export function setDemoComments(postId, comments) {
  const all = readJson(DEMO_COMMENTS_KEY)
  all[String(postId)] = comments
  localStorage.setItem(DEMO_COMMENTS_KEY, JSON.stringify(all))
  setDemoCommentCount(postId, countActiveDemoComments(comments))
  return comments
}
export function getDemoCommentCount(id) {
  const value = readJson(DEMO_CCOUNT_KEY)[String(id)]
  return typeof value === 'number' ? value : countActiveDemoComments(getDemoComments(id))
}
export function setDemoCommentCount(id, count) {
  const all = readJson(DEMO_CCOUNT_KEY)
  all[String(id)] = count
  localStorage.setItem(DEMO_CCOUNT_KEY, JSON.stringify(all))
}
