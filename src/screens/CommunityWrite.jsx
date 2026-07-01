import { useMemo, useState } from 'react'
import { randomNick } from '../data/nicknames'
import { maskPIIWithAI } from '../utils/maskPII'

const MY_POSTS_STORAGE_KEY = 'ppyurind:myCommunityPosts'

const TAGS = [
  { label: 'AI 자동 추천', value: 'auto', icon: 'fa-wand-magic-sparkles' },
  { label: '대화 단절', value: '#대화단절', icon: 'fa-comment-slash' },
  { label: '서운함', value: '#서운함', icon: 'fa-droplet' },
  { label: '시댁·처가', value: '#시댁 #처가', icon: 'fa-house-user' },
  { label: '경제·소비', value: '#경제 #소비', icon: 'fa-wallet' },
  { label: '가사 분담', value: '#가사분담', icon: 'fa-broom' },
  { label: '스킨십·친밀감', value: '#스킨십 #친밀감', icon: 'fa-heart' },
]

function loadMyPosts() {
  try {
    return JSON.parse(localStorage.getItem(MY_POSTS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function recommendTag(text) {
  const source = text.replace(/\s/g, '')
  if (/돈|경제|소비|통장|월급|지출|생활비/.test(source)) return '#경제 #소비'
  if (/시댁|처가|명절|부모님|가족/.test(source)) return '#시댁 #처가'
  if (/집안일|청소|빨래|설거지|가사/.test(source)) return '#가사분담'
  if (/스킨십|친밀|잠자리|거리감/.test(source)) return '#스킨십 #친밀감'
  if (/말|대화|연락|침묵|회피/.test(source)) return '#대화단절'
  if (/서운|속상|외로|상처/.test(source)) return '#서운함'
  return '#방금작성'
}

export default function CommunityWrite({ nav }) {
  const [tagMode, setTagMode] = useState('auto')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const autoTag = useMemo(() => recommendTag(`${title} ${body}`), [title, body])
  const selectedTag = tagMode === 'auto' ? autoTag : tagMode
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !isSaving

  const submit = async () => {
    if (!canSubmit) return
    setIsSaving(true)
    const masked = await maskPIIWithAI(body.trim())
    const nextPost = {
      id: 'u' + Date.now(),
      avatar: 'cat_02_t',
      nick: randomNick(),
      title: title.trim(),
      tag: `AI 태그: ${selectedTag}`,
      body: masked.text,
      empathy: 0,
      comfort: 0,
      comments: 0,
      author: 'me',
      daysAgo: 0,
      createdAt: new Date().toISOString(),
    }
    const posts = loadMyPosts()
    localStorage.setItem(MY_POSTS_STORAGE_KEY, JSON.stringify([nextPost, ...posts]))
    nav('community')
  }

  return (
    <div className="compose">
      <header className="compose-top">
        <button type="button" className="compose-action compose-action--cancel" onClick={() => nav('community')}>취소</button>
        <h1>글쓰기</h1>
        <button
          type="button"
          className="compose-action compose-action--submit"
          onClick={submit}
          disabled={!canSubmit}
        >
          {isSaving ? '등록 중' : '등록'}
        </button>
      </header>

      <section className="compose-tags" aria-label="태그 선택">
        <div className="compose-tag-head">
          <span>{tagMode === 'auto' ? '태그 선택 · AI 자동 추천' : '태그 선택'}</span>
          <b>{selectedTag}</b>
        </div>
        <div className="compose-tag-row">
          {TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              className={`compose-tag${tagMode === tag.value ? ' active' : ''}`}
              onClick={() => setTagMode(tag.value)}
            >
              <i className={`fa-solid ${tag.icon}`}></i>
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      <main className="compose-body">
        <input
          className="compose-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요."
          maxLength={48}
          autoFocus
        />
        <textarea
          className="compose-textarea"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="내용을 입력해주세요."
          maxLength={1200}
        />
      </main>

      <footer className="compose-tools">
        <button type="button" aria-label="이미지 첨부"><i className="fa-regular fa-image"></i></button>
        <button type="button" aria-label="검사 연결"><i className="fa-regular fa-square-check"></i></button>
        <button type="button" aria-label="태그"><i className="fa-solid fa-hashtag"></i></button>
        <span>{body.length}/1200</span>
      </footer>
    </div>
  )
}
