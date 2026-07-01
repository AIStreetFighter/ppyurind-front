import { nickFromId } from '../data/nicknames'

export const MY_POSTS_STORAGE_KEY = 'ppyurind:myCommunityPosts'

export function loadMyCommunityPosts() {
  try {
    return JSON.parse(localStorage.getItem(MY_POSTS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveMyCommunityPost(post) {
  const posts = loadMyCommunityPosts()
  const next = [post, ...posts.filter(item => item.id !== post.id)]
  localStorage.setItem(MY_POSTS_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function mapCommunityPostToLocal(post, fallback = {}) {
  const id = post?.id ?? fallback.id ?? `u${Date.now()}`
  return {
    id,
    avatar: post?.anonymous_avatar || fallback.avatar || 'cat_02_t',
    nick: post?.anonymous_nickname || fallback.nick || nickFromId(id),
    title: post?.title || fallback.title || post?.content?.slice(0, 24) || '',
    tag: post?.ai_tags?.length ? `AI 태그: ${post.ai_tags.join(',')}` : fallback.tag || '',
    body: post?.content || fallback.body || '',
    empathy: post?.empathy_count ?? fallback.empathy ?? 0,
    comfort: post?.comfort_count ?? fallback.comfort ?? 0,
    comments: post?.comment_count ?? fallback.comments ?? 0,
    author: 'me',
    daysAgo: 0,
    createdAt: post?.created_at || fallback.createdAt || new Date().toISOString(),
  }
}
