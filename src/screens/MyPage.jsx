import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'

export default function MyPage({ nav, isDark, toggleTheme }) {
  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <p className="eyebrow">마이</p>
          <div className="topbar__icons">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <i className="fa-solid fa-gear"></i>
          </div>
        </div>

        <div className="card" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ display: 'flex' }}>
            <div className="avatar" style={{ width: 54, height: 54 }}>
              <img src="/assets/cats/cat_orange.png" alt="" />
            </div>
            <div className="avatar" style={{ width: 54, height: 54, marginLeft: -16, border: '2px solid var(--surface)' }}>
              <img src="/assets/cats/cat_navy.png" alt="" />
            </div>
          </div>
          <div>
            <p className="row__title" style={{ fontSize: 17 }}>지우 &amp; 도현</p>
            <p className="row__sub">신혼 · 결혼 2년 차 · 응답 톤: 부드럽게</p>
          </div>
        </div>

        <div className="section-label"><i className="fa-solid fa-book"></i>나만의 도감</div>
        <div className="card" style={{ padding: '6px 18px' }}>
          <div className="menu-item">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span className="mlabel">나만의 비밀 도감</span>
            <span className="badge badge--match" style={{ marginLeft: 'auto' }}>12</span>
          </div>
          <div className="menu-item">
            <i className="fa-solid fa-heart"></i>
            <span className="mlabel">배우자 이해 노트</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span className="mlabel">건드리면 안 되는 주제</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item">
            <i className="fa-solid fa-gift"></i>
            <span className="mlabel">흘려 말한 위시리스트</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
        </div>

        <div className="section-label"><i className="fa-solid fa-folder-open"></i>기록 &amp; 리포트</div>
        <div className="card" style={{ padding: '6px 18px' }}>
          <div className="menu-item">
            <i className="fa-solid fa-pen-nib"></i>
            <span className="mlabel">내 감정 기록</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item">
            <i className="fa-solid fa-chart-pie"></i>
            <span className="mlabel">주간 · 월간 리포트</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item">
            <i className="fa-solid fa-comments"></i>
            <span className="mlabel">내가 쓴 커뮤니티 글</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
        </div>

        <div className="section-label"><i className="fa-solid fa-shield-halved"></i>설정</div>
        <div className="card" style={{ padding: '6px 18px' }}>
          <div className="menu-item">
            <i className="fa-solid fa-sliders"></i>
            <span className="mlabel">AI 응답 톤 변경</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
            <span className="mlabel">{isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item">
            <i className="fa-solid fa-lock"></i>
            <span className="mlabel">개인정보 · 공유 설정</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
        </div>
      </div>

      <BottomNav active="마이" nav={nav} />
    </>
  )
}
