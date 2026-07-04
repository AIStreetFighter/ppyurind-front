import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'

const bars = [
  { day: '월', h: 40, color: 'var(--like)' },
  { day: '화', h: 55, color: 'color-mix(in srgb,var(--brand),var(--like) 40%)' },
  { day: '수', h: 30, color: 'var(--like)' },
  { day: '목', h: 62, color: 'var(--brand)' },
  { day: '금', h: 48, color: 'color-mix(in srgb,var(--brand),var(--like) 40%)' },
  { day: '토', h: 80, color: 'var(--brand)' },
  { day: '일', h: 70, color: 'var(--brand)' },
]

export default function Report({ nav, isDark, toggleTheme }) {
  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <div className="backbar-inline">
            <i className="fa-solid fa-arrow-left" onClick={() => nav('mypage')}></i>
            <p className="eyebrow" style={{ margin: 0 }}>주간 리포트</p>
          </div>
          <div className="topbar__icons">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </div>
        </div>

        <div className="header header--full">
          <h1 className="page-title" style={{ fontSize: 24 }}>5월 셋째 주<br />마음 리포트</h1>
          <p className="page-sub">감정 기록 11회 · 분석 5회</p>
        </div>

        <div className="section-label"><i className="fa-solid fa-chart-line"></i>감정 흐름</div>
        <div className="card">
          <div className="bars" style={{ height: 120 }}>
            {bars.map(b => (
              <div key={b.day} className="bar-col">
                <div className="bar" style={{ height: `${b.h}%`, background: b.color }}></div>
                <span className="bar-day">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-label"><i className="fa-solid fa-hashtag"></i>자주 나타난 감정</div>
        <div className="chip-row">
          {['서운함 ×7', '답답함 ×5', '고마움 ×4', '안도 ×3'].map(v => (
            <span key={v} className="chip">{v}</span>
          ))}
        </div>

        <div className="section-label"><i className="fa-solid fa-arrows-rotate"></i>반복되는 갈등 패턴</div>
        <div className="card" style={{ padding: 17 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>
            대화가 <b>저녁 시간대</b>에 자주 어긋났어요. 둘 다 지친 상태에서 시작된 대화가 많았어요.
          </p>
        </div>

        <div className="insight" style={{ marginTop: 16 }}>
          <div className="il"><i className="fa-solid fa-seedling"></i>이번 주 새롭게 알게 된 나</div>
          <p>화내기 전에 30분만 쉬면, 대화가 훨씬 부드러워진다는 걸 알게 됐어요.</p>
        </div>
      </div>

      <BottomNav active="MY" nav={nav} />
    </>
  )
}
