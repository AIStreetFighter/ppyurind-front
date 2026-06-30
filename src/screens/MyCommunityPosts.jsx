import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav'

const MY_POSTS_STORAGE_KEY = 'ppyurind:myCommunityPosts'

function loadMyPosts() {
  try {
    return JSON.parse(localStorage.getItem(MY_POSTS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function MyCommunityPosts({ nav }) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    setPosts(loadMyPosts())
  }, [])

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
              <article key={post.id} className="card my-post-card" onClick={() => nav('post', { post })}>
                <div className="post-head">
                  <div className="avatar"><img src={`/assets/cats/${post.avatar}.png`} alt="" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="post-name">{post.nick || '익명'} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR') : '방금'}</p>
                    <p className="post-title">{post.title}</p>
                    <p className="post-tag">{post.tag}</p>
                  </div>
                  <i className="fa-solid fa-chevron-right chev"></i>
                </div>
                <p className="quote">{post.body.length > 96 ? `${post.body.slice(0, 96)}...` : post.body}</p>
                <div className="reactions">
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

      <BottomNav active="마이" nav={nav} />
    </>
  )
}
