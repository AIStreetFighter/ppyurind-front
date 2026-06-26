import { useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import PinPad from '../components/PinPad'

export default function Onboarding({ nav, isDark, toggleTheme, onNicknameSave }) {
  const [step, setStep] = useState(1)
  const [relation, setRelation] = useState('신혼')
  const [year, setYear] = useState('2년 차')
  const [concerns, setConcerns] = useState(['대화 단절', '서운함'])
  const [etcText, setEtcText] = useState('')
  const [tone, setTone] = useState('부드럽게')

  const [nickname, setNickname] = useState('')
  const [useLock, setUseLock] = useState(false)
  const [pinSet, setPinSet] = useState(false)
  const [showPin, setShowPin] = useState(false)

  const toggleLock = () => {
    if (useLock) { setUseLock(false); setPinSet(false) }
    else { setUseLock(true); setShowPin(true) }
  }

  const isDating = relation === '연애'
  const yearLabel = isDating ? '연애 연차' : '결혼 연차'
  const yearOptions = isDating
    ? ['1년 미만', '1년 차', '2~3년', '3년 이상', '선택안함']
    : ['1년 미만', '2년 차', '3~5년', '5년 이상', '선택안함']

  const toggleConcern = (v) =>
    setConcerns(prev => prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v])

  const setRelationAndReset = (v) => { setRelation(v); setYear('') }

  return (
    <div className="phone-body phone-body--flat">
      <div className="topbar">
        <div className="backbar-inline">
          {step === 2 && <i className="fa-solid fa-arrow-left" onClick={() => setStep(1)}></i>}
          <p className="eyebrow" style={{ margin: 0 }}>쀼라인드</p>
        </div>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <i className="fa-solid fa-xmark" onClick={() => nav('kakaoLogin')} style={{ cursor: 'pointer' }}></i>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-2)', overflow: 'hidden', marginBottom: 20, border: '1px solid var(--surface-line)' }}>
          <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'var(--brand)', borderRadius: 99, transition: 'width .3s' }} />
        </div>
      </div>

      {step === 1 && (
        <>
          <h1 className="page-title" style={{ marginTop: 0 }}>우리 사이,<br />먼저 알려주세요</h1>
          <p className="page-sub">맞춤 감정 분석을 위해 몇 가지만 여쭤볼게요.</p>
          <p className="onboard-note"><i className="fa-solid fa-circle-info"></i> 추후 마이페이지 맞춤설정에서 언제든 수정할 수 있어요.</p>

          <div className="section-label">관계 상태</div>
          <div className="chip-row">
            {['연애', '신혼', '기혼', '자녀 있음'].map(v => (
              <span key={v} className={`chip${relation === v ? ' selected' : ''}`} onClick={() => setRelationAndReset(v)}>{v}</span>
            ))}
          </div>

          <div className="section-label">{yearLabel}</div>
          <div className="chip-row">
            {yearOptions.map(v => (
              <span key={v} className={`chip${v === '선택안함' ? ' chip--muted' : ''}${year === v ? ' selected' : ''}`} onClick={() => setYear(v)}>{v}</span>
            ))}
          </div>
          {year === '선택안함' && <p className="onboard-hint">괜찮아요. 나중에 마이페이지에서 입력해도 분석에 반영돼요.</p>}

          <div className="section-label">지금 가장 큰 고민 <span className="muted">· 여러 개 선택</span></div>
          <div className="chip-row">
            {['대화 단절', '서운함', '육아 분담', '시댁·처가', '스킨십', '돈 문제', '기타'].map(v => (
              <span key={v} className={`chip${concerns.includes(v) ? ' selected' : ''}`} onClick={() => toggleConcern(v)}>{v}</span>
            ))}
          </div>
          {concerns.includes('기타') && (
            <input
              className="field"
              style={{ width: '100%', marginTop: 11 }}
              placeholder="어떤 고민인지 직접 적어주세요"
              value={etcText}
              onChange={e => setEtcText(e.target.value)}
            />
          )}

          <div className="section-label">AI 응답 톤</div>
          <div className="chip-row">
            {['부드럽게', '현실적으로', '공감 중심', '해결책 중심'].map(v => (
              <span key={v} className={`chip${tone === v ? ' selected' : ''}`} onClick={() => setTone(v)}>{v}</span>
            ))}
          </div>

          <button className="cta" style={{ marginTop: 26 }} onClick={() => setStep(2)}>다음</button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="page-title" style={{ marginTop: 0 }}>어떻게<br />불러드릴까요?</h1>
          <p className="page-sub">커뮤니티에서 보일 익명 닉네임이에요.</p>

          <div className="section-label">닉네임</div>
          <input
            className="field"
            style={{ width: '100%' }}
            placeholder="예) 들풀, 밤하늘, 고요한오후"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={12}
          />
          <p className="onboard-hint">
            {nickname.trim()
              ? <>같은 닉네임이 있으면 뒤에 <b style={{ color: 'var(--ink-soft)' }}>#0421</b> 같은 번호가 흐리게 붙어요.</>
              : '한글·영문 2~12자. 중복돼도 괜찮아요.'}
          </p>

          <div className="section-label"><i className="fa-solid fa-lock"></i>앱 잠금 <span className="muted">· 선택</span></div>
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>비밀번호 4자리로 잠그기</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 3 }}>민감한 기록을 안전하게 보호해요</div>
            </div>
            <div className={`switch${useLock ? '' : ' off'}`} onClick={toggleLock} />
          </div>
          {useLock && pinSet && (
            <p className="onboard-hint" style={{ color: 'var(--brand-soft-text)' }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 5 }}></i>비밀번호가 설정됐어요. 설정에서 변경할 수 있어요.
            </p>
          )}
          {useLock && !pinSet && (
            <p className="onboard-hint" style={{ cursor: 'pointer', color: 'var(--brand)' }} onClick={() => setShowPin(true)}>
              비밀번호를 설정해주세요 ›
            </p>
          )}

          <button
            className="cta"
            style={{ marginTop: 26, opacity: nickname.trim() ? 1 : 0.5 }}
            onClick={() => { if (nickname.trim()) { onNicknameSave?.(nickname.trim()); nav('home') } }}
          >
            감정 기록 시작하기
          </button>
        </>
      )}

      {showPin && (
        <div className="sheet-backdrop" onClick={() => { setShowPin(false); if (!pinSet) { setUseLock(false) } }} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--ink)' }}>앱 잠금 설정</h3>
            <PinPad
              onDone={() => { setPinSet(true); setShowPin(false) }}
              onCancel={() => { setShowPin(false); if (!pinSet) setUseLock(false) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
