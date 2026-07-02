import { useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import PinPad from '../components/PinPad'
import { saveOnboarding, setPin as apiSetPin } from '../api/ppyurindApi'
import { enableLock } from '../utils/appLock'

// 라벨 → relationship_years(정수, 구간 하한값). 과거 라벨도 하위호환 유지.
const YEAR_TO_NUM = {
  '1년 미만': 0, '1~2년': 1, '3~5년': 3, '6~10년': 6, '11~20년': 11, '20년 이상': 20,
  '1년 차': 1, '2년 차': 2, '2~3년': 2, '5년 이상': 5, '3년 이상': 3, '선택안함': null,
}

export default function Onboarding({ nav, isDark, toggleTheme, nickname: initialNickname, onNicknameSave, onConcernsSave }) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [relation, setRelation] = useState('신혼')
  const [year, setYear] = useState('1~2년')
  const [concerns, setConcerns] = useState(['대화 단절', '서운함'])
  const [etcText, setEtcText] = useState('')
  const [tone, setTone] = useState('부드럽게')

  const [nickname, setNickname] = useState(initialNickname && initialNickname !== '지우' ? initialNickname : '')
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
    : relation === '신혼'
      ? ['1년 미만', '1~2년', '2~3년', '3~5년', '선택안함']
      : ['1년 미만', '1~2년', '3~5년', '6~10년', '11~20년', '20년 이상', '선택안함']

  const CONCERN_OPTIONS = {
    '연애':    ['대화 단절', '서운함', '성격·가치관 차이', '스킨십·친밀감', '경제·소비 갈등', '신뢰 문제', '미래 계획', '양가 가족 문제', '기타'],
    '신혼':    ['대화 단절', '서운함', '가사 분담', '아이 계획', '시댁·처가 갈등', '경제·소비 갈등', '스킨십·친밀감', '기타'],
    '기혼':    ['대화 단절', '서운함', '가사 분담', '아이 계획', '시댁·처가 갈등', '경제·소비 갈등', '스킨십·친밀감', '성격·가치관 차이', '기타'],
    '자녀 있음': ['육아 분담', '대화 단절', '서운함', '가사 분담', '경제·소비 갈등', '시댁·처가 갈등', '스킨십·친밀감', '성격·가치관 차이', '기타'],
  }
  const concernOptions = CONCERN_OPTIONS[relation] || CONCERN_OPTIONS['기혼']

  const toggleConcern = (v) =>
    setConcerns(prev => prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v])

  const setRelationAndReset = (v) => { setRelation(v); setYear(''); setConcerns([]) }

  return (
    <div className="phone-body phone-body--flat">
      <div className="topbar">
        <div className="backbar-inline">
          {step === 2 && <i className="fa-solid fa-arrow-left" onClick={() => setStep(1)}></i>}
          <p className="eyebrow" style={{ margin: 0 }}>쀼라인드</p>
        </div>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-2)', overflow: 'hidden', marginBottom: 20, border: '1px solid var(--surface-line)' }}>
          <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'var(--brand)', borderRadius: 99, transition: 'width .3s' }} />
        </div>
      </div>

      {step === 1 && (
        <>
          {nickname.trim() ? (
            <>
              <h1 className="page-title" style={{ marginTop: 0 }}>안녕하세요<br />{nickname.trim()}님 👋</h1>
              <p className="page-sub">원활한 분석과 서비스 제공을 위해<br />아래 항목에 응답해주세요.</p>
            </>
          ) : (
            <>
              <h1 className="page-title" style={{ marginTop: 0 }}>우리 사이,<br />먼저 알려주세요</h1>
              <p className="page-sub">맞춤 감정 분석을 위해 몇 가지만 여쭤볼게요.</p>
            </>
          )}
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
            {concernOptions.map(v => (
              <span key={v} className={`chip${v === '기타' ? ' chip--muted' : ''}${concerns.includes(v) ? ' selected' : ''}`} onClick={() => toggleConcern(v)}>{v}</span>
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
              ? <>가입 때 정한 닉네임이에요. 여기서 바꿀 수도 있어요. 같은 닉네임이 있으면 뒤에 <b style={{ color: 'var(--ink-soft)' }}>#0421</b> 같은 번호가 흐리게 붙어요.</>
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
            style={{ marginTop: 26, opacity: (nickname.trim() && !saving) ? 1 : 0.5 }}
            onClick={async () => {
              if (!nickname.trim() || saving) return
              setSaving(true)
              setSaveError('')
              try {
                await saveOnboarding({
                  nickname: nickname.trim(),
                  relationshipStatus: [relation],
                  relationshipYears: YEAR_TO_NUM[year] ?? null,
                  mainConcernTopics: concerns.filter(c => c !== '기타'),
                  concernEtc: concerns.includes('기타') ? etcText : null,
                  aiTone: tone,
                })
                // 앱 잠금 PIN은 PinPad onDone 시점에 이미 저장됨(enableLock + apiSetPin)
                onNicknameSave?.(nickname.trim())
                onConcernsSave?.(concerns)
                nav('home')
              } catch (err) {
                // 저장 실패 시 조용히 넘어가지 않고 사용자에게 알린다.
                setSaveError(err?.message || '저장에 실패했어요. 잠시 후 다시 시도해주세요.')
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? '저장 중...' : '감정 기록 시작하기'}
          </button>
          {saveError && (
            <p style={{ margin: '12px 0 0', fontSize: 13.5, color: '#e74c3c', textAlign: 'center' }}>
              {saveError}
            </p>
          )}
        </>
      )}

      {showPin && (
        <div className="sheet-backdrop" onClick={() => { setShowPin(false); if (!pinSet) { setUseLock(false) } }} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--ink)' }}>앱 잠금 설정</h3>
            <PinPad
              onDone={(pin) => {
                enableLock(pin)                 // 로컬 잠금 활성화(검증용)
                apiSetPin(pin).catch(() => {})  // 백엔드 저장(영속, best-effort)
                setPinSet(true); setShowPin(false)
              }}
              onCancel={() => { setShowPin(false); if (!pinSet) setUseLock(false) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
