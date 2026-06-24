import { useState } from 'react'

export default function Record({ nav }) {
  const [tab, setTab] = useState('텍스트')
  const [emotions, setEmotions] = useState(['답답함', '서운함'])
  const [secret, setSecret] = useState(true)
  const [share, setShare] = useState(false)

  const toggleEmotion = (v) =>
    setEmotions(prev => prev.includes(v) ? prev.filter(e => e !== v) : [...prev, v])

  return (
    <div className="phone-body phone-body--flat">
      <div className="backbar">
        <i className="fa-solid fa-chevron-left" onClick={() => nav('home')}></i>
        <h2>속마음 기록</h2>
      </div>

      <div style={{ marginTop: 14 }} />
      <div className="seg">
        {['텍스트', '음성', '대화 캡처', '직접 입력'].map(t => (
          <div key={t} className={`seg-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      <div className="field" style={{ marginTop: 14, minHeight: 148 }}>
        <span className="ph">남편이 내 말을 끝까지 안 듣고 결론부터 내려서 답답했다. 나는 그냥 들어주길 바랐는데…</span>
      </div>

      <div className="section-label">이 감정에 가까운 건</div>
      <div className="chip-row">
        {['답답함', '서운함', '외로움', '고마움', '불안'].map(v => (
          <span key={v} className={`chip${emotions.includes(v) ? ' selected' : ''}`} onClick={() => toggleEmotion(v)}>{v}</span>
        ))}
      </div>

      <div className="section-label">오늘 나에 대해 새롭게 알게 된 것</div>
      <div className="field"><span className="ph">예) 나는 해결보다 공감을 먼저 원하는 사람이구나.</span></div>

      <div style={{ marginTop: 18 }} className="stack">
        <div className="toggle-row">
          <div>
            <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>나만 보는 비밀 기록</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 3 }}>아무에게도 공개되지 않아요</div>
          </div>
          <div className={`switch${secret ? '' : ' off'}`} onClick={() => setSecret(p => !p)} />
        </div>
        <div className="toggle-row">
          <div>
            <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>기록 후 익명 커뮤니티 공유</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 3 }}>개인정보는 자동 제거돼요</div>
          </div>
          <div className={`switch${share ? '' : ' off'}`} onClick={() => setShare(p => !p)} />
        </div>
      </div>

      <button className="cta" style={{ marginTop: 20 }} onClick={() => nav('analysis')}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 7 }}></i>AI 감정 분석하기
      </button>
    </div>
  )
}
