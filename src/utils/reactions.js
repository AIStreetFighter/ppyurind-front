// 공감/위로 반응 + 댓글 수를 localStorage로 영속화 —
// 피드(Community)와 상세(PostDetail)가 같은 반응 상태를 공유하도록 한다.
// 서버 게시글 count는 서버 응답만 사용하고, localStorage 반응은 active 상태 보조용이다.
// 서버가 없는 로컬 게시글에 한해 저장된 반응 상태로 로컬 count를 계산한다.

import { diverseAnonymousIdentity } from '../data/nicknames'
import { isDemo } from './demo'

const REACT_KEY = 'ppyurind:reactions'   // { [postId]: { liked, comforted } }
const CCOUNT_KEY = 'ppyurind:commentCounts' // { [postId]: number } — 상세에서 계산한 실제 댓글 수
const DEMO_REACT_KEY = 'ppyurind:demo:reactions'
const DEMO_REACT_VERSION_KEY = 'ppyurind:demo:reactionsVersion'
const DEMO_REACT_VERSION = '2'
const DEMO_COMMENTS_KEY = 'ppyurind:demo:comments'
const DEMO_CCOUNT_KEY = 'ppyurind:demo:commentCounts'
const DEMO_COMMENTS_VERSION_KEY = 'ppyurind:demo:commentsVersion'
const DEMO_COMMENTS_VERSION = '6'

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

function normalizeStoredDemoReaction(stored = {}) {
  const liked = !!stored.liked
  const comforted = !!stored.comforted
  return {
    liked,
    comforted,
    empathyDelta: liked ? 1 : 0,
    comfortDelta: comforted ? 1 : 0,
  }
}

function migrateDemoReactions() {
  if (localStorage.getItem(DEMO_REACT_VERSION_KEY) === DEMO_REACT_VERSION) return
  const all = readJson(DEMO_REACT_KEY)
  for (const postId in all) all[postId] = normalizeStoredDemoReaction(all[postId])
  localStorage.setItem(DEMO_REACT_KEY, JSON.stringify(all))
  localStorage.setItem(DEMO_REACT_VERSION_KEY, DEMO_REACT_VERSION)
}

export function getAllDemoReactions() {
  migrateDemoReactions()
  return readJson(DEMO_REACT_KEY)
}
export function getDemoReaction(id, empathyBase = 0, comfortBase = 0) {
  const stored = normalizeStoredDemoReaction(getAllDemoReactions()[String(id)])
  const { liked, comforted, empathyDelta, comfortDelta } = stored
  return {
    ...stored,
    liked,
    comforted,
    empathyDelta,
    comfortDelta,
    empathyCount: Math.max(0, empathyBase + empathyDelta),
    comfortCount: Math.max(0, comfortBase + comfortDelta),
  }
}
export function setDemoReaction(id, patch) {
  const all = getAllDemoReactions()
  const current = getDemoReaction(id)
  all[String(id)] = {
    liked: current.liked,
    comforted: current.comforted,
    empathyDelta: current.empathyDelta,
    comfortDelta: current.comfortDelta,
    ...patch,
  }
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
  const timestampOf = item => new Date(item.created_at || item.createdAt || 0).getTime() || 0
  const sorted = comments
    .map(comment => ({
      ...comment,
      replies: [...(comment.replies || [])].sort((a, b) => timestampOf(a) - timestampOf(b)),
    }))
    .sort((a, b) => timestampOf(a) - timestampOf(b))
  const all = readJson(DEMO_COMMENTS_KEY)
  all[String(postId)] = sorted
  localStorage.setItem(DEMO_COMMENTS_KEY, JSON.stringify(all))
  setDemoCommentCount(postId, countActiveDemoComments(sorted))
  return sorted
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

const DEMO_COMMENT_TEMPLATES = [
  '저도 비슷한 상황이라 공감돼요.',
  '당연하게 여겨지면 정말 서운할 것 같아요.',
  '차분하게 이야기해보는 것도 좋을 것 같아요.',
  '혼자만 애쓰는 느낌이면 지칠 수밖에 없죠.',
  '마음을 알아주지 않는 것처럼 느껴져서 속상했겠어요.',
  '조금 쉬어가면서 내 마음부터 챙겨도 괜찮아요.',
  '서로의 입장을 천천히 나눌 시간이 필요해 보여요.',
  '그동안 많이 참고 애쓰신 마음이 느껴져요.',
  '작은 말 한마디가 큰 위로가 될 때가 있죠.',
  '감정이 가라앉았을 때 솔직하게 말해보면 좋겠어요.',
  '계속 참기만 하면 더 힘들어질 수 있어요.',
  '충분히 서운할 수 있는 상황이라고 생각해요.',
  '내 마음을 먼저 알아주고 다독여주는 시간도 필요해요.',
  '서로 원하는 표현 방식이 다를 수도 있을 것 같아요.',
  '한 번에 해결하려 하기보다 작은 것부터 맞춰가면 좋겠어요.',
  '상대방도 이 마음을 알 수 있도록 천천히 전해보세요.',
  '혼자 감당하지 말고 믿을 만한 사람에게 마음을 나눠도 괜찮아요.',
  '지금 느끼는 감정은 자연스럽고 충분히 이해돼요.',
  '서운했던 지점을 구체적으로 말하면 대화에 도움이 될 것 같아요.',
  '서로를 탓하기보다 바라는 점을 이야기해보면 어떨까요.',
  '마음이 지쳤을 때는 잠시 거리를 두고 쉬어가는 것도 필요해요.',
  '관계를 위해 애써온 만큼 본인의 마음도 소중히 챙기셨으면 해요.',
  '상대의 반응보다 내 감정을 차분히 설명하는 데 집중해보세요.',
  '두 분만의 기준을 다시 정해보는 계기가 될 수도 있을 것 같아요.',
]

const DEMO_CONTEXT_TEMPLATES = [
  { keywords: ['대화', '말', '연락'], comments: ['감정이 가라앉았을 때 솔직하게 대화해보면 좋겠어요.', '연락과 대화의 기준을 함께 맞춰보는 것도 도움이 될 것 같아요.'] },
  { keywords: ['육아', '아이', '집안일'], comments: ['한 사람에게만 부담이 쏠리지 않도록 역할을 다시 나눠보면 좋겠어요.', '함께 책임져야 할 일인데 혼자 감당하느라 많이 지치셨겠어요.'] },
  { keywords: ['기념일', '선물', '데이트'], comments: ['기대했던 마음이 있었던 만큼 더 서운하게 느껴졌을 것 같아요.', '서로 중요하게 생각하는 표현 방식을 이야기해보면 좋겠어요.'] },
  { keywords: ['시댁', '처가', '가족'], comments: ['가족 사이의 문제라 더 조심스럽고 마음이 복잡했겠어요.', '배우자가 먼저 내 편이 되어준다는 느낌이 중요할 것 같아요.'] },
  { keywords: ['돈', '경제', '생활비'], comments: ['돈 이야기는 감정이 커지기 쉬우니 기준을 구체적으로 맞춰보면 좋겠어요.', '서로의 불안을 탓하기보다 현실적인 계획부터 함께 세워보면 어떨까요.'] },
]

function demoTemplatesFor(post) {
  const context = `${post?.title || ''} ${post?.content || post?.body || ''} ${post?.ai_tags || post?.tag || ''}`
  const matched = DEMO_CONTEXT_TEMPLATES.find(group => group.keywords.some(keyword => context.includes(keyword)))
  return matched ? [...matched.comments, ...DEMO_COMMENT_TEMPLATES] : DEMO_COMMENT_TEMPLATES
}

function deterministicTemplateOffset(postId, length) {
  const seed = String(postId)
  let value = 0
  for (let index = 0; index < seed.length; index++) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0
  }
  return length > 0 ? value % length : 0
}

function seedDemoCreatedAt(_postId, index, count, anchor) {
  return new Date(anchor - Math.max(1, count - index) * 60 * 60 * 1000).toISOString()
}

function createdAtFromDemoId(id, prefix) {
  const timestamp = Number(String(id).replace(prefix, ''))
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function addMissingDemoCreatedAt(comments, postId) {
  const anchor = Math.floor(Date.now() / 3600000) * 3600000
  const seedCount = comments.filter(comment => String(comment.id).startsWith('demo-seed-')).length
  let seedIndex = 0
  return comments.map((comment, index) => {
    const isSeed = String(comment.id).startsWith('demo-seed-')
    const repairedCreatedAt = isSeed
      ? seedDemoCreatedAt(postId, seedIndex++, seedCount, anchor)
      : comment.created_at || comment.createdAt
        || createdAtFromDemoId(comment.id, /^demo-c-/)
        || new Date(anchor - (index + 1) * 3600000).toISOString()
    const parentTimestamp = new Date(repairedCreatedAt).getTime()
    return ({
      ...comment,
      created_at: repairedCreatedAt,
      replies: (comment.replies || []).map((reply, replyIndex) => ({
        ...reply,
        created_at: reply.created_at || reply.createdAt || (() => {
          return createdAtFromDemoId(reply.id, /^demo-r-/)
            || new Date(Math.min(anchor, parentTimestamp + (replyIndex + 1) * 3600000)).toISOString()
        })(),
      })),
    })
  })
}

function migrateDemoComments() {
  if (localStorage.getItem(DEMO_COMMENTS_VERSION_KEY) === DEMO_COMMENTS_VERSION) return
  const all = readJson(DEMO_COMMENTS_KEY)
  for (const postId in all) {
    if (Array.isArray(all[postId])) {
      const repaired = addMissingDemoCreatedAt(all[postId], postId)
      const timestampOf = item => new Date(item.created_at || item.createdAt || 0).getTime() || 0
      all[postId] = repaired
        .map(comment => ({
          ...comment,
          replies: [...(comment.replies || [])].sort((a, b) => timestampOf(a) - timestampOf(b)),
        }))
        .sort((a, b) => timestampOf(a) - timestampOf(b))
    }
  }
  localStorage.setItem(DEMO_COMMENTS_KEY, JSON.stringify(all))
  localStorage.setItem(DEMO_COMMENTS_VERSION_KEY, DEMO_COMMENTS_VERSION)
}

export function ensureDemoComments(post) {
  if (!isDemo()) return getDemoComments(post?.id)
  migrateDemoComments()
  const postId = post?.id
  if (postId == null) return []

  const all = readJson(DEMO_COMMENTS_KEY)
  const key = String(postId)
  if (Object.prototype.hasOwnProperty.call(all, key) && Array.isArray(all[key]) && all[key].length > 0) {
    return all[key]
  }

  const rawCount = typeof post?.comment_count === 'number' ? post.comment_count : post?.comments
  const count = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0
  if (count === 0) return []

  const templates = demoTemplatesFor(post)
  const templateOffset = deterministicTemplateOffset(key, templates.length)
  const anchor = Math.floor(Date.now() / 3600000) * 3600000
  const comments = Array.from({ length: count }, (_, index) => {
    const id = `demo-seed-${key}-${index + 1}`
    const identity = diverseAnonymousIdentity(`demo-comments:${key}`, index)
    return {
      id,
      content: templates[(templateOffset + index) % templates.length],
      created_at: seedDemoCreatedAt(key, index, count, anchor),
      is_deleted: false,
      anonymous_nickname: identity.nickname,
      anonymous_avatar: identity.avatar,
      replies: [],
    }
  })
  return setDemoComments(postId, comments)
}
