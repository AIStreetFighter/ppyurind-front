import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'
import NotifBell from '../components/NotifBell'
import { nickFromId, randomNick } from '../data/nicknames'
import { maskPIIWithAI } from '../utils/maskPII'
// [API] 백엔드 연결 시 아래 import 활성화
// import { listCommunityPosts, createCommunityPost, likePost, unlikePost, comfortPost, reportPost, muteAuthor } from '../api/ppyurindApi'
//
// [API] 게시글 목록 로드 (현재: ALL_POSTS 더미 사용)
//   useEffect(() => {
//     listCommunityPosts({ offset: 0, limit: 20 }).then(data => setPosts(data.items))
//   }, [])
//   응답 필드: id, title, content, ai_tags, anonymous_nickname, anonymous_avatar,
//             empathy_count, comfort_count, comment_count, created_at
//
// [API] 공감/위로 토글 (현재: 로컬 liked/comforted 상태로 처리)
//   likePost(id)  또는 unlikePost(id) → { empathy_count, comfort_count, liked, comforted }
//   comfortPost(id) → 동일 응답
//
// [API] 신고 (현재: 로컬 toast만 표시)
//   reportPost(id, reason)
//
// [API] 게시글 작성 (현재: 로컬 prepend)
//   createCommunityPost({ content, isAnonymous: true })

const AVATARS = ['cat_01_t', 'cat_02_t', 'cat_03_t', 'cat_04_t']
const MY_POSTS_STORAGE_KEY = 'ppyurind:myCommunityPosts'

const SEED = [
  ['기념일을 매번 제가 챙겨요', '#대화단절 #서운함', '기념일을 매번 제가 챙기는 것 같아서 서운해요. 그냥 한 번쯤 먼저 물어봐주길 바랐어요. 큰 걸 바라는 것도 아닌데 그게 그렇게 어려운 일일까요…', 106, 32, 14],
  ['싸우고 나면 며칠씩 말을 안 해요', '#감정표현 #회피', '다투면 대화로 풀고 싶은데 상대는 며칠씩 입을 닫아요. 그 침묵의 시간이 저한테는 벌처럼 느껴져서 너무 외로워요.', 74, 21, 12],
  ['시댁 얘기만 나오면 싸워요', '#시댁 #갈등', '시댁 얘기만 꺼내면 분위기가 싸늘해져요. 제 편을 들어달라는 게 아니라 그냥 제 마음을 알아줬으면 하는데.', 58, 19, 8],
  ['육아는 왜 늘 제 몫일까요', '#육아분담 #지침', '둘 다 일하는데 아이 챙기는 건 늘 저예요. 도와준다는 말이 오히려 더 서운하더라고요. 같이 하는 건데.', 92, 41, 23],
  ['표현을 잘 못 하는 사람이에요', '#스킨십 #거리감', '사랑하는 건 아는데 표현이 없으니 가끔 의심이 들어요. 저만 더 좋아하는 건가 싶어서.', 47, 15, 6],
  ['돈 얘기만 하면 예민해져요', '#경제 #불안', '미래를 위해 얘기하자는 건데 자꾸 잔소리로 받아들여서 대화가 안 돼요.', 63, 18, 9],
  ['화해는 했는데 마음이 안 풀려요', '#화해 #앙금', '말로는 풀었는데 속은 그대로예요. 이런 제가 속 좁은 걸까요?', 51, 27, 11],
  ['서로 너무 바빠서 대화가 없어요', '#대화단절 #일상', '하루에 나누는 말이 손에 꼽아요. 같이 사는데 룸메이트 같다는 생각이 들어요.', 80, 22, 15],
  ['칭찬에 인색한 배우자', '#인정욕구', '잘했다는 말 한마디가 그렇게 어려운가 봐요. 저는 그 한마디면 되는데.', 39, 12, 4],
  ['연락 텀이 길어지니 불안해요', '#연애 #불안', '예전엔 안 그랬는데 요즘 답장이 늦어지면 별생각이 다 들어요.', 44, 16, 7],
  ['명절만 다가오면 신경전이에요', '#시댁 #스트레스', '명절 얘기만 나오면 둘 다 예민해져요. 누구 집 먼저 갈지부터 싸움이 시작돼요.', 67, 20, 13],
  ['데이트 코스는 늘 제가 정해요', '#연애 #서운함', '뭐 먹을지, 어디 갈지 매번 제가 정해요. 가끔은 깜짝 데이트도 받아보고 싶은데.', 41, 14, 5],
  ['고맙다는 말을 안 해요', '#인정욕구 #서운함', '집안일도 챙기고 다 하는데 당연하게 여겨지는 것 같아 서운해요.', 55, 24, 10],
  ['게임만 하는 배우자, 지쳐요', '#대화단절 #서운함', '퇴근하면 게임, 주말에도 게임. 같이 있어도 혼자 있는 기분이에요.', 71, 19, 16],
  ['친구 모임을 더 좋아하는 것 같아요', '#서운함 #불안', '저보다 친구들이랑 있을 때 더 즐거워 보여서 가끔 외로워요.', 48, 17, 8],
  ['미래 계획이 너무 안 맞아요', '#가치관 #불안', '결혼, 이사, 돈 모으는 방향이 다 달라서 얘기할 때마다 막막해요.', 62, 23, 12],
  ['청소 기준이 너무 달라요', '#가사분담 #답답', '저는 바로 치우는데 상대는 쌓아두는 편이라 매번 제가 먼저 손대게 돼요.', 37, 11, 6],
  ['화나면 방으로 들어가 버려요', '#회피 #답답', '대화로 풀고 싶은데 문 닫고 들어가면 더 답답하고 막막해져요.', 59, 26, 14],
  ['스킨십이 줄어 거리감이 느껴져요', '#스킨십 #거리감', '예전 같지 않은 게 느껴져서 먼저 다가가기도 눈치 보이고 위축돼요.', 53, 21, 9],
  ['지적이 칭찬보다 먼저예요', '#인정욕구 #상처', '잘한 건 그냥 지나가고 부족한 것만 콕 집어 말해서 자꾸 위축돼요.', 45, 18, 7],
  ['약속을 자꾸 미뤄요', '#약속 #실망', '같이 하기로 한 걸 매번 다음에 하자고 미뤄서 기대를 안 하게 됐어요.', 50, 15, 8],
  ['돈 쓰는 스타일이 정반대예요', '#경제 #갈등', '저는 아끼는 편인데 상대는 쓰는 편이라 통장 얘기만 하면 부딪혀요.', 56, 17, 11],
  ['생활 리듬이 너무 달라요', '#생활패턴 #답답', '저는 일찍 자는데 상대는 새벽형이라 같이 보내는 시간이 점점 줄어요.', 34, 10, 5],
  ['사소한 걸로 자꾸 다퉈요', '#반복다툼 #지침', '큰일도 아닌데 말투 하나에 욱하게 되고, 같은 패턴으로 반복돼서 지쳐요.', 64, 25, 13],
  ['먼저 연락하는 건 늘 저예요', '#연애 #서운함', '안부도, 화해도 늘 제가 먼저예요. 한 번쯤 먼저 다가와 주면 좋겠어요.', 49, 20, 9],
]

function buildPosts() {
  const arr = []
  for (let i = 0; i < SEED.length; i++) {
    const s = SEED[i]
    const id = i + 1
    // 시연용 작성 시점: id 기반으로 0~70일 분산 (공감순 최근 30일 필터 검증용)
    const daysAgo = (id * 11) % 70
    arr.push({
      id,
      avatar: AVATARS[i % AVATARS.length],
      nick: nickFromId(id),
      title: s[0],
      tag: `AI 태그: ${s[1]}`,
      body: s[2],
      empathy: s[3], comfort: s[4], comments: s[5],
      author: `anon${i % 12}`,
      daysAgo,
    })
  }
  return arr
}

const ALL_POSTS = buildPosts()
const REPORT_REASONS = ['스팸 / 홍보', '욕설 / 비방', '음란성 / 부적절', '개인정보 노출', '기타']

// 피드 사이에 5개마다 노출되는 광고 (순환)
const FEED_ADS = [
  { emoji: '🎁', title: '다가오는 기념일, 꽃으로 마음 전하기', sub: '제휴 · 당일배송 꽃다발 20% 쿠폰' },
  { emoji: '🏨', title: '둘만의 기념일, 호캉스 1박 특가', sub: '제휴 · 주말 객실 할인' },
  { emoji: '✉️', title: '마음 전하는 손편지 세트', sub: '제휴 · 감성 편지지 기획전' },
  { emoji: '🍽️', title: '기념일 디너, 분위기 좋은 레스토랑', sub: '제휴 · 코스 메뉴 예약 할인' },
]

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
  const [userPosts, setUserPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(MY_POSTS_STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })
  const [writing, setWriting] = useState(false)
  const [draft, setDraft] = useState('')
  const [maskPreview, setMaskPreview] = useState(null) // { text, hits } 게시 전 마스킹 미리보기
  const [count, setCount] = useState(5) // 처음 5개, '더보기'로 확장
  const [sort, setSort] = useState('latest') // 'latest' | 'empathy'

  useEffect(() => {
    localStorage.setItem(MY_POSTS_STORAGE_KEY, JSON.stringify(userPosts))
  }, [userPosts])

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

  // 게시 요청 → 개인정보 마스킹 후, 가려진 항목이 있으면 미리보기 확인 / 없으면 바로 게시
  const requestPublish = async () => {
    if (!draft.trim()) return
    const masked = await maskPIIWithAI(draft.trim())
    if (masked.hits.length > 0) {
      setMaskPreview(masked) // 사용자가 확인 후 게시
    } else {
      doPublish(masked.text)
    }
  }

  const doPublish = (finalText) => {
    setUserPosts(p => [{
      id: 'u' + Date.now(), avatar: AVATARS[1], nick: randomNick(), title: '방금 남긴 고민',
      tag: 'AI 태그: #방금작성', body: finalText, empathy: 0, comfort: 0, comments: 0, author: 'me', daysAgo: 0,
      createdAt: new Date().toISOString(),
    }, ...p])
    setDraft('')
    setWriting(false)
    setMaskPreview(null)
    flash('익명으로 게시됐어요. 개인정보는 자동으로 가려졌어요.')
  }

  const base = [...userPosts, ...ALL_POSTS]
    .filter(p => !hiddenAuthors.includes(p.author))
    .filter(p => !query.trim() || p.nick.includes(query) || p.title.includes(query) || p.body.includes(query) || p.tag.includes(query))

  // 정렬: 최신순(작성 시점) / 공감순(최근 30일 내 공감 많은 순)
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

        <div className="header community-header">
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
          <div className="card" style={{ padding: 15, cursor: 'pointer' }} onClick={() => nav('post', { post: ALL_POSTS[0] })}>
            <div className="row">
              <div className="avatar"><img src="/assets/cats/cat_04_t.png" alt="" /></div>
              <div style={{ flex: 1 }}>
                <p className="row__title">"기념일을 매번 제가 챙겨요"</p>
                <p className="row__sub">유사도 92% · 결혼 3년 차</p>
              </div>
              <span className="badge badge--match">매칭</span>
            </div>
          </div>
          <div className="card" style={{ padding: 15, cursor: 'pointer' }} onClick={() => nav('post', { post: ALL_POSTS[1] })}>
            <div className="row">
              <div className="avatar"><img src="/assets/cats/cat_02_t.png" alt="" /></div>
              <div style={{ flex: 1 }}>
                <p className="row__title">"싸우고 나면 며칠씩 말을 안 해요"</p>
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
            // 게시글 4개마다 광고 1개 삽입 (광고는 순환)
            if ((idx + 1) % 4 === 0) {
              const ad = FEED_ADS[Math.floor(idx / 4) % FEED_ADS.length]
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
