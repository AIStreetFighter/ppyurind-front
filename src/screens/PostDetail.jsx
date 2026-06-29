import { useState } from 'react'
import { nickFromId } from '../data/nicknames'

// 커뮤니티 게시글 상세 — 전체 화면(블라인드 스타일)
// post: 선택된 게시글 객체, nav('community')로 목록 복귀
export default function PostDetail({ nav, post }) {
  const [liked, setLiked] = useState(false)
  const [comforted, setComforted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [draft, setDraft] = useState('')
  const [comments, setComments] = useState(() => ([
    { id: 1, nick: nickFromId('c-' + (post?.id ?? 'x') + '-1'), body: '저도 똑같아요. 먼저 챙기는 사람만 서운하죠…', mine: false },
    { id: 2, nick: nickFromId('c-' + (post?.id ?? 'x') + '-2'), body: '한 번 솔직하게 말해보는 건 어때요? 응원할게요 🙏', mine: false },
  ]))

  if (!post) {
    return (
      <div className="phone-body phone-body--flat">
        <div className="topbar"><div className="backbar-inline"><i className="fa-solid fa-arrow-left" onClick={() => nav('community')} style={{ cursor: 'pointer' }}></i><p className="eyebrow" style={{ margin: 0 }}>커뮤니티</p></div></div>
        <p className="page-sub" style={{ marginTop: 20 }}>게시글을 불러올 수 없어요.</p>
      </div>
    )
  }

  const addComment = () => {
    if (!draft.trim()) return
    setComments(c => [...c, { id: Date.now(), nick: '나', body: draft.trim(), mine: true }])
    setDraft('')
  }

  return (
    <div className="pd">
      {/* 상단 바 */}
      <div className="pd-top">
        <i className="fa-solid fa-arrow-left pd-top-ic" onClick={() => nav('community')}></i>
        <span className="pd-top-title">커뮤니티</span>
        <div className="pd-top-right">
          <i className={`fa-solid ${muted ? 'fa-bell-slash' : 'fa-bell'} pd-top-ic`} onClick={() => setMuted(m => !m)} title="알림 끄기"></i>
          <div style={{ position: 'relative' }}>
            <i className="fa-solid fa-ellipsis-vertical pd-top-ic" onClick={() => setMenuOpen(o => !o)}></i>
            {menuOpen && (
              <div className="kebab-menu">
                <div className="kebab-item" onClick={() => { setMenuOpen(false); nav('community') }}><i className="fa-solid fa-comment"></i> 1:1 대화하기</div>
                <div className="kebab-item danger" onClick={() => { setMenuOpen(false) }}><i className="fa-solid fa-flag"></i> 신고하기</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 본문 스크롤 영역 */}
      <div className="pd-body">
        <div className="post-head">
          <div className="avatar"><img src={`/assets/cats/${post.avatar}.png`} alt="" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="post-name">{post.nick}</p>
            <p className="post-tag">{post.tag}</p>
          </div>
        </div>

        <h1 className="pd-title">{post.title}</h1>
        <p className="pd-content">{post.body}</p>

        {/* 광고 (작은 배너) */}
        <a className="pd-ad" href="#" onClick={e => e.preventDefault()}>
          <span className="ad-tag">AD</span>
          <span className="pd-ad-text">다가오는 기념일, 꽃으로 마음 전하기 · 20% 쿠폰</span>
          <i className="fa-solid fa-chevron-right" style={{ color: 'var(--ink-muted)', fontSize: 11 }}></i>
        </a>

        {/* 반응 바 */}
        <div className="pd-reactions">
          <span className={liked ? 'like' : ''} onClick={() => setLiked(v => !v)}>
            <i className={`${liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> 공감 {post.empathy + (liked ? 1 : 0)}
          </span>
          <span style={{ color: comforted ? 'var(--warm-text)' : '' }} onClick={() => setComforted(v => !v)}>
            <i className={`${comforted ? 'fa-solid' : 'fa-regular'} fa-hand`}></i> 위로 {post.comfort + (comforted ? 1 : 0)}
          </span>
          <span><i className="fa-regular fa-comment"></i> 댓글 {comments.length}</span>
        </div>

        {/* 댓글 목록 */}
        <div className="pd-comments">
          {comments.map(c => (
            <div key={c.id} className="pd-comment">
              <b className={c.mine ? 'pd-comment-mine' : ''}>{c.nick}</b>
              <span>{c.body}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 댓글 입력창 (사진 아이콘 없음) */}
      <div className="pd-input">
        <input
          className="field"
          style={{ flex: 1 }}
          placeholder="따뜻한 댓글을 남겨주세요"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addComment() }}
        />
        <button className="pd-send" onClick={addComment} disabled={!draft.trim()}>등록</button>
      </div>
    </div>
  )
}
