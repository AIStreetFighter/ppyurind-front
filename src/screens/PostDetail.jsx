import { useEffect, useState } from 'react'
import { getCommunityPost, empathyPost, comfortPost, listComments, createComment, createReply, likeComment, reportPost, muteAuthor } from '../api/ppyurindApi'

const AVS = ['cat_01_t', 'cat_02_t', 'cat_03_t', 'cat_04_t']
const avatarFor = (id) => AVS[Math.abs(String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVS.length]

// 로컬 저장 글(id가 'u'로 시작)인지 판별
const isLocalPost = (id) => typeof id === 'string' && id.startsWith('u')
const localCommentKey = (postId) => `ppyurind:comments:${postId}`

function getLocalComments(postId) {
  try { return JSON.parse(localStorage.getItem(localCommentKey(postId)) || '[]') } catch { return [] }
}
function saveLocalComment(postId, comment) {
  const prev = getLocalComments(postId)
  localStorage.setItem(localCommentKey(postId), JSON.stringify([...prev, comment]))
}
function saveLocalReply(postId, commentId, reply) {
  const prev = getLocalComments(postId)
  const next = prev.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c)
  localStorage.setItem(localCommentKey(postId), JSON.stringify(next))
}

function relTime(iso) {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}시간`
  return `${Math.round(hrs / 24)}일`
}

function mapComment(c) {
  return {
    id: c.id,
    nick: c.anonymous_nickname || '익명',
    body: c.content,
    time: c.created_at ? relTime(c.created_at) : '방금',
    likes: c.like_count || 0,
    liked: false,
    replies: (c.replies || []).map(mapComment),
  }
}

export default function PostDetail({ nav, post }) {
  const [detail, setDetail]   = useState(post)
  const [liked, setLiked]     = useState(false)
  const [comforted, setComforted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft]     = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [comments, setComments] = useState([])
  const [reportOpen, setReportOpen] = useState(false)
  const [commentToast, setCommentToast] = useState('')

  const flashComment = (msg) => { setCommentToast(msg); setTimeout(() => setCommentToast(''), 2500) }

  useEffect(() => {
    if (!post?.id) return
    if (isLocalPost(post.id)) {
      // 로컬 저장 글: localStorage에서 댓글 로드
      setComments(getLocalComments(post.id))
      return
    }
    getCommunityPost(post.id).then(d => setDetail(d)).catch(() => {})
    listComments(post.id)
      .then(data => setComments((data.comments || data.items || []).map(mapComment)))
      .catch(() => {})
  }, [post?.id])

  if (!post) {
    return (
      <div className="phone-body phone-body--flat">
        <div className="topbar"><div className="backbar-inline"><i className="fa-solid fa-arrow-left" onClick={() => nav('community')} style={{ cursor: 'pointer' }}></i><p className="eyebrow" style={{ margin: 0 }}>커뮤니티</p></div></div>
        <p className="page-sub" style={{ marginTop: 20 }}>게시글을 불러올 수 없어요.</p>
      </div>
    )
  }

  const handleEmpathy = () => {
    empathyPost(post.id).then(d => {
      if (d?.liked != null) setLiked(d.liked)
    }).catch(() => {})
    setLiked(v => !v)
  }

  const handleComfort = () => {
    comfortPost(post.id).then(d => {
      if (d?.comforted != null) setComforted(d.comforted)
    }).catch(() => {})
    setComforted(v => !v)
  }

  const toggleLike = (cid, rid) => {
    const targetId = rid ?? cid
    likeComment(targetId).catch(() => {})
    setComments(cs => cs.map(c => {
      if (c.id !== cid) return c
      if (rid == null) return { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
      return { ...c, replies: c.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) } : r) }
    }))
  }

  const addComment = async () => {
    if (!draft.trim()) return
    const text = draft.trim()
    setDraft('')

    if (isLocalPost(post.id)) {
      // 로컬 글: localStorage에 저장해서 새로고침해도 유지
      const local = { id: Date.now(), nick: '나', body: text, time: '방금', likes: 0, liked: false, replies: [] }
      saveLocalComment(post.id, local)
      setComments(c => [...c, local])
      return
    }

    try {
      const created = await createComment({ postId: post.id, content: text, isAnonymous: true })
      setComments(c => [...c, mapComment(created)])
    } catch {
      // API 실패 시 draft 복원 + 안내 (가짜 댓글 추가하지 않음)
      setDraft(text)
      flashComment('댓글 저장에 실패했어요. 로그인 후 다시 시도해주세요.')
    }
  }

  const addReply = async (cid) => {
    if (!replyDraft.trim()) return
    const text = replyDraft.trim()
    setReplyDraft(''); setReplyTo(null)

    if (isLocalPost(post.id)) {
      const local = { id: Date.now(), nick: '나', body: text, time: '방금', likes: 0, liked: false }
      saveLocalReply(post.id, cid, local)
      setComments(cs => cs.map(c => c.id === cid ? { ...c, replies: [...c.replies, local] } : c))
      return
    }

    try {
      const created = await createReply({ commentId: cid, content: text, isAnonymous: true })
      setComments(cs => cs.map(c => c.id === cid
        ? { ...c, replies: [...c.replies, mapComment(created)] }
        : c))
    } catch {
      setReplyDraft(text)
      flashComment('답글 저장에 실패했어요. 로그인 후 다시 시도해주세요.')
    }
  }

  const handleReport = (reason) => {
    reportPost(post.id, reason).catch(() => {})
    setReportOpen(false)
    setMenuOpen(false)
  }

  const handleMute = () => {
    muteAuthor(post.id).catch(() => {})
    setMenuOpen(false)
    nav('community')
  }

  const d = detail || post
  const empathyCount = (d.empathy_count ?? d.empathy ?? 0) + (liked ? 1 : 0)
  const comfortCount = (d.comfort_count ?? d.comfort ?? 0) + (comforted ? 1 : 0)

  return (
    <div className="pd">
      {commentToast && <div className="toast">{commentToast}</div>}
      <div className="pd-top">
        <i className="fa-solid fa-arrow-left pd-top-ic" onClick={() => nav('community')}></i>
        <span className="pd-top-title">커뮤니티</span>
        <div className="pd-top-right">
          <div style={{ position: 'relative' }}>
            <i className="fa-solid fa-ellipsis-vertical pd-top-ic" onClick={() => setMenuOpen(o => !o)}></i>
            {menuOpen && (
              <div className="kebab-menu">
                <div className="kebab-item danger" onClick={() => { setMenuOpen(false); setReportOpen(true) }}>
                  <i className="fa-solid fa-flag"></i> 신고하기
                </div>
                <div className="kebab-item danger" onClick={handleMute}>
                  <i className="fa-solid fa-eye-slash"></i> 이 회원 글 숨기기
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pd-body">
        <div className="post-head">
          <div className="avatar"><img src={`/assets/cats/${d.avatar || avatarFor(post.id)}.png`} alt="" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="post-name">{d.anonymous_nickname || d.nick}</p>
            <p className="post-tag">{d.tag || (d.ai_tags ? `AI 태그: ${d.ai_tags}` : '')}</p>
          </div>
        </div>

        <h1 className="pd-title">{d.title || d.body?.slice(0, 30)}</h1>
        <p className="pd-content">{d.content || d.body}</p>

        <a className="pd-ad" href="#" onClick={e => e.preventDefault()}>
          <span className="ad-tag">AD</span>
          <span className="pd-ad-text">다가오는 기념일, 꽃으로 마음 전하기 · 20% 쿠폰</span>
          <i className="fa-solid fa-chevron-right" style={{ color: 'var(--ink-muted)', fontSize: 11 }}></i>
        </a>

        <div className="pd-reactions">
          <span className={liked ? 'like' : ''} onClick={handleEmpathy}>
            <i className={`${liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> 공감 {empathyCount}
          </span>
          <span style={{ color: comforted ? 'var(--warm-text)' : '' }} onClick={handleComfort}>
            <i className={`${comforted ? 'fa-solid' : 'fa-regular'} fa-hand`}></i> 위로 {comfortCount}
          </span>
          <span><i className="fa-regular fa-comment"></i> 댓글 {comments.length}</span>
        </div>

        <div className="pd-comments">
          {comments.map(c => (
            <div key={c.id} className="pd-comment">
              <div className="pd-c-row">
                <div className="avatar avatar--sm"><img src={`/assets/cats/${avatarFor(c.id)}.png`} alt="" /></div>
                <div className="pd-c-main">
                  <p className="pd-c-nick">{c.nick}</p>
                  <p className="pd-c-body">{c.body}</p>
                  <div className="pd-c-meta">
                    <span>{c.time}</span>
                    {c.likes > 0 && <span className="static">좋아요 {c.likes}</span>}
                    <span onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>답글</span>
                  </div>
                </div>
                <i className={`${c.liked ? 'fa-solid' : 'fa-regular'} fa-heart pd-c-heart${c.liked ? ' on' : ''}`} onClick={() => toggleLike(c.id)}></i>
              </div>

              {c.replies.map(r => (
                <div key={r.id} className="pd-c-row pd-reply">
                  <div className="avatar avatar--sm"><img src={`/assets/cats/${avatarFor(r.id)}.png`} alt="" /></div>
                  <div className="pd-c-main">
                    <p className="pd-c-nick">{r.nick}</p>
                    <p className="pd-c-body">{r.body}</p>
                    <div className="pd-c-meta">
                      <span>{r.time}</span>
                      {r.likes > 0 && <span className="static">좋아요 {r.likes}</span>}
                    </div>
                  </div>
                  <i className={`${r.liked ? 'fa-solid' : 'fa-regular'} fa-heart pd-c-heart${r.liked ? ' on' : ''}`} onClick={() => toggleLike(c.id, r.id)}></i>
                </div>
              ))}

              {replyTo === c.id && (
                <div className="pd-reply-input">
                  <input
                    className="field" style={{ flex: 1 }} placeholder="답글을 남겨주세요" autoFocus
                    value={replyDraft} onChange={e => setReplyDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addReply(c.id) }}
                  />
                  <button className="pd-send" onClick={() => addReply(c.id)} disabled={!replyDraft.trim()}>등록</button>
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: 13.5, padding: '20px 0' }}>첫 댓글을 남겨보세요 💬</p>
          )}
        </div>
      </div>

      <div className="pd-input">
        <input
          className="field" style={{ flex: 1 }}
          placeholder="따뜻한 댓글을 남겨주세요"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addComment() }}
        />
        <button className="pd-send" onClick={addComment} disabled={!draft.trim()}>등록</button>
      </div>

      {/* 신고 모달 */}
      {reportOpen && (
        <div className="sheet-backdrop" onClick={() => setReportOpen(false)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, color: 'var(--ink)' }}>신고 사유를 선택해주세요</h3>
            {['스팸·도배', '음란·불건전', '욕설·혐오', '개인정보 노출', '기타'].map(r => (
              <div key={r} className="kebab-item" style={{ borderRadius: 10, marginBottom: 4 }} onClick={() => handleReport(r)}>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
