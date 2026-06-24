import { useState } from 'react'

export default function Translate({ nav }) {
  const [intent, setIntent] = useState('서운함 전달')
  const [tone, setTone] = useState('부드럽게')

  return (
    <div className="phone-body phone-body--flat">
      <div className="backbar">
        <i className="fa-solid fa-chevron-left" onClick={() => nav('analysis')}></i>
        <h2>말투 변환</h2>
      </div>

      <p className="page-sub" style={{ margin: '12px 0 0' }}>전하고 싶은 마음을 골라보세요.</p>
      <div className="chip-row" style={{ marginTop: 14 }}>
        {['서운함 전달', '사과하기', '화해 요청', '부탁하기'].map(v => (
          <span key={v} className={`chip${intent === v ? ' selected' : ''}`} onClick={() => setIntent(v)}>{v}</span>
        ))}
      </div>

      <div className="section-label">내 마음 그대로</div>
      <div className="ba ba--before">
        <span className="ba-label" style={{ color: 'var(--ink-muted)' }}><i className="fa-solid fa-quote-left"></i> 비난형</span>
        너는 맨날 내 말 안 듣고 네 얘기만 하잖아.
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0', color: 'var(--brand)', fontSize: 18 }}>
        <i className="fa-solid fa-arrow-down-long"></i>
      </div>

      <div className="ba ba--after">
        <span className="ba-label" style={{ color: 'var(--brand-soft-text)' }}><i className="fa-solid fa-heart"></i> 요청형 · 부드럽게</span>
        오늘은 내 얘기를 끝까지 들어주면 정말 고마울 것 같아. 그냥 들어주는 것만으로도 큰 힘이 돼.
      </div>

      <div className="section-label">톤 조절</div>
      <div className="chip-row">
        {['부드럽게', '솔직하게', '담백하게'].map(v => (
          <span key={v} className={`chip${tone === v ? ' selected' : ''}`} onClick={() => setTone(v)}>{v}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button className="cta cta--ghost" style={{ flex: 1 }}>
          <i className="fa-regular fa-copy" style={{ marginRight: 6 }}></i>복사
        </button>
        <button className="cta" style={{ flex: 1.6 }}>
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 6 }}></i>카톡으로 보내기
        </button>
      </div>
    </div>
  )
}
