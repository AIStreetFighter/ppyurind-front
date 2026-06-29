import { LEGAL_DOCS } from '../data/legalDocs'

// 약관·개인정보 처리방침 전용 화면. doc='privacy'|'terms', from=돌아갈 화면
export default function Legal({ nav, doc = 'privacy', from = 'kakaoLogin' }) {
  const d = LEGAL_DOCS[doc] || LEGAL_DOCS.privacy

  return (
    <div className="phone-body phone-body--flat">
      <div className="topbar">
        <div className="backbar-inline">
          <i className="fa-solid fa-arrow-left" style={{ cursor: 'pointer' }} onClick={() => nav(from)}></i>
          <p className="eyebrow" style={{ margin: 0 }}>{d.title}</p>
        </div>
      </div>

      <h1 className="page-title" style={{ marginTop: 6, fontSize: 24 }}>{d.title}</h1>
      <p className="legal-updated">{d.updated}</p>
      <p className="legal-intro">{d.intro}</p>

      {d.sections.map((s, i) => (
        <div key={i} className="legal-section">
          <h3 className="legal-h">{s.h}</h3>
          {Array.isArray(s.body)
            ? <ul className="legal-list">{s.body.map((line, j) => <li key={j}>{line}</li>)}</ul>
            : <p className="legal-p">{s.body}</p>}
        </div>
      ))}

      <p className="chk-disclaimer">
        <i className="fa-solid fa-circle-info"></i> 본 문서는 데모용 예시 초안이에요. 실제 서비스 적용 시 법무 검토를 거쳐 확정됩니다.
      </p>

      <button className="cta" style={{ marginTop: 16 }} onClick={() => nav(from)}>확인</button>
      <div style={{ height: 20 }} />
    </div>
  )
}
