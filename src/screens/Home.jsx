import BottomNav from '../components/BottomNav'

const bars = [
  { day: '월', h: 42, color: 'var(--like)' },
  { day: '화', h: 58, color: 'color-mix(in srgb,var(--brand),var(--like) 40%)' },
  { day: '수', h: 34, color: 'var(--like)' },
  { day: '목', h: 66, color: 'var(--brand)' },
  { day: '금', h: 52, color: 'color-mix(in srgb,var(--brand),var(--like) 40%)' },
  { day: '토', h: 82, color: 'var(--brand)' },
  { day: '일', h: 74, color: 'var(--brand)' },
]

export default function Home({ nav }) {
  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <p className="eyebrow">쀼라인드</p>
          <div className="topbar__icons">
            <i className="fa-regular fa-calendar"></i>
            <i className="fa-regular fa-bell"></i>
          </div>
        </div>

        <div className="header">
          <h1 className="page-title">오늘 마음은<br />어때요, 지우님?</h1>
          <p className="page-sub">5월 21일 화요일</p>
          <div className="header-art">
            <img src="/assets/cats/cat_header.png" alt="" />
          </div>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-pen-to-square"></i>지금 감정 기록하기
        </div>
        <div className="card" style={{ padding: 18, cursor: 'pointer' }} onClick={() => nav('record')}>
          <div className="field" style={{ border: 'none', background: 'transparent', padding: '0 0 14px', color: 'var(--ink-muted)' }}>
            오늘 어떤 일이 있었나요? 속마음을 편하게 적어보세요.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-pill btn-ghost" style={{ flex: 1 }}><i className="fa-solid fa-keyboard"></i> 텍스트</button>
            <button className="btn-pill btn-ghost" style={{ flex: 1 }}><i className="fa-solid fa-microphone"></i> 음성</button>
            <button className="btn-pill btn-ghost" style={{ flex: 1 }}><i className="fa-solid fa-image"></i> 캡처</button>
          </div>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-wave-square"></i>이번 주 감정 흐름
        </div>
        <div className="card">
          <div className="bars">
            {bars.map(b => (
              <div key={b.day} className="bar-col">
                <div className="bar" style={{ height: `${b.h}%`, background: b.color }}></div>
                <span className="bar-day">{b.day}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 13.5, color: 'var(--ink-soft)' }}>주말로 갈수록 마음이 한결 편안해졌어요 🌙</p>
        </div>

        <div className="section-label">
          <i className="fa-regular fa-heart"></i>다가오는 기념일
        </div>
        <div className="card dday">
          <div style={{ textAlign: 'center' }}><div className="dday-num">D-12</div></div>
          <div>
            <p className="row__title" style={{ marginBottom: 3 }}>결혼기념일</p>
            <p className="row__sub">6월 2일 · AI가 추천 문구를 준비하고 있어요</p>
          </div>
        </div>
      </div>

      <BottomNav active="홈" nav={nav} />
    </>
  )
}
