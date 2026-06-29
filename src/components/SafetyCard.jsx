import { useState } from 'react'

// 어디서나 동일하게 쓰는 안전(상담 연결) 카드.
// collapsible=true 면 기록 탭처럼 눌러서 펼치는 토글형, 아니면 항상 펼친 형태.
export default function SafetyCard({ collapsible = false, nav, signal = '' }) {
  const [open, setOpen] = useState(!collapsible)

  return (
    <div className={`safety${collapsible ? ' safety--toggle' : ''}`}>
      <i className="fa-solid fa-shield-heart safety__lead"></i>
      <div style={{ flex: 1 }}>
        <div
          className="safety__head"
          onClick={collapsible ? () => setOpen(o => !o) : undefined}
          style={{ cursor: collapsible ? 'pointer' : 'default' }}
        >
          <h4>혼자 감당하기 버겁다면</h4>
          {collapsible && <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} safety__chev`}></i>}
        </div>
        {open && (
          <div className="safety__body">
            <p>아래 번호는 24시간 · 비밀보장으로 연결돼요.</p>
            <div className="tel-row">
              <a href="tel:1366" className="tel-btn">
                <span><i className="fa-solid fa-phone"></i> 여성긴급전화 1366</span>
                <i className="fa-solid fa-phone tel-btn__end"></i>
              </a>
              <a href="tel:109" className="tel-btn">
                <span><i className="fa-solid fa-phone"></i> 자살예방상담 109</span>
                <i className="fa-solid fa-phone tel-btn__end"></i>
              </a>
            </div>
            <div className="safety__actions">
              <button className="safety-btn"><i className="fa-solid fa-comments" style={{ marginRight: 5 }}></i>쉼터 연결</button>
              <button className="safety-btn">상담기관 연결 <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 10, marginLeft: 3 }}></i></button>
            </div>
            {nav && (
              <button className="safety-checkup" onClick={() => nav('checkup', { signal })}>
                <i className="fa-solid fa-clipboard-check" style={{ marginRight: 6 }}></i>마음건강 자가점검 해보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
