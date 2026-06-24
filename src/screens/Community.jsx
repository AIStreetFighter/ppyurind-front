import { useState } from 'react'
import BottomNav from '../components/BottomNav'

export default function Community({ nav }) {
  const [filter, setFilter] = useState('전체')

  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <p className="eyebrow">커뮤니티</p>
          <div className="topbar__icons">
            <i className="fa-solid fa-magnifying-glass"></i>
            <i className="fa-regular fa-bell"></i>
          </div>
        </div>

        <div className="header">
          <h1 className="page-title">비슷한 마음들</h1>
          <p className="page-sub">결혼 2년 차, 비슷한 고민을 가진 사람들의 이야기</p>
          <div className="header-art">
            <img src="/assets/cats/cat_pair.png" alt="" style={{ objectPosition: 'center' }} />
          </div>
        </div>

        <div className="chip-row" style={{ marginTop: 18 }}>
          {['전체', '신혼 고민', '육아 분담'].map(v => (
            <span key={v} className={`chip${filter === v ? ' selected' : ''}`} onClick={() => setFilter(v)}>{v}</span>
          ))}
          <span className="chip chip--age"><i className="fa-solid fa-lock" style={{ fontSize: 11 }}></i> 19+</span>
        </div>

        <div className="section-label"><i className="fa-solid fa-medal"></i>이번 달 베스트 공감</div>
        <div className="card">
          <div className="post-head">
            <div className="avatar"><img src="/assets/cats/cat_orange.png" alt="" /></div>
            <div style={{ flex: 1 }}>
              <p className="post-name">결혼 2년 차 · 자녀 없음</p>
              <p className="post-tag">AI 태그: #대화단절 #서운함</p>
            </div>
            <i className="fa-solid fa-ellipsis-vertical" style={{ color: 'var(--ink-muted)' }}></i>
          </div>
          <p className="quote">
            "남편이 내 말을 끝까지 안 듣고 결론만 내려요. 저는 그냥 들어주길 바랐는데…" <span className="link-more">더보기</span>
          </p>
          <div className="reactions">
            <span className="like"><i className="fa-solid fa-heart"></i> 공감 88</span>
            <span><i className="fa-regular fa-thumbs-down"></i> 3</span>
            <span><i className="fa-regular fa-comment"></i> 댓글 24</span>
          </div>
        </div>

        <div className="card locked" style={{ marginTop: 14 }}>
          <div className="blurred">
            <span className="badge badge--age"><i className="fa-solid fa-lock" style={{ fontSize: 10 }}></i> 19+</span>
            <p className="quote" style={{ margin: '12px 0 0' }}>친밀감 고민 · 결혼 2년 차의 솔직한 이야기…</p>
          </div>
          <div className="locked__overlay">
            <span className="badge badge--age"><i className="fa-solid fa-lock" style={{ fontSize: 10 }}></i> 19+ 친밀감 고민</span>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>성인 인증 후 열람할 수 있어요</div>
            <button className="btn-pill">성인 인증하기</button>
          </div>
          <div className="pair-art"><img src="/assets/cats/cat_pair.png" alt="" /></div>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-share-nodes"></i>나와 비슷한 고민 <span className="muted">· 벡터 매칭</span>
        </div>
        <div className="stack">
          <div className="card" style={{ padding: 15 }}>
            <div className="row">
              <div className="avatar"><img src="/assets/cats/cat_navy.png" alt="" /></div>
              <div style={{ flex: 1 }}>
                <p className="row__title">"기념일을 매번 제가 챙겨요"</p>
                <p className="row__sub">유사도 92% · 결혼 3년 차</p>
              </div>
              <span className="badge badge--match">매칭</span>
            </div>
          </div>
          <div className="card" style={{ padding: 15 }}>
            <div className="row">
              <div className="avatar"><img src="/assets/cats/cat_orange.png" alt="" /></div>
              <div style={{ flex: 1 }}>
                <p className="row__title">"싸우고 나면 며칠씩 말을 안 해요"</p>
                <p className="row__sub">유사도 87% · 연애 4년 차</p>
              </div>
              <span className="badge badge--match">매칭</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="커뮤니티" nav={nav} />
    </>
  )
}
