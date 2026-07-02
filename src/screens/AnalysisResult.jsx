import { useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import BottomNav from '../components/BottomNav'
import SafetyCard from '../components/SafetyCard'
import { exportReportPdf } from '../utils/exportPdf'

export default function AnalysisResult({ nav, isDark, toggleTheme, nickname, result, rawContent, shared }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const who = nickname || '지우'
  const r = result // 실제 AI 분석 결과 (없으면 예시)
  return (
    <div className="phone-body report-print">
      <div className="topbar">
        <div className="backbar-inline">
          <i className="fa-solid fa-arrow-left" onClick={() => nav('record')}></i>
          <p className="eyebrow" style={{ margin: 0 }}>AI 감정 분석</p>
        </div>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <div style={{ position: 'relative' }}>
            <i className="fa-solid fa-ellipsis" style={{ cursor: 'pointer' }} onClick={() => setMenuOpen(o => !o)}></i>
            {menuOpen && (
              <div className="kebab-menu">
                <div className="kebab-item" onClick={() => { setMenuOpen(false); exportReportPdf() }}>
                  <i className="fa-solid fa-file-arrow-down"></i> PDF로 내보내기
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header header--full" style={{ marginTop: 10 }}>
        <h1 className="page-title" style={{ fontSize: 23 }}>마음을 들여다봤어요</h1>
        <p className="page-sub">{r ? 'AI가 방금 기록한 감정을 분석했어요.' : '방금 기록한 감정을 바탕으로 분석했어요.'}</p>
      </div>

      {/* 감지된 감정 (실제 분석 결과일 때) */}
      {r && (r.primary_emotion || r.secondary_emotion) && (
        <>
          <div className="section-label"><i className="fa-solid fa-heart"></i>지금 느끼는 감정</div>
          <div className="card" style={{ padding: 17, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {r.primary_emotion && <span className="badge badge--match">{r.primary_emotion}</span>}
            {r.secondary_emotion && <span className="badge badge--warm">{r.secondary_emotion}</span>}
          </div>
        </>
      )}

      <div className="section-label"><i className="fa-solid fa-circle-dot"></i>갈등의 원인</div>
      <div className="card" style={{ padding: 17 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>
          {r?.conflict_cause
            ? <><b>{r.conflict_cause}</b>에서 비롯된 마음으로 보여요. 충분히 그럴 만한 상황이에요.</>
            : <>대화의 <b>방식 차이</b>예요. {who}님은 공감을, 배우자는 해결을 먼저 떠올리는 경향이 보여요.</>}
        </p>
      </div>

      <div className="section-label"><i className="fa-solid fa-lightbulb"></i>숨은 욕구</div>
      <div className="card" style={{ padding: 17 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>
          {r?.hidden_need
            ? <>"<b>{r.hidden_need}</b>"는 마음이 가장 컸어요.</>
            : <>"내 감정을 <b>있는 그대로 인정받고 싶다</b>"는 마음이 가장 컸어요.</>}
        </p>
      </div>

      {/* 추천 행동 (실제 분석 결과일 때) */}
      {r?.recommended_action && (
        <>
          <div className="section-label"><i className="fa-solid fa-comment-dots"></i>이렇게 전해보면 어때요</div>
          <div className="card" style={{ padding: 17 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink)' }}>{r.recommended_action}</p>
          </div>
        </>
      )}

      <div className="insight" style={{ marginTop: 16 }}>
        <div className="il"><i className="fa-solid fa-bookmark"></i>핵심 인사이트가 도감에 저장됐어요</div>
        <p>"{r?.new_self_insight || `${who}님은 해결보다 공감을 먼저 원해요.`}"</p>
      </div>

      {/* 공유 완료 / 공유 실패 표시 */}
      {shared === true && (
        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 12, background: 'rgba(80,180,120,0.10)', border: '1.5px solid rgba(80,180,120,0.35)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="fa-solid fa-check-circle" style={{ color: '#50b478' }}></i>
          <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>커뮤니티에 익명으로 공유됐어요.</span>
        </div>
      )}
      {shared === false && result && (
        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 12, background: 'rgba(200,100,100,0.08)', border: '1.5px solid rgba(200,100,100,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="fa-solid fa-circle-xmark" style={{ color: '#c46464' }}></i>
          <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>공유에 실패했어요. 커뮤니티 탭에서 다시 시도해보세요.</span>
        </div>
      )}

      {/* 위험 신호 감지 시 safety_action 안내 배너 */}
      {r?.safety_action && (
        <div style={{
          marginTop: 16, padding: '14px 16px', borderRadius: 14,
          background: r.risk_level === 'danger' ? 'rgba(232,80,80,0.10)' : 'rgba(232,143,80,0.10)',
          border: `1.5px solid ${r.risk_level === 'danger' ? 'rgba(232,80,80,0.35)' : 'rgba(232,143,80,0.35)'}`,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <i className={`fa-solid ${r.risk_level === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}
             style={{ color: r.risk_level === 'danger' ? '#e85050' : '#e88f50', marginTop: 2, flexShrink: 0 }}></i>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
              {r.risk_level === 'danger' ? '지금 많이 힘드신 것 같아요' : '마음이 많이 지쳐있는 것 같아요'}
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)' }}>{r.safety_action}</p>
            {Array.isArray(r.safety_categories) && r.safety_categories.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {r.safety_categories.map(cat => (
                  <span key={cat} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,0,0,0.08)', color: 'var(--ink-soft)' }}>{cat}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* risk_level에 따라 SafetyCard 표시 방식 결정 */}
      {(r?.risk_level === 'danger' || r?.risk_level === 'caution') ? (
        <div style={{ marginTop: 16 }}><SafetyCard nav={nav} signal={r.safety_reason || '우울 무기력'} /></div>
      ) : (
        <div style={{ marginTop: 16 }}><SafetyCard collapsible nav={nav} signal="우울 무기력" /></div>
      )}

      <button className="cta" style={{ marginTop: 18 }} onClick={() => nav('translate', { initialText: rawContent || '' })}>
        <i className="fa-solid fa-comment-medical" style={{ marginRight: 7 }}></i>이 마음, 말투 바꿔 전하기
      </button>

      <BottomNav active="기록" nav={nav} />
    </div>
  )
}
