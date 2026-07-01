import { useMemo, useState } from 'react'
import { randomNick } from '../data/nicknames'
import { maskPIIWithAI } from '../utils/maskPII'
import { createCommunityPost } from '../api/ppyurindApi'
import { mapCommunityPostToLocal, saveMyCommunityPost } from '../utils/myCommunityPosts'

const TAGS = [
  { label: 'AI 자동 추천', value: 'auto', icon: 'fa-wand-magic-sparkles' },
  { label: '대화 단절', value: '#대화단절', icon: 'fa-comment-slash' },
  { label: '서운함', value: '#서운함', icon: 'fa-droplet' },
  { label: '시댁·처가', value: '#시댁 #처가', icon: 'fa-house-user' },
  { label: '경제·소비', value: '#경제 #소비', icon: 'fa-wallet' },
  { label: '가사 분담', value: '#가사분담', icon: 'fa-broom' },
  { label: '스킨십·친밀감', value: '#스킨십 #친밀감', icon: 'fa-heart' },
]

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

// 성인(19+) 소지 가능성 휴리스틱 감지 — 등록 시 확인창 노출용
const ADULT_PATTERN = /잠자리|성관계|섹스|스킨십|부부관계|야한|음란|은밀|19금|성적|잠자리 거부|불감증/
function looksAdult(text) {
  return ADULT_PATTERN.test(text.replace(/\s/g, ''))
}

export default function CommunityWrite({ nav }) {
  const [tagMode, setTagMode] = useState('auto')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isAdult, setIsAdult] = useState(false)   // 19+ 게시물 여부
  const [adultPrompt, setAdultPrompt] = useState(false) // 자동감지 확인창
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState('')

  const autoTag = useMemo(() => recommendTag(`${title} ${body}`), [title, body])
  const selectedTag = tagMode === 'auto' ? autoTag : tagMode
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !isSaving

  const doSubmit = async (adult) => {
    setAdultPrompt(false)
    setIsSaving(true)
    const masked = await maskPIIWithAI(body.trim())
    const nextPost = {
      id: 'u' + Date.now(),
      avatar: 'cat_02_t',
      nick: randomNick(),
      title: title.trim(),
      tag: `AI 태그: ${selectedTag}`,
      body: masked.text,
      isAdultOnly: adult,
      empathy: 0,
      comfort: 0,
      comments: 0,
      author: 'me',
      daysAgo: 0,
      createdAt: new Date().toISOString(),
    }
    try {
      const created = await createCommunityPost({ content: masked.text, title: title.trim(), isAnonymous: true, isAdultOnly: adult })
      saveMyCommunityPost(mapCommunityPostToLocal(created, nextPost))
      nav('community')
    } catch {
      saveMyCommunityPost(nextPost)
      setIsSaving(false)
      setToast('서버 저장 실패 · 내 글에서 확인 가능해요')
      setTimeout(() => nav('community'), 1800)
    }
  }

  const submit = () => {
    if (!canSubmit) return
    // 19+로 이미 표시했으면 바로 등록, 아니면 자동감지 후 확인창
    if (!isAdult && looksAdult(`${title} ${body}`)) {
      setAdultPrompt(true)
      return
    }
    doSubmit(isAdult)
  }

  return (
    <div className="compose">
      {toast && <div className="toast">{toast}</div>}
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
          <button
            type="button"
            className={`compose-tag compose-tag--age${isAdult ? ' active' : ''}`}
            onClick={() => setIsAdult(v => !v)}
            aria-pressed={isAdult}
          >
            <i className="fa-solid fa-lock"></i>
            19+
          </button>
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

      {adultPrompt && (
        <div className="sheet-backdrop" onClick={() => setAdultPrompt(false)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <i className="fa-solid fa-lock" style={{ fontSize: 24, color: 'var(--brand)' }}></i>
            <h3 style={{ margin: '12px 0 6px', fontSize: 17, color: 'var(--ink)' }}>19금 게시물로 등록될 수 있어요</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              성인(19+) 관련 내용이 감지됐어요.<br />내용을 수정하시겠어요, 아니면 19+ 게시물로 등록할까요?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setAdultPrompt(false)}>내용 수정</button>
              <button className="cta" style={{ flex: 1 }} onClick={() => { setIsAdult(true); doSubmit(true) }}>19+로 등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
