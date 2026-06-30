import { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'
import NotifBell from '../components/NotifBell'
import { randomNick } from '../data/nicknames'
import { maskPIIWithAI } from '../utils/maskPII'
import { listCommunityPosts } from '../api/ppyurindApi'

const AVATARS = ['cat_01_t', 'cat_02_t', 'cat_03_t', 'cat_04_t']
const REPORT_REASONS = ['스팸 / 홍보', '욕설 / 비방', '음란성 / 부적절', '개인정보 노출', '기타']

// 피드 사이에 5개마다 노출되는 광고 (순환)
const FEED_ADS = [
  { emoji: '🎁', title: '다가오는 기념일, 꽃으로 마음 전하기', sub: '제휴 · 당일배송 꽃다발 20% 쿠폰' },
  { emoji: '🏨', title: '둘만의 기념일, 호캉스 1박 특가', sub: '제휴 · 주말 객실 할인' },
  { emoji: '✉️', title: '마음 전하는 손편지 세트', sub: '제휴 · 감성 편지지 기획전' },
  { emoji: '🍽️', title: '기념일 디너, 분위기 좋은 레스토랑', sub: '제휴 · 코스 메뉴 예약 할인' },
]

function apiPostToCard(p, idx) {
  const createdAt = new Date(p.created_at)
  const daysAgo = Math.round((Date.now() - createdAt) / 86400000)
  const tags = (p.ai_tags || []).map(t => `#${t}`).join(' ')
  return {
    id: p.id,
    avatar: p.anonymous_avatar || AVATARS[idx % AVATARS.length],
    nick: p.anonymous_nickname || randomNick(),
    title: p.title || p.content.slice(0, 30),
    tag: tags ? `AI 태그: ${tags}` : '',
    body: p.content,
    empathy: p.empathy_count,
    comfort: p.comfort_count,
    comments: p.comment_count,
    author: p.id,
    daysAgo,
  }
}

export default function Community({ nav, isDark, toggleTheme, concerns = [] }) {
  const [filter, setFilter] = useState('전체')
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [liked, setLiked] = useState({})
  const [comforted, setComforted] = useState({})
  const [menuOpen, setMenuOpen] = useState(null)
  const [toast, setToast] = useState('')
  const [reportFor, setReportFor] = useState(null)
  const [hiddenAuthors, setHiddenAuthors] = useState([])
  const [userPosts, setUserPosts] = useState([])
  const [writing, setWriting] = useState(false)
  const [draft, setDraft] = useState('')
  const [maskPreview, setMaskPreview] = useState(null)
  const [count, setCount] = useState(5)
  const [sort, setSort] = useState('latest')
  const [dbPosts, setDbPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCommunityPosts({ offset: 0, limit: 50 })
      .then(res => setDbPosts((res.items || []).map(apiPostToCard)))
      .catch(() => setDbPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 1900) }

  const submitReport = (reason) => {
    setReportFor(null)
    flash(`신고가 접수되었습니다 (${reason}). 누적 3회 시 자동 블라인드 처리돼요.`)
  }

  const hideAuthor = (author) => {
    setHiddenAuthors(a => [...a, author])
    setMenuOpen(null)
    flash('이 회원의 글을 모두 숨겼어요.')
  }

  const requestPublish = async () => {
    if (!draft.trim()) return
    const masked = await maskPIIWithAI(draft.trim())
    if (masked.hits.length > 0) {
      setMaskPreview(masked)
    } else {
      doPublish(masked.text)
    }
  }

  const doPublish = (finalText) => {
    setUserPosts(p => [{
      id: 'u' + Date.now(), avatar: AVATARS[1], nick: randomNick(), title: '방금 남긴 고민',
      tag: 'AI 태그: #방금작성', body: finalText, empathy: 0, comfort: 0, comments: 0, author: 'me', daysAgo: 0,
    }, ...p])
    setDraft('')
    setWriting(false)
    setMaskPreview(null)
    flash('익명으로 게시됐어요. 개인정보는 자동으로 가려졌어요.')
  }

  const allPosts = [...userPosts, ...dbPosts]

  const base = allPosts
    .filter(p => !hiddenAuthors.includes(p.author))
    .filter(p => !query.trim() || p.nick.includes(query) || p.title.includes(query) || p.body.includes(query) || p.tag.includes(query))

  const feed = sort === 'empathy'
    ? base.filter(p => p.daysAgo <= 30).sort((a, b) => b.empathy - a.empathy)
    : [...base].sort((a, b) => a.daysAgo - b.daysAgo)

  const shown = feed.slice(0, count)

  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <p className="eyebrow">커뮤니티</p>
          <div className="topbar__icons">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <i className="fa-solid fa-magnifying-glass" onClick={() => setShowSearch(s => !s)} style={{ cursor: 'pointer' }}></i>
            <NotifBell />
          </div>
        </div>

        <div className="header">
          <h1 className="page-title">비슷한 마음들</h1>
          <p className="page-sub">결혼 2년 차, 비슷한 고민을 가진 사람들의 이야기</p>
          <div className="header-art"><img src="/assets/cats/cat_03_t.png" alt="" /></div>
        </div>

        {showSearch && (
          <input className="field" style={{ width: '100%', marginTop: 16 }}
            placeholder="고민 키워드로 검색 (예: 서운함, 대화)" value={query}
            onChange={e => { setQuery(e.target.value); setCount(8) }} autoFocus />
        )}

        <div className="chip-row" style={{ marginTop: 18 }}>
          {(() => {
            const extra = ['시댁·처가', '경제·소비', '스킨십·친밀감'] // 공통 인기 카테고리
            const mine = concerns.filter(c => c !== '기타').map(c => c.replace(/ 갈등$/, '')).slice(0, 2)
            const tags = [...new Set(['전체', ...mine, ...extra])]
            return tags.map(v => (
              <span key={v} className={`chip${filter === v ? ' selected' : ''}`} onClick={() => setFilter(v)}>{v}</span>
            ))
          })()}
          <span className="chip chip--age"><i className="fa-solid fa-lock" style={{ fontSize: 11 }}></i> 19+</span>
        </div>

        {/* 나와 비슷한 고민 (AI 추천) */}
        <div className="section-label"><i className="fa-solid fa-wand-magic-sparkles"></i>나와 비슷한 고민 <span className="muted">· AI 추천</span></div>
        <div className="stack">
          <div className="card" style={{ padding: 15, cursor: 'pointer' }} onClick={() => dbPosts[0] && nav('post', { post: dbPosts[0] })}>
            <div className="row">
              <div className="avatar"><img src="/assets/cats/cat_04_t.png" alt="" /></div>
              <div style={{ flex: 1 }}>
                <p className="row__title">"{dbPosts[0]?.title || '기념일을 매번 제가 챙겨요'}"</p>
                <p className="row__sub">유사도 92% · 결혼 3년 차</p>
              </div>
              <span className="badge badge--match">매칭</span>
            </div>
          </div>
          <div className="card" style={{ padding: 15, cursor: 'pointer' }} onClick={() => dbPosts[1] && nav('post', { post: dbPosts[1] })}>
            <div className="row">
              <div className="avatar"><img src="/assets/cats/cat_02_t.png" alt="" /></div>
              <div style={{ flex: 1 }}>
                <p className="row__title">"{dbPosts[1]?.title || '싸우고 나면 며칠씩 말을 안 해요'}"</p>
                <p className="row__sub">유사도 87% · 연애 4년 차</p>
              </div>
              <span className="badge badge--match">매칭</span>
            </div>
          </div>
          <div className="card match-locked" style={{ padding: 15 }}>
            <div className="row">
              <span className="badge badge--age" style={{ flexShrink: 0 }}>19+</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="row__title match-blur">친밀감 부족이 너무 힘들어요</p>
                <p className="row__sub">유사도 81% · 결혼 5년 차</p>
              </div>
              <button className="badge badge--age" style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => flash('성인 인증은 시연용이에요. 실제 연동 예정.')}>인증 필요</button>
            </div>
          </div>
        </div>

        <div className="section-label" style={{ justifyContent: 'space-between' }}>
          <span><i className="fa-solid fa-comments"></i>고민 이야기</span>
          <div className="sort-tabs">
            <button className={`sort-tab${sort === 'latest' ? ' active' : ''}`} onClick={() => { setSort('latest'); setCount(5) }}>최신순</button>
            <button className={`sort-tab${sort === 'empathy' ? ' active' : ''}`} onClick={() => { setSort('empathy'); setCount(5) }}>공감순</button>
          </div>
        </div>
        {sort === 'empathy' && <p className="sort-hint">최근 30일 동안 공감을 많이 받은 고민이에요.</p>}
        <div className="stack">
          {loading && <p className="muted" style={{ textAlign: 'center', padding: 24 }}>고민 이야기를 불러오는 중...</p>}
          {!loading && shown.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 24 }}>아직 게시글이 없어요.</p>}
          {shown.map((p, idx) => {
            const isLiked = !!liked[p.id], isComf = !!comforted[p.id]
            const card = (
              <div key={p.id} className="card" onClick={() => nav('post', { post: p })} style={{ cursor: 'pointer' }}>
                <div className="post-head">
                  <div className="avatar"><img src={`/assets/cats/${p.avatar}.png`} alt="" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="post-name">
                      {p.nick}
                      {sort === 'empathy' && p.empathy >= 60 && <span className="hot-badge"><i className="fa-solid fa-fire"></i> HOT</span>}
                    </p>
                    <p className="post-title">{p.title}</p>
                    <p className="post-tag">{p.tag}</p>
                  </div>
                  <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <i className="fa-solid fa-ellipsis-vertical" style={{ color: 'var(--ink-muted)', cursor: 'pointer', padding: 4 }}
                       onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}></i>
                    {menuOpen === p.id && (
                      <div className="kebab-menu">
                        <div className="kebab-item" onClick={() => { setMenuOpen(null); flash('1:1 대화는 곧 열려요.') }}><i className="fa-solid fa-comment"></i> 대화하기</div>
                        <div className="kebab-item danger" onClick={() => { setMenuOpen(null); setReportFor(p) }}><i className="fa-solid fa-flag"></i> 게시물 / 회원 신고하기</div>
                        <div className="kebab-item danger" onClick={() => hideAuthor(p.author)}><i className="fa-solid fa-eye-slash"></i> 이 회원의 글 모두 숨기기</div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="quote">"{p.body.length > 64 ? p.body.slice(0, 64) + '…' : p.body}" <span className="link-more" onClick={(e) => { e.stopPropagation(); nav('post', { post: p }) }}>더보기</span></p>
                <div className="reactions" onClick={e => e.stopPropagation()}>
                  <span className={isLiked ? 'like' : ''} style={{ cursor: 'pointer' }} onClick={() => setLiked(s => ({ ...s, [p.id]: !s[p.id] }))}>
                    <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> 공감 {p.empathy + (isLiked ? 1 : 0)}
                  </span>
                  <span style={{ cursor: 'pointer', color: isComf ? 'var(--warm-text)' : '' }} onClick={() => setComforted(s => ({ ...s, [p.id]: !s[p.id] }))}>
                    <i className={`${isComf ? 'fa-solid' : 'fa-regular'} fa-hand`}></i> 위로 {p.comfort + (isComf ? 1 : 0)}
                  </span>
                  <span style={{ cursor: 'pointer' }} onClick={() => nav('post', { post: p })}><i className="fa-regular fa-comment"></i> 댓글 {p.comments}</span>
                </div>
              </div>
            )
            // 게시글 5개마다 광고 1개 삽입 (광고는 순환)
            if ((idx + 1) % 5 === 0) {
              const ad = FEED_ADS[Math.floor(idx / 5) % FEED_ADS.length]
              return [
                card,
                <a key={`ad-${idx}`} className="card ad-card" href="#" onClick={e => { e.preventDefault(); flash('광고 영역 (시연용)') }}>
                  <span className="ad-badge">AD</span>
                  <div className="event-emoji" style={{ background: 'color-mix(in srgb, var(--brand) 16%, transparent)' }}>{ad.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p className="row__title" style={{ marginBottom: 2 }}>{ad.title}</p>
                    <p className="row__sub">{ad.sub}</p>
                  </div>
                  <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
                </a>,
              ]
            }
            return card
          })}

          {/* 19+ 잠긴 게시글 */}
          <div className="card locked">
            <div className="blurred" aria-hidden="true">
              <div className="post-head">
                <div className="avatar"><img src="/assets/cats/cat_04_t.png" alt="" /></div>
                <div style={{ flex: 1 }}>
                  <p className="post-name">익명 · 친밀감 고민이 있어요</p>
                  <p className="post-tag">AI 태그: #19+ #스킨십 #거리감</p>
                </div>
                <i className="fa-solid fa-ellipsis-vertical" style={{ color: 'var(--ink-muted)' }}></i>
              </div>
              <p className="quote">결혼하고 2년쯤 지나니 스킨십이 확 줄었어요. 먼저 다가가기도 눈치 보이고, 거절당하면 더 위축돼서 요즘은 그냥 각자 잠드는 날이 많아요…</p>
              <div className="reactions">
                <span className="like"><i className="fa-solid fa-heart"></i> 공감 41</span>
                <span><i className="fa-regular fa-hand"></i> 위로 18</span>
                <span><i className="fa-regular fa-comment"></i> 댓글 9</span>
              </div>
            </div>
            <div className="locked__overlay">
              <span className="badge badge--age"><i className="fa-solid fa-lock" style={{ fontSize: 10 }}></i> 19+ 친밀감 고민</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>성인 인증 후 열람할 수 있어요</div>
              <button className="btn-pill" onClick={() => flash('성인 인증은 시연용이에요. 실제 연동 예정.')}>성인 인증하기</button>
            </div>
          </div>

          {count < feed.length
            ? <button className="cta cta--ghost more-btn" onClick={() => setCount(c => c + 5)}>
                고민 더보기 <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>({feed.length - count}개 더)</span>
              </button>
            : <div className="feed-end">모든 고민을 다 봤어요 🌙</div>}
        </div>

        <div style={{ height: 56 }} />
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="fab-wrap">
        <div className="fab-bubble">익명으로 글 남기기 ✍️</div>
        <button className="fab-write" aria-label="글쓰기" onClick={() => setWriting(true)}><i className="fa-solid fa-pen"></i></button>
      </div>

      {/* 글쓰기 모달 */}
      {writing && (
        <div className="sheet-backdrop" onClick={() => setWriting(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 style={{ margin: '0 0 6px', fontSize: 19, color: 'var(--ink)' }}>익명으로 고민 남기기</h2>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-muted)' }}><i className="fa-solid fa-shield-halved" style={{ marginRight: 5 }}></i>이름·날짜 등 개인정보는 게시 전 자동으로 제거돼요.</p>
            <textarea className="field" style={{ width: '100%', minHeight: 130, resize: 'none', fontFamily: 'inherit' }}
              placeholder="어떤 마음인지 편하게 적어보세요. 비슷한 고민의 사람들이 공감해줄 거예요." value={draft} onChange={e => setDraft(e.target.value)} autoFocus />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setWriting(false)}>취소</button>
              <button className="cta" style={{ flex: 1.4, opacity: draft.trim() ? 1 : 0.5 }} onClick={requestPublish}>익명으로 게시</button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보 마스킹 미리보기 */}
      {maskPreview && (
        <div className="sheet-backdrop" onClick={() => setMaskPreview(null)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--ink)' }}><i className="fa-solid fa-shield-halved" style={{ marginRight: 6, color: 'var(--brand)' }}></i>개인정보를 가렸어요</h3>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--ink-muted)' }}>
              감지된 정보: {maskPreview.hits.map(h => <span key={h} className="mask-chip">{h}</span>)}
            </p>
            <div className="mask-preview">{maskPreview.text}</div>
            <p style={{ margin: '10px 0 16px', fontSize: 11.5, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }}></i>실명·자녀 이름 등 문맥 정보는 AI가 추가로 가립니다 <span style={{ opacity: 0.7 }}>(연동 예정)</span>.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setMaskPreview(null)}>다시 쓰기</button>
              <button className="cta" style={{ flex: 1.4 }} onClick={() => doPublish(maskPreview.text)}>이대로 게시</button>
            </div>
          </div>
        </div>
      )}

      {/* 신고 사유 모달 */}
      {reportFor && (
        <div className="sheet-backdrop" onClick={() => setReportFor(null)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--ink)' }}>신고 사유를 선택해주세요</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-muted)' }}>접수된 신고는 운영 정책에 따라 검토돼요.</p>
            <div className="stack" style={{ gap: 8 }}>
              {REPORT_REASONS.map(r => (
                <button key={r} className="report-reason" onClick={() => submitReport(r)}>{r}<i className="fa-solid fa-chevron-right"></i></button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav active="커뮤니티" nav={nav} />
    </>
  )
}
