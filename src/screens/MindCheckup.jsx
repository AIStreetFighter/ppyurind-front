import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav'
import { CHECKUPS, recommendCheckups, scoreBand } from '../data/mindCheckups'
import { resolveSupport, LEGAL_AID } from '../data/supportPrograms'
import { saveCheckup } from '../api/ppyurindApi'

// 마음건강 자가점검 전용 화면 (목록 → 문항 → 결과 + 지원 안내)
// signal: AI 분석 위험 사유 키워드(있으면 추천 검사 매칭, B안)
export default function MindCheckup({ nav, signal = '' }) {
  const [stage, setStage] = useState('list') // 'list' | 'quiz' | 'result'
  const [activeId, setActiveId] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showAll, setShowAll] = useState(false) // '전체 검사' 펼침 여부 (기본 접힘)

  const recommended = recommendCheckups(signal)
  const otherCheckups = Object.values(CHECKUPS).filter(c => !recommended.includes(c.id))
  const checkup = activeId ? CHECKUPS[activeId] : null

  const startCheckup = (id) => {
    setActiveId(id)
    setAnswers(new Array(CHECKUPS[id].questions.length).fill(null))
    setStage('quiz')
  }

  const setAnswer = (qi, score) => {
    setAnswers(a => { const n = [...a]; n[qi] = score; return n })
  }

  const allAnswered = answers.length > 0 && answers.every(a => a !== null)
  // 역채점 문항(reverse) 지원: 해당 문항은 (최대점수 - 응답)으로 합산
  const maxOpt = checkup ? Math.max(...checkup.options.map(o => o.score)) : 0
  const total = answers.reduce((s, v, i) => {
    if (v == null) return s
    return s + (checkup?.reverse?.includes(i) ? maxOpt - v : v)
  }, 0)

  // 긴급 판단: 안전 점검 양성 or PHQ-9 자해 문항 1점 이상
  const isUrgent = checkup && (
    (checkup.urgentIfAnyYes && answers.some(a => a >= 1)) ||
    (checkup.urgentQuestionIndex >= 0 && answers[checkup.urgentQuestionIndex] >= 1)
  )

  const band = checkup ? scoreBand(checkup, total) : null
  // 결과 색상: 점수 절대값이 아니라 점수대(band) 위치로 판단 (척도마다 만점이 달라서)
  const bandIdx = checkup && band ? checkup.bands.indexOf(band) : 0
  const levelClass = band && (band.level === '양호' || band.level === '안심')
    ? 'ok'
    : (checkup && bandIdx >= checkup.bands.length - 1 ? 'high' : 'mid')
  const support = resolveSupport({ score: total, urgent: !!isUrgent })

  const reset = () => { setStage('list'); setActiveId(null); setAnswers([]) }

  useEffect(() => {
    if (stage === 'result' && checkup && band) {
      saveCheckup({ checkupId: activeId, score: total, level: band.level }).catch(() => {})
    }
  }, [stage])

  return (
    <>
      <div className="phone-body phone-body--flat">
        {/* 상단 바 */}
        <div className="topbar">
          <div className="backbar-inline">
            <i className="fa-solid fa-arrow-left" style={{ cursor: 'pointer' }}
               onClick={() => stage === 'list' ? nav('mypage') : reset()}></i>
            <p className="eyebrow" style={{ margin: 0 }}>마음건강 검사</p>
          </div>
        </div>

        {/* ── 목록 ── */}
        {stage === 'list' && (
          <>
            <h1 className="page-title" style={{ marginTop: 6 }}>지금 마음,<br />가볍게 점검해볼까요?</h1>
            <p className="page-sub">검증된 자가점검 도구예요. 진단이 아니라 도움이 필요한 신호를 확인해요.</p>

            {signal && (
              <p className="onboard-note"><i className="fa-solid fa-wand-magic-sparkles"></i> 최근 기록을 바탕으로 아래 검사를 추천했어요.</p>
            )}

            <div className="section-label">추천 검사</div>
            <div className="stack">
              {recommended.map(id => {
                const c = CHECKUPS[id]
                return (
                  <div key={id} className="card chk-item" onClick={() => startCheckup(id)}>
                    <div className="chk-ic"><i className={`fa-solid ${c.icon}`}></i></div>
                    <div style={{ flex: 1 }}>
                      <p className="row__title">{c.name} <span className="badge badge--match" style={{ marginLeft: 4 }}>추천</span></p>
                      <p className="row__sub">{c.desc}</p>
                    </div>
                    <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
                  </div>
                )
              })}
            </div>

            <div className="section-label" onClick={() => setShowAll(s => !s)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>전체 검사 <span style={{ fontWeight: 400, color: 'var(--ink-muted)', fontSize: 12.5 }}>{otherCheckups.length}종</span></span>
              <i className={`fa-solid fa-chevron-${showAll ? 'up' : 'down'}`} style={{ fontSize: 13, color: 'var(--ink-muted)' }}></i>
            </div>
            {showAll && (
              <div className="stack">
                {otherCheckups.map(c => (
                  <div key={c.id} className="card chk-item" onClick={() => startCheckup(c.id)}>
                    <div className="chk-ic chk-ic--soft"><i className={`fa-solid ${c.icon}`}></i></div>
                    <div style={{ flex: 1 }}>
                      <p className="row__title">{c.name}</p>
                      <p className="row__sub">{c.desc}</p>
                    </div>
                    <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
                  </div>
                ))}
              </div>
            )}

            {/* 무료 법률 상담 */}
            <div className="section-label"><i className="fa-solid fa-scale-balanced"></i>무료 법률 상담</div>
            <p className="sort-hint">이혼·양육·가정폭력 등 관계 문제로 법률 도움이 필요하면 무료로 상담받을 수 있어요.</p>
            <div className="stack">
              {LEGAL_AID.map(l => (
                <div key={l.name} className="card chk-support">
                  <div className="chk-support-head">
                    <p className="row__title">{l.name}</p>
                    <span className="chk-tag">{l.tag}</span>
                  </div>
                  <p className="row__sub" style={{ lineHeight: 1.6 }}>{l.desc}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                    <a className="chk-link" href={`tel:${l.tel}`}><i className="fa-solid fa-phone"></i> {l.tel}</a>
                    <a className="chk-link" href={l.link} target="_blank" rel="noreferrer">{l.linkLabel} <i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                  </div>
                </div>
              ))}
            </div>

            <p className="chk-disclaimer">
              <i className="fa-solid fa-circle-info"></i> 이 검사는 의료 진단이 아니에요. 결과가 걱정되면 전문기관과 상담하는 것을 권장해요.
            </p>
          </>
        )}

        {/* ── 문항 진행 ── */}
        {stage === 'quiz' && checkup && (
          <>
            <h1 className="page-title" style={{ marginTop: 6, fontSize: 22 }}>{checkup.name}</h1>
            <p className="page-sub">{checkup.prompt || `${checkup.period}, 얼마나 자주 그랬는지 골라주세요.`}</p>

            {checkup.intro && (
              <div className="card" style={{ marginTop: 12, padding: 15, display: 'flex', gap: 11, alignItems: 'flex-start', borderColor: 'var(--brand)' }}>
                <i className="fa-solid fa-hand-holding-heart" style={{ color: 'var(--brand)', fontSize: 17, marginTop: 2 }}></i>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink)' }}>{checkup.intro}</p>
                  {checkup.introTel && (
                    <a className="chk-tel" href={`tel:${checkup.introTel}`} style={{ marginTop: 11, display: 'inline-flex' }}>
                      <i className="fa-solid fa-phone"></i> {checkup.introTelLabel || '전화하기'} {checkup.introTel}
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="stack" style={{ marginTop: 8 }}>
              {checkup.questions.map((q, qi) => (
                <div key={qi} className="card chk-q">
                  <p className="chk-q-text"><span className="chk-q-num">{qi + 1}</span>{q}</p>
                  <div className={`chk-opts${checkup.yesno ? ' chk-opts--yn' : ''}`}>
                    {checkup.options.map(opt => (
                      <button
                        key={opt.label}
                        className={`chk-opt${answers[qi] === opt.score ? ' active' : ''}`}
                        onClick={() => setAnswer(qi, opt.score)}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="cta" style={{ marginTop: 20, opacity: allAnswered ? 1 : 0.5 }}
              onClick={() => allAnswered && setStage('result')}>
              결과 보기
            </button>
            <div style={{ height: 20 }} />
          </>
        )}

        {/* ── 결과 ── */}
        {stage === 'result' && checkup && (
          <>
            {isUrgent ? (
              <div className="chk-urgent">
                <i className="fa-solid fa-heart-circle-exclamation"></i>
                <h2>지금은 안전이 가장 먼저예요</h2>
                <p>마음이 많이 힘든 신호가 보여요. 혼자 견디지 말고 아래로 꼭 연락해주세요.</p>
              </div>
            ) : (
              <>
                <h1 className="page-title" style={{ marginTop: 6, fontSize: 22 }}>{checkup.short} 점검 결과</h1>
                <div className="card chk-result-card">
                  <div className="chk-score">
                    <span className="chk-score-num">{total}</span>
                    <span className="chk-score-max">/ {checkup.maxScore}점</span>
                  </div>
                  <span className={`chk-level chk-level--${levelClass}`}>{band.level}</span>
                  <p className="chk-band-text">{band.text}</p>
                </div>
              </>
            )}

            {/* 긴급 연락처 */}
            {support.emergency.length > 0 && (
              <>
                <div className="section-label"><i className="fa-solid fa-phone-volume"></i>지금 바로 연결</div>
                <div className="stack">
                  {support.emergency.map(e => (
                    <a key={e.tel} className="card chk-contact chk-contact--urgent" href={`tel:${e.tel}`}>
                      <div style={{ flex: 1 }}>
                        <p className="row__title">{e.name}</p>
                        <p className="row__sub">{e.desc}</p>
                      </div>
                      <span className="chk-tel"><i className="fa-solid fa-phone"></i> {e.tel}</span>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* 상담기관 */}
            {support.centers.length > 0 && (
              <>
                <div className="section-label"><i className="fa-solid fa-comments"></i>상담받을 수 있는 곳</div>
                <div className="stack">
                  {support.centers.map(c => (
                    <div key={c.name} className="card chk-support">
                      <div className="chk-support-head">
                        <p className="row__title">{c.name}</p>
                        <span className="chk-tag">{c.tag}</span>
                      </div>
                      <p className="row__sub" style={{ lineHeight: 1.6 }}>{c.desc}</p>
                      <a className="chk-link" href={c.link} target="_blank" rel="noreferrer">{c.linkLabel} <i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 국가/지자체 지원사업 */}
            {support.programs.length > 0 && (
              <>
                <div className="section-label"><i className="fa-solid fa-hand-holding-heart"></i>국가·지자체 지원사업</div>
                <p className="sort-hint">상담 비용 부담을 덜 수 있는 바우처 사업이에요. 지역·연도별 조건은 기관에 확인해요.</p>
                <div className="stack">
                  {support.programs.map(p => (
                    <div key={p.name} className="card chk-support">
                      <div className="chk-support-head">
                        <p className="row__title">{p.name}</p>
                        <span className="chk-tag chk-tag--gov">{p.tag}</span>
                      </div>
                      <p className="row__sub" style={{ lineHeight: 1.6 }}>{p.desc}</p>
                      <a className="chk-link" href={p.link} target="_blank" rel="noreferrer">{p.linkLabel} <i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={reset}>다른 검사하기</button>
              <button className="cta" style={{ flex: 1 }} onClick={() => nav('mypage')}>완료</button>
            </div>
            <p className="chk-disclaimer">
              <i className="fa-solid fa-circle-info"></i> 자가점검 결과는 참고용이에요. 진단·치료는 전문가와 상담해주세요.
            </p>
            <div style={{ height: 20 }} />
          </>
        )}
      </div>

      <BottomNav active="MY" nav={nav} />
    </>
  )
}
