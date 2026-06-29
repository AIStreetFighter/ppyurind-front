import ThemeToggle from '../components/ThemeToggle'
import BottomNav from '../components/BottomNav'
import SafetyCard from '../components/SafetyCard'

export default function AnalysisResult({ nav, isDark, toggleTheme }) {
  return (
    <div className="phone-body">
      <div className="topbar">
        <div className="backbar-inline">
          <i className="fa-solid fa-arrow-left" onClick={() => nav('record')}></i>
          <p className="eyebrow" style={{ margin: 0 }}>AI 감정 분석</p>
        </div>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="header header--full" style={{ marginTop: 10 }}>
        <h1 className="page-title" style={{ fontSize: 23 }}>마음을 들여다봤어요</h1>
        <p className="page-sub">방금 기록한 감정을 바탕으로 분석했어요.</p>
      </div>

      <div className="section-label"><i className="fa-solid fa-circle-dot"></i>갈등의 원인</div>
      <div className="card" style={{ padding: 17 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>
          대화의 <b>방식 차이</b>예요. 지우님은 공감을, 배우자는 해결을 먼저 떠올리는 경향이 보여요.
        </p>
      </div>

      <div className="section-label"><i className="fa-solid fa-lightbulb"></i>숨은 욕구</div>
      <div className="card" style={{ padding: 17 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>
          "내 감정을 <b>있는 그대로 인정받고 싶다</b>"는 마음이 가장 컸어요.
        </p>
      </div>

      <div className="section-label"><i className="fa-solid fa-rotate"></i>반복되는 서운함</div>
      <div className="card" style={{ padding: 17, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span className="badge badge--warm">말을 끊김 · 4회</span>
        <span className="badge badge--warm">결론부터 · 3회</span>
      </div>

      <div className="insight" style={{ marginTop: 16 }}>
        <div className="il"><i className="fa-solid fa-bookmark"></i>핵심 인사이트가 도감에 저장됐어요</div>
        <p>"지우님은 해결보다 공감을 먼저 원해요."</p>
      </div>

      <div style={{ marginTop: 16 }}><SafetyCard nav={nav} signal="우울 무기력" /></div>

      <button className="cta" style={{ marginTop: 18 }} onClick={() => nav('translate')}>
        <i className="fa-solid fa-comment-medical" style={{ marginRight: 7 }}></i>이 마음, 말투 바꿔 전하기
      </button>

      <BottomNav active="기록" nav={nav} />
    </div>
  )
}
