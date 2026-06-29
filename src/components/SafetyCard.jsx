import { useState } from 'react'

// 어디서나 동일하게 쓰는 안전(상담 연결) 카드.
// collapsible=true 면 기록 탭처럼 눌러서 펼치는 토글형, 아니면 항상 펼친 형태.
// 전화는 tel: 로 휴대폰 전화앱 연결, 외부 기관은 새 탭 링크.
export default function SafetyCard({ collapsible = false, nav, signal = '' }) {
  const [open, setOpen] = useState(!collapsible)

  return (
    <div className={`safety${collapsible ? ' safety--toggle' : ''}`}>
      <i className="fa-solid fa-shield-heart safety__lead"></i>
      <div style={{ flex: 1, minWidth: 0 }}>
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

            {/* 메인: 24시간 정신건강 위기상담 */}
            <a href="tel:1577-0199" className="safety-main">
              <i className="fa-solid fa-phone-volume"></i> 24시간 도움 요청
            </a>

            {/* 개별 긴급 번호 */}
            <a href="tel:1366" className="safety-tel">
              <span className="safety-tel__l"><span className="safety-tel__ic"><i className="fa-solid fa-phone"></i></span>여성긴급전화 1366</span>
              <i className="fa-solid fa-chevron-right safety-tel__r"></i>
            </a>
            <a href="tel:109" className="safety-tel">
              <span className="safety-tel__l"><span className="safety-tel__ic"><i className="fa-solid fa-phone"></i></span>자살예방상담 109</span>
              <i className="fa-solid fa-chevron-right safety-tel__r"></i>
            </a>

            {/* 보조 링크 */}
            <div className="safety-links">
              <a href="https://www.women1366.kr" target="_blank" rel="noreferrer"><i className="fa-solid fa-house"></i>쉼터 연결</a>
              <span className="safety-links__dot">·</span>
              <a href="https://www.mentalhealth.go.kr" target="_blank" rel="noreferrer"><i className="fa-solid fa-building-columns"></i>상담기관 연결</a>
              {nav && (
                <>
                  <span className="safety-links__dot">·</span>
                  <button type="button" onClick={() => nav('checkup', { signal })}><i className="fa-solid fa-clipboard-check"></i>마음건강 자가점검</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
