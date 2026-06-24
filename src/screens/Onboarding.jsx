import { useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'

export default function Onboarding({ nav, isDark, toggleTheme }) {
  const [relation, setRelation] = useState('신혼')
  const [year, setYear] = useState('2년 차')
  const [concerns, setConcerns] = useState(['대화 단절', '서운함'])
  const [tone, setTone] = useState('부드럽게')

  const toggleConcern = (v) =>
    setConcerns(prev => prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v])

  return (
    <div className="phone-body phone-body--flat">
      <div className="topbar">
        <p className="eyebrow">쀼라인드</p>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-2)', overflow: 'hidden', marginBottom: 20, border: '1px solid var(--surface-line)' }}>
          <div style={{ width: '45%', height: '100%', background: 'var(--brand)', borderRadius: 99 }} />
        </div>
        <h1 className="page-title" style={{ marginTop: 0 }}>우리 사이,<br />먼저 알려주세요</h1>
        <p className="page-sub">맞춤 감정 분석을 위해 몇 가지만 여쭤볼게요.</p>
      </div>

      <div className="section-label">관계 상태</div>
      <div className="chip-row">
        {['연애', '신혼', '기혼', '자녀 있음'].map(v => (
          <span key={v} className={`chip${relation === v ? ' selected' : ''}`} onClick={() => setRelation(v)}>{v}</span>
        ))}
      </div>

      <div className="section-label">결혼 연차</div>
      <div className="chip-row">
        {['1년 미만', '2년 차', '3~5년', '5년 이상'].map(v => (
          <span key={v} className={`chip${v === '2년 차' ? ' chip--age' : ''}${year === v ? ' selected' : ''}`} onClick={() => setYear(v)}>{v}</span>
        ))}
      </div>

      <div className="section-label">지금 가장 큰 고민 <span className="muted">· 여러 개 선택</span></div>
      <div className="chip-row">
        {['대화 단절', '서운함', '육아 분담', '시댁·처가', '스킨십', '돈 문제'].map(v => (
          <span key={v} className={`chip${concerns.includes(v) ? ' selected' : ''}`} onClick={() => toggleConcern(v)}>{v}</span>
        ))}
      </div>

      <div className="section-label">AI 응답 톤</div>
      <div className="chip-row">
        {['부드럽게', '현실적으로', '공감 중심', '해결책 중심'].map(v => (
          <span key={v} className={`chip${tone === v ? ' selected' : ''}`} onClick={() => setTone(v)}>{v}</span>
        ))}
      </div>

      <button className="cta" style={{ marginTop: 26 }} onClick={() => nav('home')}>
        감정 기록 시작하기
      </button>
    </div>
  )
}
