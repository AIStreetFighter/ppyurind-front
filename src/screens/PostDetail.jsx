import { useEffect, useState } from 'react'
import { getCommunityPost, empathyPost, comfortPost, listComments, createComment, createReply, likeComment, deleteComment as apiDeleteComment, reportPost, reportComment, muteAuthor } from '../api/ppyurindApi'
import { avatarSrc } from '../data/nicknames'
import { getReaction, setReaction, setCommentCount } from '../utils/reactions'

// 로컬 저장 글(id가 'u'로 시작)인지 판별
const isLocalPost = (id) => typeof id === 'string' && id.startsWith('u')
const localCommentKey = (postId) => `ppyurind:comments:${postId}`
const MY_COMMENT_IDS_KEY = 'ppyurind:myCommentIds'
const DELETED_COMMENT_IDS_KEY = 'ppyurind:deletedCommentIds'

function getMyCommentIds() {
  try { return new Set(JSON.parse(localStorage.getItem(MY_COMMENT_IDS_KEY) || '[]')) } catch { return new Set() }
}
function addMyCommentId(id) {
  const ids = getMyCommentIds()
  ids.add(String(id))
  localStorage.setItem(MY_COMMENT_IDS_KEY, JSON.stringify([...ids]))
}

function getDeletedCommentIds() {
  try { return new Set(JSON.parse(localStorage.getItem(DELETED_COMMENT_IDS_KEY) || '[]')) } catch { return new Set() }
}
function addDeletedCommentId(id) {
  const ids = getDeletedCommentIds()
  ids.add(String(id))
  localStorage.setItem(DELETED_COMMENT_IDS_KEY, JSON.stringify([...ids]))
}

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
function softDeleteLocalComment(postId, commentId, replyId) {
  const prev = getLocalComments(postId)
  const next = prev.map(c => {
    if (replyId != null) {
      if (c.id !== commentId) return c
      return { ...c, replies: c.replies.map(r => r.id === replyId ? { ...r, deleted: true } : r) }
    }
    return c.id === commentId ? { ...c, deleted: true } : c
  })
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
    deleted: !!c.is_deleted,
    time: c.created_at ? relTime(c.created_at) : '방금',
    likes: c.like_count || 0,
    liked: false,
    replies: (c.replies || []).map(mapComment),
  }
}

export default function PostDetail({ nav, post }) {
  const [detail, setDetail]   = useState(post)
  // 피드에서 누른 공감/위로 상태를 localStorage에서 이어받음 → 상세 진입 시 아이콘 유지
  const [liked, setLiked]     = useState(() => getReaction(post?.id).liked)
  const [comforted, setComforted] = useState(() => getReaction(post?.id).comforted)
  // 서버가 내려주는 실수치를 그대로 신뢰 — liked/comforted로 +1을 더하면
  // 상세 진입 시 이미 반영된 count에 중복으로 더해져 숫자가 부풀어 오르는 문제가 있었음
  const [empathyCount, setEmpathyCount] = useState(() => {
    const base = post?.empathy_count ?? post?.empathy ?? 0
    return base + (isLocalPost(post?.id) && getReaction(post?.id).liked ? 1 : 0)
  })
  const [comfortCount, setComfortCount] = useState(() => {
    const base = post?.comfort_count ?? post?.comfort ?? 0
    return base + (isLocalPost(post?.id) && getReaction(post?.id).comforted ? 1 : 0)
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft]     = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [comments, setComments] = useState([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState(null) // null=게시글 신고, 아니면 신고할 댓글/대댓글 id
  const [commentToast, setCommentToast] = useState('')
  const [commentMenuOpen, setCommentMenuOpen] = useState(null) // commentId or `r:${commentId}:${replyId}`
  const [myCommentIds, setMyCommentIds] = useState(() => getMyCommentIds())
  const [deletedCommentIds, setDeletedCommentIds] = useState(() => getDeletedCommentIds())
  const [commentsLoaded, setCommentsLoaded] = useState(false)

  const flashComment = (msg) => { setCommentToast(msg); setTimeout(() => setCommentToast(''), 2500) }

  const refreshMyCommentIds = () => setMyCommentIds(getMyCommentIds())
  const refreshDeletedIds = () => setDeletedCommentIds(getDeletedCommentIds())

  const reloadComments = async () => {
    if (!post?.id) return
    if (isLocalPost(post.id)) {
      setComments(getLocalComments(post.id))
      setCommentsLoaded(true)
      return
    }
    const data = await listComments(post.id)
    const rows = data?.comments || data?.items || (Array.isArray(data) ? data : [])
    setComments(rows.map(mapComment))
    setCommentsLoaded(true)
  }

  useEffect(() => {
    if (!post?.id) return
    setCommentsLoaded(false)
    if (isLocalPost(post.id)) {
      setComments(getLocalComments(post.id))
      setCommentsLoaded(true)
      return
    }
    getCommunityPost(post.id).then(d => {
      if (!d) return
      setDetail(d)
      // 백엔드가 반환한 has_empathized/has_comforted를 신뢰 소스로 사용 (localStorage 덮어쓰기)
      if (typeof d.has_empathized === 'boolean') {
        setLiked(d.has_empathized)
        setReaction(post.id, { liked: d.has_empathized })
      }
      if (typeof d.has_comforted === 'boolean') {
        setComforted(d.has_comforted)
        setReaction(post.id, { comforted: d.has_comforted })
      }
      // count는 서버 값이 이미 내 반응을 포함한 실수치이므로 그대로 반영 (liked/comforted로 또 더하지 않음)
      if (typeof d.empathy_count === 'number') setEmpathyCount(d.empathy_count)
      if (typeof d.comfort_count === 'number') setComfortCount(d.comfort_count)
    }).catch(() => {})
    reloadComments().catch(() => {})
  }, [post?.id])

  // 삭제 제외 댓글+대댓 수를 캐시 → 피드가 재사용해 "댓글 0" 불일치 제거
  useEffect(() => {
    if (!commentsLoaded || !post?.id) return
    const n = comments.reduce((acc, c) => {
      const top = (c.deleted || deletedCommentIds.has(String(c.id))) ? 0 : 1
      const reps = (c.replies || []).filter(r => !(r.deleted || deletedCommentIds.has(String(r.id)))).length
      return acc + top + reps
    }, 0)
    setCommentCount(post.id, n)
  }, [commentsLoaded, comments, deletedCommentIds, post?.id])

  if (!post) {
    return (
      <div className="phone-body phone-body--flat">
        <div className="topbar"><div className="backbar-inline"><i className="fa-solid fa-arrow-left" onClick={() => nav('community')} style={{ cursor: 'pointer' }}></i><p className="eyebrow" style={{ margin: 0 }}>커뮤니티</p></div></div>
        <p className="page-sub" style={{ marginTop: 20 }}>게시글을 불러올 수 없어요.</p>
      </div>
    )
  }

  const refreshPostReaction = async () => {
    const d = await getCommunityPost(post.id)
    if (typeof d?.has_empathized === 'boolean') {
      setLiked(d.has_empathized)
      setReaction(post.id, { liked: d.has_empathized })
    }
    if (typeof d?.has_comforted === 'boolean') {
      setComforted(d.has_comforted)
      setReaction(post.id, { comforted: d.has_comforted })
    }
    if (typeof d?.empathy_count === 'number') setEmpathyCount(d.empathy_count)
    if (typeof d?.comfort_count === 'number') setComfortCount(d.comfort_count)
  }

  const handleEmpathy = async () => {
    if (isLocalPost(post.id)) {
      const next = !liked
      setLiked(next)
      setReaction(post.id, { liked: next })
      setEmpathyCount(count => Math.max(0, count + (next ? 1 : -1)))
      return
    }
    try {
      const res = await empathyPost(post.id)
        if (res && typeof res.liked === 'boolean') {
          setLiked(res.liked)
          setReaction(post.id, { liked: res.liked })
        } else if (res && typeof res.has_empathized === 'boolean') {
          setLiked(res.has_empathized)
          setReaction(post.id, { liked: res.has_empathized })
        }
        if (res && typeof res.empathy_count === 'number') setEmpathyCount(res.empathy_count)
    } catch {
      try { await refreshPostReaction() } catch {}
      flashComment('공감 처리에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  const handleComfort = async () => {
    if (isLocalPost(post.id)) {
      const next = !comforted
      setComforted(next)
      setReaction(post.id, { comforted: next })
      setComfortCount(count => Math.max(0, count + (next ? 1 : -1)))
      return
    }
    try {
      const res = await comfortPost(post.id)
        if (res && typeof res.comforted === 'boolean') {
          setComforted(res.comforted)
          setReaction(post.id, { comforted: res.comforted })
        } else if (res && typeof res.has_comforted === 'boolean') {
          setComforted(res.has_comforted)
          setReaction(post.id, { comforted: res.has_comforted })
        }
        if (res && typeof res.comfort_count === 'number') setComfortCount(res.comfort_count)
    } catch {
      try { await refreshPostReaction() } catch {}
      flashComment('위로 처리에 실패했어요. 잠시 후 다시 시도해 주세요.')
    }
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

  const isMyComment = (c) => c.nick === '나' || myCommentIds.has(String(c.id))
  const isDeleted = (c) => c.deleted || deletedCommentIds.has(String(c.id))

  const deleteComment = async (commentId, replyId) => {
    setCommentMenuOpen(null)
    const targetId = replyId ?? commentId
    if (isLocalPost(post.id)) {
      addDeletedCommentId(targetId)
      refreshDeletedIds()
      softDeleteLocalComment(post.id, commentId, replyId ?? null)
      setComments(getLocalComments(post.id))
    } else {
      // 서버 삭제 성공 후 목록을 다시 받아 화면을 서버 상태와 맞춘다.
      try {
        await apiDeleteComment(targetId)
      } catch {
        flashComment('댓글 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
        return
      }
      try {
        await reloadComments()
      } catch {
        flashComment('삭제는 처리됐지만 목록 새로고침에 실패했어요. 새로고침 후 확인해주세요.')
        return
      }
    }
    flashComment('댓글을 삭제했어요.')
  }

  const addComment = async () => {
    if (!draft.trim()) return
    const text = draft.trim()
    setDraft('')

    if (isLocalPost(post.id)) {
      const local = { id: Date.now(), nick: '나', body: text, time: '방금', likes: 0, liked: false, replies: [] }
      saveLocalComment(post.id, local)
      setComments(c => [...c, local])
      return
    }

    let created
    try {
      created = await createComment({ postId: post.id, content: text, isAnonymous: true })
      addMyCommentId(created.id)
      refreshMyCommentIds()
    } catch (err) {
      // 401(세션 만료)은 전역 핸들러가 로그인으로 유도 → 임시저장 안 함
      if (err?.status === 401) { setDraft(text); return }
      console.error('댓글 작성 실패:', err?.status, err?.message ?? err)
      setDraft(text)
      flashComment('댓글 등록에 실패했어요. 잠시 후 다시 시도해 주세요.')
      return
    }
    try {
      await reloadComments()
    } catch {
      flashComment('댓글은 저장됐지만 목록 새로고침에 실패했어요. 새로고침 후 확인해주세요.')
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

    let created
    try {
      created = await createReply({ commentId: cid, content: text, isAnonymous: true })
      addMyCommentId(created.id)
      refreshMyCommentIds()
    } catch (err) {
      if (err?.status === 401) { setReplyDraft(text); setReplyTo(cid); return }
      console.error('답글 작성 실패:', err?.status, err?.message ?? err)
      setReplyDraft(text)
      setReplyTo(cid)
      flashComment('답글 등록에 실패했어요. 잠시 후 다시 시도해 주세요.')
      return
    }
    try {
      await reloadComments()
    } catch {
      flashComment('답글은 저장됐지만 목록 새로고침에 실패했어요. 새로고침 후 확인해주세요.')
    }
  }

  const handleReport = (reason) => {
    if (reportTarget) {
      reportComment(post.id, reportTarget, reason).catch(() => {})
    } else {
      reportPost(post.id, reason).catch(() => {})
    }
    setReportOpen(false)
    setReportTarget(null)
    setMenuOpen(false)
    flashComment('신고가 접수됐어요.')
  }

  const openCommentReport = (commentId) => {
    setCommentMenuOpen(null)
    setReportTarget(commentId)
    setReportOpen(true)
  }

  const handleMute = () => {
    muteAuthor(post.id).catch(() => {})
    setMenuOpen(false)
    nav('community')
  }

  const d = detail || post
  // 삭제 제외 댓글+대댓 수 (피드 캐시와 동일 공식)
  const visibleCommentCount = comments.reduce((acc, c) => {
    const top = isDeleted(c) ? 0 : 1
    const reps = (c.replies || []).filter(r => !isDeleted(r)).length
    return acc + top + reps
  }, 0)

  return (
    <div className="pd" onClick={() => commentMenuOpen && setCommentMenuOpen(null)}>
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
          <div className="avatar"><img className="pfp" src={avatarSrc(post.id)} alt="" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="post-name">{d.anonymous_nickname || d.nick}</p>
            <p className="post-tag">{d.tag || (d.ai_tags ? `AI 태그: ${d.ai_tags}` : '')}</p>
          </div>
        </div>

        {(() => {
          const pdBody = d.content || d.body || ''
          const pdTitle = d.title || ''
          const showTitle = pdTitle && pdTitle.trim() !== pdBody.trim()
          return (
            <>
              {showTitle && <h1 className="pd-title">{pdTitle}</h1>}
              <p className="pd-content">{pdBody}</p>
            </>
          )
        })()}

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
          <span><i className="fa-regular fa-comment"></i> 댓글 {commentsLoaded ? visibleCommentCount : (d.comment_count || d.comments || 0)}</span>
        </div>

        <div className="pd-comments">
          {comments.map(c => (
            <div key={c.id} className="pd-comment">
              <div className="pd-c-row">
                <div className="avatar avatar--sm"><img className="pfp" src={avatarSrc(c.id)} alt="" /></div>
                <div className="pd-c-main">
                  <p className="pd-c-nick">{c.nick}</p>
                  {isDeleted(c) ? (
                    <p className="pd-c-body" style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>삭제된 댓글입니다.</p>
                  ) : c.body == null ? (
                    <p className="pd-c-body" style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>관리자에 의해 처리된 댓글입니다.</p>
                  ) : (
                    <p className="pd-c-body">{c.body}</p>
                  )}
                  {!isDeleted(c) && c.body != null && (
                    <div className="pd-c-meta">
                      <span>{c.time}</span>
                      {c.likes > 0 && <span className="static">좋아요 {c.likes}</span>}
                      <span onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>답글</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {!isDeleted(c) && c.body != null && (
                    <i className={`${c.liked ? 'fa-solid' : 'fa-regular'} fa-heart pd-c-heart${c.liked ? ' on' : ''}`} onClick={() => toggleLike(c.id)}></i>
                  )}
                  {!isDeleted(c) && c.body != null && (
                    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                      <i className="fa-solid fa-ellipsis-vertical"
                         style={{ color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px 6px', fontSize: 13 }}
                         onClick={() => setCommentMenuOpen(commentMenuOpen === c.id ? null : c.id)} />
                      {commentMenuOpen === c.id && (
                        <div className="kebab-menu" style={{ right: 0, top: 22, minWidth: 120 }}>
                          {isMyComment(c) ? (
                            <div className="kebab-item danger" onClick={() => deleteComment(c.id, undefined)}>
                              <i className="fa-solid fa-trash"></i> 삭제
                            </div>
                          ) : (
                            <div className="kebab-item danger" onClick={() => openCommentReport(c.id)}>
                              <i className="fa-solid fa-flag"></i> 신고
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(c.replies || []).map(r => (
                <div key={r.id} className="pd-c-row pd-reply">
                  <div className="avatar avatar--sm"><img className="pfp" src={avatarSrc(r.id)} alt="" /></div>
                  <div className="pd-c-main">
                    <p className="pd-c-nick">{r.nick}</p>
                    {isDeleted(r) ? (
                      <p className="pd-c-body" style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>삭제된 댓글입니다.</p>
                    ) : r.body == null ? (
                      <p className="pd-c-body" style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>관리자에 의해 처리된 댓글입니다.</p>
                    ) : (
                      <p className="pd-c-body">{r.body}</p>
                    )}
                    {!isDeleted(r) && r.body != null && (
                      <div className="pd-c-meta">
                        <span>{r.time}</span>
                        {r.likes > 0 && <span className="static">좋아요 {r.likes}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {!isDeleted(r) && r.body != null && (
                      <i className={`${r.liked ? 'fa-solid' : 'fa-regular'} fa-heart pd-c-heart${r.liked ? ' on' : ''}`} onClick={() => toggleLike(c.id, r.id)}></i>
                    )}
                    {!isDeleted(r) && r.body != null && (
                      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <i className="fa-solid fa-ellipsis-vertical"
                           style={{ color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px 6px', fontSize: 13 }}
                           onClick={() => {
                             const key = `r:${c.id}:${r.id}`
                             setCommentMenuOpen(commentMenuOpen === key ? null : key)
                           }} />
                        {commentMenuOpen === `r:${c.id}:${r.id}` && (
                          <div className="kebab-menu" style={{ right: 0, top: 22, minWidth: 120 }}>
                            {isMyComment(r) ? (
                              <div className="kebab-item danger" onClick={() => deleteComment(c.id, r.id)}>
                                <i className="fa-solid fa-trash"></i> 삭제
                              </div>
                            ) : (
                              <div className="kebab-item danger" onClick={() => openCommentReport(r.id)}>
                                <i className="fa-solid fa-flag"></i> 신고
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
        <div className="sheet-backdrop" onClick={() => { setReportOpen(false); setReportTarget(null) }} style={{ alignItems: 'center', padding: 22 }}>
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
