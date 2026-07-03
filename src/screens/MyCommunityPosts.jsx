import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav'
import { listMyCommunityPosts, deleteCommunityPost } from '../api/ppyurindApi'
import { loadMyCommunityPosts, mapCommunityPostToLocal } from '../utils/myCommunityPosts'
import { avatarSrc } from '../data/nicknames'

const MY_POSTS_STORAGE_KEY = 'ppyurind:myCommunityPosts'

export default function MyCommunityPosts({ nav }) {
  const [posts, setPosts] = useState([])
  const [menuOpen, setMenuOpen] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    const localPosts = loadMyCommunityPosts()
    setPosts(localPosts)

    listMyCommunityPosts({ offset: 0, limit: 50 }).then(data => {
      const items = Array.isArray(data) ? data : (data.items || [])
      if (items.length > 0) {
        // API 성공 시 API 결과가 source of truth (내 글만 반환됨)
        const apiPosts = items.map(item => mapCommunityPostToLocal(item))
        setPosts(apiPosts)
      }
      // API가 빈 배열 반환하면 localStorage 폴백 유지
    }).catch(() => {
      // API 실패 시 localStorage 그대로 유지
    })
  }, [])

  const requestDelete = (id) => {
    setMenuOpen(null)
    setConfirmDeleteId(id)
  }

  const doDelete = async (id) => {
    setConfirmDeleteId(null)
    try { await deleteCommunityPost(id) } catch {}
    setPosts(prev => prev.filter(p => String(p.id) !== String(id)))
    try {
      const stored = JSON.parse(localStorage.getItem(MY_POSTS_STORAGE_KEY) || '[]')
      localStorage.setItem(MY_POSTS_STORAGE_KEY, JSON.stringify(stored.filter(p => String(p.id) !== String(id))))
    } catch {}
    flash('게시글을 삭제했어요.')
  }

  return (
    <>
      <div className="phone-body phone-body--flat">
        <div className="topbar">
          <div className="backbar-inline">
            <i className="fa-solid fa-arrow-left" onClick={() => nav('mypage')} style={{ cursor: 'pointer' }}></i>
            <p className="eyebrow" style={{ margin: 0 }}>내가 쓴 글</p>
          </div>
        </div>

        <h1 className="page-title" style={{ marginTop: 6 }}>내가 쓴<br />커뮤니티 글</h1>
        <p className="page-sub">익명으로 남긴 고민 글을 한곳에서 확인해요.</p>

        {posts.length > 0 ? (
          <div className="stack" style={{ marginTop: 22 }}>
            {posts.map(post => (
              <article key={post.id} className="card my-post-card" style={{ cursor: 'pointer' }}>
                <div className="post-head" onClick={() => nav('post', { post })}>
                  <div className="avatar"><img className="pfp" src={avatarSrc(post.id)} alt="" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="post-name">{post.nick || '익명'} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR') : '방금'}</p>
                    {post.title && post.title.trim() !== (post.body || '').trim() && <p className="post-title">{post.title}</p>}
                    <p className="post-tag">{post.tag}</p>
                  </div>
                  <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <i className="fa-solid fa-ellipsis-vertical"
                       style={{ color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px 8px' }}
                       onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)} />
                    {menuOpen === post.id && (
                      <div className="kebab-menu">
                        <div className="kebab-item danger" onClick={() => requestDelete(post.id)}>
                          <i className="fa-solid fa-trash"></i> 게시글 삭제
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="quote" onClick={() => nav('post', { post })}>
                  {post.body.length > 96 ? `${post.body.slice(0, 96)}...` : post.body}
                </p>
                <div className="reactions" onClick={() => nav('post', { post })}>
                  <span><i className="fa-regular fa-heart"></i> 공감 {post.empathy}</span>
                  <span><i className="fa-regular fa-hand"></i> 위로 {post.comfort}</span>
                  <span><i className="fa-regular fa-comment"></i> 댓글 {post.comments}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card empty-state-card">
            <div className="empty-state-card__icon"><i className="fa-solid fa-pen-nib"></i></div>
            <h2>아직 작성한 글이 없어요</h2>
            <p>커뮤니티에서 익명으로 고민을 남기면 이곳에 모여요.</p>
            <button className="cta" onClick={() => nav('community')}>글 쓰러 가기</button>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}

      {confirmDeleteId !== null && (
        <div className="sheet-backdrop" onClick={() => setConfirmDeleteId(null)} style={{ alignItems: 'center', padding: 22, zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '22px 20px' }}>
            <i className="fa-solid fa-trash" style={{ fontSize: 22, color: 'var(--like)', marginBottom: 10 }}></i>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, color: 'var(--ink)' }}>게시글을 삭제할까요?</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--ink-muted)' }}>삭제한 글은 복구할 수 없어요.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cta cta--ghost" style={{ flex: 1, padding: '10px 0' }} onClick={() => setConfirmDeleteId(null)}>취소</button>
              <button className="cta" style={{ flex: 1, padding: '10px 0', background: 'var(--like)' }} onClick={() => doDelete(confirmDeleteId)}>삭제</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="마이" nav={nav} />
    </>
  )
}
